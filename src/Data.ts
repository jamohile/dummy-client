import axios, {AxiosError, AxiosResponse} from 'axios';

class status {
    success: boolean;
    status: number;

    constructor(success, status) {
        this.success = success;
        this.status = status;
    }
}

export abstract class Data<T>{
    //This helps us later on, when we flatten. Allows us to know when a property is actually a referential class.
    static isDataType = true;
    //A store of all data object, by ID. This ensures that there is always a link, and that nothing gets GCed away.
    static REGISTRY: Map<number, Data<any>> = new Map<number, Data<any>>();
    /**Abstract*/
        //This must be overridden in each class, it allows us to keep track of when the last refresh occurred for that class.
    static timeOfLastLoad: number;


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
    type: T extends typeof Data;

    /** Stores an object of form {prop1: type1, prop2:type2}
     * This allows us to tell which properties are references when flattening.
     * **/
    abstract propTypeMap: {};

    constructor({data = {}, id = undefined, type = undefined} = {}) {
        /** If we ever have to create locally, a negative id ensures no collision. **/
        if (id == undefined) {
            this.id = -(Data.REGISTRY.size + 1);
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
    static async loadAll<T extends typeof Data>(type: T): Promise<status> {
        // @ts-ignore
        return await Data.fetchAndMerge(type.getURL(), type);
    }

    /**
     * This is a little hackey, but we intentionally override loadAll in each derived class, so that we can pass in that class's type.
     * We override so that we don't have to repass it every time.
     */
    abstract async loadAll();

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
        try{
            const response = await axios(url)
            Data.merge(response.data.data, type);
            return new status(true, response.status)
        }catch (e) {
            throw new Error(e);
            return new status(false, 100);
        }

    }

    /**
     * Whether or not an item of the given id exists. Should always be used before get.
     */
    static has(id: number): boolean {
        return Data.REGISTRY.has(id);
    }

    /**
     * Does not perform loads, just gets the requested item by id.
     */
    static get(id: number): Data<any> {
        return Data.REGISTRY.get(id);
    }

    /**
     * This method allows filtering of all items of a particular type.
     */
    protected static getAll<T extends typeof Data>(type: T): Data<T>[]{
        return [...Data.REGISTRY.values()].filter(v => v.type == type);
    }

    /**
     * Like we did in loadAll, we override with an implicitly static abstract, passing in the type as a param.
     */
    abstract getAll();

    /**
     * Sometimes we want an object and want to abstract away whether or not it needs loading.
     * This returns the item by id through a promise.
     * recommended use is with the await operator.
     */
    static async getOrLoad(id: number): Promise<Data<any>> {
        if (Data.has(id)) {
            return Data.get(id);
        } else {
            /*TODO: Is this the fastest way?
            This goes off the assumption that may as well load everything...we'll need it eventually.
             */
            // @ts-ignore
            await Data.loadAll();
            if (Data.has(id)) {
                return Data.get(id);
            } else {
                throw new Error('Tried to load data, but item of requested id still not found.')
            }
        }
    }

    //TODO: CAnnot do loads...
    static async getOrLoadMultiple(ids: number[]): Promise<Data<any>[]>{
        if(ids.reduce((prevValid:boolean, id: number) => prevValid && Data.has(id), true)){
            return ids.map(id => Data.get(id));
        }else{
            // @ts-ignore
            await Data.loadAll();
        }
    }

    /** Takes an array of data objects. instantiates local class objects for them. This is meant primarily to take data from the server and merge it to the local store.**/
    static merge<T extends typeof Data>(objects: any[], type) {
        objects.forEach(obj => {
            const id = obj.id;
            const data = {...obj};
            delete data.id;
            //Now we must create class objects, or update existing ones, for the type passed in.
            if (Data.has(id)) {
                //Update existing object.
                Data.get(id).update(data, true);
            } else {
                //Or create a new one and add it to the registry.
                (new type({id, data})).add()
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
        Data.REGISTRY.set(this.id, this);
        return this;
    }
    remove(): boolean{
        Data.REGISTRY.delete(this.id);
        return true;
    }

    /**
     * Subscribes to changes in the data object. key must be unique.
     */
    subscribe(key: any, handler: (d: Data<T>) => void): boolean {
        if (key) {
            this.subscriptions.set(key, handler)
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
        return {...this.data, ...this.updated}
    }

    /**
     * Commits the object to its current state silently.
     */
    commit(): boolean {
        this.data = this.consolidate();
        return true;
    }

    /**
     * Adds data nonpermanantly.
     * If commit is true, will also commit the data.
     * Unless silent is true, will notify.
     */
    update(data: any, commit: boolean = false, silent: boolean = false): boolean {
        if (commit) {
            this.data = {...this.data, data}
        } else {
            this.updated = {...this.updated, data}
        }

        //It may be possible that the server has requested an id change.
        if(data.id){
            this.remove()
            this.id = data.id;
            this.add();
        }

        if (!silent) {
            this.notify()
        }
        return true;
    }

    /**
     * Load just this object from server. This is generally discouraged as it may be inefficient.
     */
    async load(): Promise<status> {
        try{
            const response = await axios.get(this.getURL() + '/' + this.id);
            this.update(response.data.data, true);
            return new status(true, response.status);
        }catch(err: AxiosError){
            throw new Error(err);
            return new status(false, err.code)
        }

    }

    /**
     * Save just this object to the server.
     */
    async save(): Promise<status> {
        try{
            const response = await axios.put(this.getURL() + '/' + this.id, this.consolidate());
            //Great, now that we've got the response we should load to make sure nothing else has changed.
            //TODO: Make this more flexible by allowing alternative methods of local reload.
            this.load();
            return new status(true, response.status);

        }catch(err: AxiosError){
            throw new Error(err);
            return new status(false, err.code)
        }
    }

    //TODO: Write this.
    async delete(): Promise<status> {
        return new status(true, 200);
    }

    /**
     * Returns data, stripped from the class object.
     * Remember, references are stored in referencers by id.
     * If pure is true, the nested relationships will be 'connected', by DATA not REFERENCE
     *
     * This function looks exceptionally complex, but this is out of necessity to support referential arrays.
     * **/
    async flatten(pure: boolean): Promise<object> {
        const data = this.consolidate();
        if (!pure) {
            return data;
        }

        //Now we must go through this data, and find anything that is a reference. Then we need to fill these in.

        //We make a map of promises so we can async resolve all of them at the same time.
        //Notice that sometimes, a single string maps to a promise of multiple data objects--this is needed in one to many relations.
        let loads: Map<string, Promise<Data<T>>|Promise<Data<T>[]>> = new Map<string, Promise<Data<T>>|Promise<Data<T>[]>>()
        let p: string = '';
        //Populate loads.
        for (p in this.propTypeMap) {
            const type = this.propTypeMap[p];
            //Only do this special flattening on actual referential data.
            if (type.isDataType) {
                loads.set(p, Data.getOrLoad(data[p]));
            }
            //If this is a one to many, we use a seperate promise which will get/load multiple items at one time.
            if(Array.isArray(type) && type[0].isDataType){
                loads.set(p, Data.getOrLoadMultiple(data[p]));
            }
        }

        //We factor this into its own line with an await so that the return statement will wait.
        //@ts-ignore
        const done = await Promise.all([...loads.values()]).then(() => {
            //We ignore the result of the Promise.all, since it will not have the keys from loads, the property names.
            const loadValues = [...loads.entries()];
            loadValues.forEach(async ([p, valPromise]) => {
                //We don't mind awaiting each one here, since the Promise.all guarantees that they have already completed.
                const value = await valPromise;
                //Add the stripped data to the data return.
                if(Array.isArray(value)){
                    data[p] = value.map(v => v.consolidate());
                }else{
                    data[p] = value.consolidate();
                }
            })
        })
        return data;
    }


}