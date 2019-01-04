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

    //The identifier.
    id: string;
    //A store of all data in object form. Allows flexible server-updates.
    data: object = {};
    //Similar to data, instead, stores only updated properties.
    updated: object = {};
    //This object can notify other entities of changes through lambda functions.
    subscriptions: Map<any, (Data) => void> = new Map<any, (Data) => void>();
    //Stores own type for filtering.

    // @ts-ignore
    type: T extends typeof Data;

    /** Stores an object of form {prop1: type1, prop2:type2}
     * This allows us to tell which properties are references when flattening.
     * **/
    abstract propTypeMap: any;

    private static config = {
        API: undefined,
        mapResponseToData: (data: any) => data
    }


    static setResponseDataMapping(mapper: (data:any) => any):any{
        this.config.mapResponseToData = mapper;
    }
    private static getResponseMapper():(data:any) => any{
        return Data.config.mapResponseToData;
    }

    constructor({data = {}, id = undefined, type = undefined} = {}) {
        /** If we ever have to create locally, a negative id ensures no collision. **/
        if (id == undefined) {
            this.id = (-(Data.REGISTRY.size + 1)).toString() + '.' + type.prefix;
        } else {
            this.id = id;
        }

        this.type = type;
        this.data = {...data}
    }

    /**Static Data Methods**/

    /**
     * Returned URL should not contain a trailing slash.
     * @example
     * /path/to/type
     *
     * We use an abstract method here, due to typescript limitation, but instantiate as a static abstract.
     */
    abstract getURL(): string;

    /**
     * This loads all items of this type from the server.
     */
    static async loadAll<T extends Data<T>>(type: T): Promise<status> {
        // @ts-ignore
        return await Data.fetchAndMerge(type.getURL(), type);
    }

    /**
     * This works just like the loadAll above, with one difference. It concatenates 'updated' to the url, assuming the API will use this to only show relevant data.
     */
    //TODO: Pass last update time.
    static async refreshAll<T extends typeof Data>(type: T): Promise<status> {
        // @ts-ignore
        return await Data.fetchAndMerge(`${type.getURL()}/updated`, type)
    }


    /**
     * This is only used internally by loadAll and refreshAll.
     */
    private static async fetchAndMerge<T extends typeof Data>(url: string, type: T): Promise<status> {
        try {
            const response = await axios(url)
            Data.merge(Data.getResponseMapper()(response.data), type);
            return new status(true, response.status)
        } catch (e) {
            throw new Error(e);
            return new status(false, 100);
        }

    }

    /**
     * Whether or not an item of the given id exists. Should always be used before get.
     */
    static has(id: string, prefix): boolean {
        return Data.REGISTRY.has(prefix + '.' + id);
    }

    static hasMultiple(ids: string[], prefix): boolean {
        return ids.reduce((prevValid: boolean, id: string) => prevValid && Data.has(id, prefix), true);
    }

    /**
     * Does not perform loads, just gets the requested item by id.
     */
    static get(id: string, prefix): Data<any> {
        return Data.REGISTRY.get(prefix + '.' + id);
    }

    /**
     *
     */

    static getOrMake<T extends typeof Data> (id:string, type: T){
        if (Data.has(id, type.prefix)){
            return Data.get(id, type.prefix);
        }else{
            // @ts-ignore
            return new type(undefined, id);
        }
    }

    static getMultiple(ids: string[], prefix): Data<any>[] {
        return ids.map(id => Data.get(id, prefix));
    }

    /**
     * This method allows filtering of all items of a particular type.
     */
    static getAll<T extends typeof Data>(type: T): Data<T>[] {
        return [...Data.REGISTRY.values()].filter(v => v.type == type);
    }

    /**
     * Sometimes we want an object and want to abstract away whether or not it needs loading.
     * This returns the item by id through a promise.
     * recommended use is with the await operator.
     */
    static async getOrLoad<T extends typeof Data>(id: string, type: T): Promise<Data<T>> {
        if (Data.has(id, type.prefix)) {
            return Data.get(id, type.prefix);
        } else {
            /*TODO: Is this the fastest way?
            This goes off the assumption that may as well load everything...we'll need it eventually.
             */
            // @ts-ignore
            const loaded = await Data.loadAll(type);
            if (Data.has(id, type.prefix)) {
                return Data.get(id, type.prefix);
            } else {
                throw new Error('Tried to load data, but item of requested id still not found.')
            }
        }
    }

    static async getOrLoadMultiple<T extends typeof Data>(ids: string[], type: T): Promise<Data<T>[]> {
        if (this.hasMultiple(ids, type.prefix)) {
            return this.getMultiple(ids, type.prefix);
        } else {
            // @ts-ignore
            const loaded = await Data.loadAll(type);
            if (Data.hasMultiple(ids, type.prefix)) {
                return Data.getMultiple(ids, type.prefix);
            } else {
                throw new Error('Tried to load data, but item of requested id still not found.')
            }
        }
    }

    /** Takes an array of data objects. instantiates local class objects for them. This is meant primarily to take data from the server and merge it to the local store.**/
    static merge<T extends typeof Data>(objects: any[], type) {
        objects.forEach(obj => {
            const id = obj.id;
            const data = {...obj};
            delete data.id;
            //Now we must create class objects, or update existing ones, for the type passed in.
            if (Data.has(id, type.prefix)) {
                //Update existing object.
                Data.get(id, type.prefix).update(data, true);
            } else {
                //Or create a new one and add it to the registry.
                (new type(data, id)).add()
            }
        })
    }

    /**Returns whether or not there is enough dependency data available to construct.**/
    abstract canCreate(): boolean;

    /**Creates a new data object of the respective class**/
    abstract create({data, id}): Data<T>;


    /**Instance Data Methods**/

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

        if (!silent) {
            this.notify()
        }
        return this;
    }

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
            if(this.id < 0){
                response = await axios.post(this.type.getURL() + '/', this.consolidate());
            }else{
                response = await axios.put(this.type.getURL() + '/' + this.id, this.consolidate());
            }
            //Great, now that we've got the response we should load to make sure nothing else has changed.
            //TODO: Make this more flexible by allowing alternative methods of local reload.
            this.load();
            return new status(true, response.status);

        } catch (err: AxiosError) {
            throw new Error(err);
            return new status(false, err.code)
        }
    }

    //TODO: Write this.
    async delete(): Promise<status> {
        return new status(true, 200);
    }

    get(prop:string){
        const property = this.consolidate()[prop];
        const propType = this.propTypeMap[prop]
        if(Array.isArray(propType) && propType[0].isDataType){
            return property.map(id => Data.getOrMake(id, propType[0]));
        }else if(propType.isDataType){
            return Data.getOrMake(property, propType);
        }else{
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
        for (p in this.propTypeMap) {
            if (data[p] != undefined) {
                const type = this.propTypeMap[p];
                //Only do this special flattening on actual referential data.
                if (type.isDataType) {
                    let item;
                    const id = data[p];
                    if (Data.has(id, type.prefix)) {
                        item = Data.get(id, type.prefix)
                    } else {
                        item = new type(undefined, id)
                    }
                    const valuePromise = item.flatten(true, maxDepth, depth + 1);
                    const value = await valuePromise;
                    data[p] = value;
                }
                //If this is a one to many, we use a seperate promise which will get/load multiple items at one time.
                if (Array.isArray(type) && type[0].isDataType) {
                    const valuePromises = data[p].map(id => {
                        let item;
                        if (Data.has(id, type[0].prefix)) {
                            item = Data.get(id, type[0].prefix)
                        } else {
                            item = new type[0](undefined, id)
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


}