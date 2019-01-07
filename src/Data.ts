import axios, {AxiosError, AxiosResponse} from 'axios';

class status {
    success: boolean;
    status: number;

    constructor(success, status) {
        this.success = success;
        this.status = status;
    }
}

export default abstract class Data<T> {
    //This helps us later on, when we flatten. Allows us to know when a property is actually a referential class.
    static isDataType = true;
    //A store of all data object, by ID. This ensures that there is always a link, and that nothing gets GCed away.
    static REGISTRY: Map<string, Data<any>> = new Map<string, Data<any>>();
    /**Abstract*/
        //This must be overridden in each class, it allows us to keep track of when the last refresh occurred for that class.
    static timeOfLastLoad: number;
    //A unique prefix assigned to the class. This way, items can share an id as long as they are of different types.
    static prefix;

    /**
     * Basic properties.
     */
        //The identifier.
    id: number;
    //A store of all data in object form. Allows flexible server-updates.
    data: object = {};
    //Similar to data, instead, stores only updated properties.
    updated: object = {};
    //This object can notify other entities of changes through lambda functions.
    subscriptions: Map<any, (Data) => void> = new Map<any, (Data) => void>();
    //Stores own type for filtering.
    // @ts-ignore
    type: typeof Data;


    /**
     * Index related
     * We maintain two copies so that we can delete items if necessary.
     */

    /**
     * The master index that holds all indices.
     * Each type is given its own subindex.
     * The index relates a value, of any, to an object {}.
     * This object relates {id: true, id: true}
     */
    static INDICES: Map<typeof Data, Map<string, { indexor: (d: Data<any>) => any, index: Map<any, any> }>> = new Map();

    /**
     * The indices this particular object is a part of.
     * Stores as an object: {indexName: value, ...}
     * Value stores the value this was indexed on.
     * Only stores for indices this is a part of.
     **/
    indices: any = {};


    /** Stores an object of form {prop1: type1, prop2:type2}
     * This allows us to tell which properties are references when flattening.
     * **/
    abstract propTypeMap: any;

    private static config = {
        API: undefined,
        mapResponseToData: (data: any) => data
    }

    constructor(data = {}, id = undefined) {
        /** If we ever have to create locally, a negative id ensures no collision. **/
        if (id == undefined) {
            this.id = -(Data.REGISTRY.size + 1)
        } else {
            this.id = id;
        }
        // @ts-ignore
        //Believe it or not this works. Since JS classes are really functions, this gets the function creating this instance...aka the class.
        this.type = this.constructor;
        this.data = {...data};
    }


    /** Configuration **/

    //<editor-fold name = "Configuration">

    /**
     * Sets a new data mapping function to be used for all server requests.
     * For example, if your server responds:
     * {
     *     meta-data...other props which you want to use.
     *     data: {
     *         id: ~~
     *         ...relevant data for object.
     *     }
     * }
     *
     * the mapper will recieve the whole object, and should map:
     * (data) => data.data;
     */
    static setResponseDataMapping(mapper: (data: any) => any): any {
        this.config.mapResponseToData = mapper;
    }

    /**
     * Used internally to getProp the currently set response mapper from configuration.
     */
    private static getResponseMapper(): (data: any) => any {
        return Data.config.mapResponseToData;
    }

    /**
     * Used to set the default API that will be prepended to all requests.
     */
    static setAPI(api: string) {
        this.config.API = api;
    }

    //</editor-fold>

    /** Indexing **/

    /**
     * Whether or not an index exists for the particular type.
     */
    static hasTypeIndex(): boolean {
        return this.INDICES.has(this);
    }

    static getTypeIndex(): Map<string, { indexor: (d: Data<any>) => any, index: Map<any, any> }> {
        return this.INDICES.get(this);
    }

    /**
     * Init a new root index for the type.
     */

    static createTypeIndex(): boolean {
        if (!this.hasTypeIndex()) {
            this.INDICES.set(this, new Map<string, { indexor: (d: Data<any>) => any, index: Map<any, any> }>());
            return true;
        } else {
            return false
        }
    }

    //Deal with individual index within a type.
    static hasIndex(indexName: string): boolean {
        return this.hasTypeIndex() && this.getTypeIndex().has(indexName);
    }

    static getIndex(indexName: string): { indexor: (d: Data<any>) => any, index: Map<any, any> } {
        return this.getTypeIndex().get(indexName);
    }


    static createIndex(index: string, indexor: (d: Data<any>) => any): boolean {
        if (this.hasTypeIndex() && !this.hasIndex(index)) {
            this.getTypeIndex().set(index, {indexor, index: new Map<any, any>()});
            return true;
        } else {
            return false;
        }
    }

    static createSimpleIndex(index: string, property: string){
        this.createIndex(index, (d: Data<any>) => {
            return d.raw(property);
        })
    }

    /**
     * Run an object against the indices named by its type.
     */
    static indexObject(obj: Data<any>): boolean {
        if (this.hasTypeIndex()) {
            const typeIndices = this.getTypeIndex();
            [...typeIndices.entries()].forEach(([name, {indexor, index}]) => {
                const value = indexor(obj);

                if (value != undefined) { //First, let's clear this object from any indices where it already is, for this name.
                    //Note that we don't use value here because we use what the object was PREVIOUSLY indexed on.
                    if (obj.indices[name] != undefined) {
                        delete index.get(obj.indices[name])[obj.id];
                        //Let's clear this index if needed.
                        if (Object.keys(index.get(obj.indices[name])).length == 0) {
                            index.delete(obj.indices[name]);
                        }
                    }

                    //If this is the first time we've had this value we need to add a new index on that value.
                    if (!index.has(value)) {
                        index.set(value, {})
                    }

                    //Now, let's add this object to its index.
                    index.get(value)[obj.id] = true;
                    obj.indices[name] = value;
                }
            });
            return true
        } else {
            return false;
        }
    }

    index() {
        this.type.indexObject(this);
    }

    static searchIndex(indexName: string, value: any): number[] {
        const index = this.getIndex(indexName).index.get(value);
        if (index != undefined) {
            return Object.keys(index).map(Number);
        } else {
            return [];
        }
    }
    static searchIndexAndGet(indexName: string, value: any):Data<any>[]{
        return this.getMultiple(this.searchIndex(indexName, value));
    }
    static async searchIndexAndGetOrLoad(indexName: string, value: any): Promise<Data<any>[]>{
        return this.getOrLoadMultiple(this.searchIndex(indexName, value))
    }

    /**Static Data Methods**/

    //<editor-fold name = "Static Data Methods">
    /**
     * Returned URL should not contain a trailing slash.
     * @example
     * /path/to/type
     *
     * We use an abstract method here, due to typescript limitation, but instantiate as a static abstract.
     * @override
     */
    static getURL() {
        return `${this.config.API}/${this.prefix}`;
    }

    /**
     * This loads all items of this type from the server.
     */
    static async loadAll(): Promise<status> {
        // @ts-ignore
        return await this.fetchAndMerge(this.getURL());
    }

    /**
     * This works just like the loadAll above, with one difference. It concatenates 'updated' to the url, assuming the API will use this to only show relevant data.
     */
    //TODO: Pass last update time.
    static async refreshAll(): Promise<status> {
        // @ts-ignore
        return await Data.fetchAndMerge(`${type.getURL()}/updated`)
    }


    /**
     * This is only used internally by loadAll and refreshAll.
     */
    private static async fetchAndMerge(url: string): Promise<status> {
        try {
            const response = await axios(url)
            this.merge(Data.getResponseMapper()(response.data));
            return new status(true, response.status)
        } catch (e) {
            throw new Error(e);
            return new status(false, 100);
        }

    }

    /**
     * Whether or not an item of the given id exists. Should always be used before getProp.
     */
    static has(id: number, prefix = this.prefix): boolean {
        return Data.REGISTRY.has(prefix + '.' + id);
    }

    static hasMultiple(ids: number[], prefix = this.prefix): boolean {
        return ids.reduce((prevValid: boolean, id: number) => prevValid && this.has(id), true);
    }

    /**
     * Does not perform loads, just gets the requested item by id.
     */
    static get(id: number, prefix = this.prefix): Data<any> {
        return Data.REGISTRY.get(prefix + '.' + id);
    }

    /**
     * Either gets the item from the registry, or makes a new one and adds it to the registry.
     * Does not do any loading.
     */

    static getOrMake(id: number) {
        if (this.has(id)) {
            return this.get(id);
        } else {
            // @ts-ignore
            return new this(undefined, id).add();
        }
    }

    /**
     *Returns an array of multiple items from registry.
     */
    static getMultiple(ids: number[]): Data<any>[] {
        return ids.map(id => this.get(id));
    }

    /**
     * This method allows filtering of all items of a particular type.
     */
    static getAll(): Data<any>[] {
        return [...Data.REGISTRY.values()].filter(v => v.type == this);
    }

    /**
     * Sometimes we want an object and want to abstract away whether or not it needs loading.
     * This returns the item by id through a promise.
     * recommended use is with the await operator.
     */
    static async getOrLoad(id: number): Promise<Data<any>> {
        if (this.has(id)) {
            return this.get(id);
        } else {
            /*TODO: Is this the fastest way?
            This goes off the assumption that may as well load everything...we'll need it eventually.
             */
            // @ts-ignore
            const loaded = await this.loadAll();
            if (this.has(id)) {
                return this.get(id);
            } else {
                throw new Error('Tried to load data, but item of requested id still not found.')
            }
        }
    }

    /**
     * Same thing as getProp or load but does it simultaneously for multiple items.
     */
    static async getOrLoadMultiple(ids: number[]): Promise<Data<any>[]> {
        if (this.hasMultiple(ids)) {
            return this.getMultiple(ids);
        } else {
            // @ts-ignore
            const loaded = await this.loadAll();
            if (this.hasMultiple(ids)) {
                return this.getMultiple(ids);
            } else {
                throw new Error('Tried to load data, but item of requested id still not found.')
            }
        }
    }

    /**
     * Sometimes we have an array of objects, and specifically want to wait for all of those to load.
     * Instead of using Promise.all (which is bound to be rewritten as boilerplate many times...)
     * This takes in an array of objects, and returns an array of statuses (through promise)
     */
    static async loadMultiple<T extends Data<T>>(objects: T[]): Promise<status[]> {
        return Promise.all(objects.map(obj => obj.load()))
    }

    /** Takes an array of data objects. JSON, not Dummy.
     * instantiates local class objects for them.
     * This is meant primarily to take raw data from the server and merge it to the local store.
     * TODO: Extend this to allow caching and offline save.
     * **/
    static merge(objects: any[]) {
        objects.forEach(obj => {
            const id = obj.id;
            const data = {...obj};
            delete data.id;
            //Now we must create class objects, or update existing ones, for the type passed in.
            if (Data.has(id, this.prefix)) {
                //Update existing object.
                Data.get(id, this.prefix).update(data, true);
            } else {
                //Or create a new one and add it to the registry.
                // @ts-ignore
                (new this(data, id)).add()
            }
        })
    }

    //TODO: Build these.
    /**Returns whether or not there is enough dependency data available to construct.**/
    abstract canCreate(): boolean;

    /**Creates a new data object of the respective class**/
    abstract create({data, id}): Data<T>;

    //</editor-fold>

    /**Instance Data Methods**/

    //<editor-fold name = "Instance Data Methods">
    /**
     * When a data object is instantiated it is not automatically registered. This registers it.
     * If data object is created using built in methods such as load, loadAll, etc, it is automatically added.
     */
    add(): Data<T> {
        Data.REGISTRY.set(this.type.prefix + '.' + this.id, this);
        return this;
    }

    remove(): boolean {
        Data.REGISTRY.delete(this.type.prefix + '.' + this.id);
        return true;
    }

    /**
     * Subscribes to changes in the data object. key must be unique.
     */
    subscribe(key: any, handler: (d: Data<T>) => void): boolean {
        if (key) {
            this.subscriptions.set(key, handler);
            //We notify once.
            this.notify();
            return true;
        }
        return false;
    }

    /**
     * Prompts data object to notify all subscribed entities of its current state.
     */
    notify(): boolean {
        [...this.subscriptions.values()].forEach(handler => handler(this))
        return true;
    }

    /**
     * Returns the current state of a data object, as a concatenation of data (committed) and updated (overwritten)
     */
    consolidate(): object {
        return {id: this.id, ...this.data, ...this.updated}
    }

    /**
     * Commits the object to its current state silently.
     */
    commit(): Data<T> {
        this.data = this.consolidate();
        return this;
    }

    /**
     * Adds data nonpermanantly.
     * If commit is true, will also commit the data.
     * Unless silent is true, will notify.
     */
    update(data: any, commit: boolean = false, silent: boolean = false): Data<T> {
        if (commit) {
            this.data = {...this.data, ...data}
        } else {
            this.updated = {...this.updated, ...data}
        }
        //It may be possible that the server has requested an id change.
        if (data.id) {
            this.remove()
            this.id = data.id;
            this.add();
        }

        this.index();
        if (!silent) {
            this.notify()
        }
        return this;
    }

    /**
     * Disregard anything in the updated store, getProp rid of it.
     */
    revert(): Data<T> {
        this.updated = {};
        this.notify();
        return this;
    }

    /**
     * Load just this object from server. This is generally discouraged as it may be inefficient.
     */
    async load(): Promise<status> {
        try {
            const response = await axios.get(this.type.getURL() + '/' + this.id);
            this.update(Data.getResponseMapper()(response.data), true);
            return new status(true, response.status);
        } catch (err: AxiosError) {
            throw new Error(err);
            return new status(false, err.code)
        }

    }

    /**
     * Save just this object to the server.
     */
    async save(): Promise<status> {
        try {
            let response;
            if (this.id < 0) {
                response = await axios.post(this.type.getURL() + '/', this.consolidate());
            } else {
                response = await axios.put(this.type.getURL() + '/' + this.id, this.consolidate());
            }
            //Great, now that we've got the response we should load to make sure nothing else has changed.
            //TODO: Make this more flexible by allowing alternative methods of local reload.
            //We optimistically commit our data as if it's in line with the server, but also trigger a reload.
            this.commit()
            this.load();
            return new status(true, response.status);

        } catch (err) {
            throw new Error(err);
            return new status(false, err.code)
        }
    }

    //TODO: Write this.
    async delete(): Promise<status> {
        return new status(true, 200);
    }

    //TODO: Comment these!!!!

    raw(prop: string){
        return this.consolidate()[prop];
    }
    //Basically this gets a property, does a registry lookup if needed.
    getProp(prop: string) {
        const property = this.consolidate()[prop];
        const propType = this.propTypeMap[prop]
        if (Array.isArray(propType) && propType[0].isDataType) {
            return property.map(id => propType[0].getOrMake(id));
        } else if (propType.isDataType) {
            return propType.getOrMake(property);
        } else {
            return property;
        }
    }

    //This does what getProp does, actually loads the object for data if needed.
    async loadProp(prop: string): Promise<Data<any> | Data<any>[] | any> {
        const property = this.consolidate()[prop];
        const propType = this.propTypeMap[prop];

        if (Array.isArray(propType) && propType[0].isDataType) {
            const objects = property.map(id => propType[0].getOrMake(id));
            await propType[0].loadMultiple(objects)
            return objects;
        } else if (propType.isDataType) {
            const object = propType.getOrMake(property);
            await object.load();
            return object;
        } else {
            return property;
        }
    }

    /**
     * Returns data, stripped from the class object.
     * Remember, references are stored in referencers by id.
     * If pure is true, the nested relationships will be 'connected', by DATA not REFERENCE
     *
     * This function looks exceptionally complex, but this is out of necessity to support referential arrays.
     * **/
    async flatten(pure: boolean, maxDepth = 5, depth = 1): Promise<object> {
        if (!Data.has(this.id, this.type.prefix)) {
            await this.load()
        }

        const data = this.consolidate();

        if (!pure) {
            return data;
        }

        if (depth > maxDepth) {
            return data;
        }
        //Now we must go through this data, and find anything that is a reference. Then we need to fill these in.

        let p: string = '';
        //Populate loads.
        const propTypeMap = this.propTypeMap;
        let propType;
        for (p in propTypeMap) {
            if (data[p] != undefined) {
                propType = propTypeMap[p];
                //Only do this special flattening on actual referential data.
                if (propType.isDataType) {
                    let item;
                    const id = data[p];
                    if (Data.has(id, propType.prefix)) {
                        item = Data.get(id, propType.prefix)
                    } else {
                        item = new propType(undefined, id)
                    }
                    const valuePromise = item.flatten(true, maxDepth, depth + 1);
                    const value = await valuePromise;
                    data[p] = value;
                }
                //If this is a one to many, we use a seperate promise which will getProp/load multiple items at one time.
                if (Array.isArray(propType) && propType[0].isDataType) {
                    const valuePromises = data[p].map(id => {
                        let item;
                        if (Data.has(id, propType[0].prefix)) {
                            item = Data.get(id, propType[0].prefix)
                        } else {
                            item = new propType[0](undefined, id)
                        }
                        return item.flatten(true, maxDepth, depth + 1)
                    });
                    const values = await Promise.all(valuePromises);
                    data[p] = values;
                }
            }
        }
        return data;
    }

    //</editor-fold>

}