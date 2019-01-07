"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var status = /** @class */ (function () {
    function status(success, status) {
        this.success = success;
        this.status = status;
    }
    return status;
}());
var Data = /** @class */ (function () {
    function Data(data, id) {
        if (data === void 0) { data = {}; }
        if (id === void 0) { id = undefined; }
        //A store of all data in object form. Allows flexible server-updates.
        this.data = {};
        //Similar to data, instead, stores only updated properties.
        this.updated = {};
        //This object can notify other entities of changes through lambda functions.
        this.subscriptions = new Map();
        /**
         * The indices this particular object is a part of.
         * Stores as an object: {indexName: value, ...}
         * Value stores the value this was indexed on.
         * Only stores for indices this is a part of.
         **/
        this.indices = {};
        /** If we ever have to create locally, a negative id ensures no collision. **/
        if (id == undefined) {
            this.id = -(Data.REGISTRY.size + 1);
        }
        else {
            this.id = id;
        }
        // @ts-ignore
        //Believe it or not this works. Since JS classes are really functions, this gets the function creating this instance...aka the class.
        this.type = this.constructor;
        this.data = __assign({}, data);
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
    Data.setResponseDataMapping = function (mapper) {
        this.config.mapResponseToData = mapper;
    };
    /**
     * Used internally to getProp the currently set response mapper from configuration.
     */
    Data.getResponseMapper = function () {
        return Data.config.mapResponseToData;
    };
    /**
     * Used to set the default API that will be prepended to all requests.
     */
    Data.setAPI = function (api) {
        this.config.API = api;
    };
    //</editor-fold>
    /** Indexing **/
    /**
     * Whether or not an index exists for the particular type.
     */
    Data.hasTypeIndex = function () {
        return this.INDICES.has(this);
    };
    Data.getTypeIndex = function () {
        return this.INDICES.get(this);
    };
    /**
     * Init a new root index for the type.
     */
    Data.createTypeIndex = function () {
        if (!this.hasTypeIndex()) {
            this.INDICES.set(this, new Map());
            return true;
        }
        else {
            return false;
        }
    };
    //Deal with individual index within a type.
    Data.hasIndex = function (indexName) {
        return this.hasTypeIndex() && this.getTypeIndex().has(indexName);
    };
    Data.getIndex = function (indexName) {
        return this.getTypeIndex().get(indexName);
    };
    Data.createIndex = function (index, indexor) {
        if (this.hasTypeIndex() && !this.hasIndex(index)) {
            this.getTypeIndex().set(index, { indexor: indexor, index: new Map() });
            return true;
        }
        else {
            return false;
        }
    };
    Data.createSimpleIndex = function (index, property) {
        this.createIndex(index, function (d) {
            return d.raw(property);
        });
    };
    /**
     * Run an object against the indices named by its type.
     */
    Data.indexObject = function (obj) {
        if (this.hasTypeIndex()) {
            var typeIndices = this.getTypeIndex();
            __spread(typeIndices.entries()).forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], _c = _b[1], indexor = _c.indexor, index = _c.index;
                var value = indexor(obj);
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
                        index.set(value, {});
                    }
                    //Now, let's add this object to its index.
                    index.get(value)[obj.id] = true;
                    obj.indices[name] = value;
                }
            });
            return true;
        }
        else {
            return false;
        }
    };
    Data.prototype.index = function () {
        this.type.indexObject(this);
    };
    Data.searchIndex = function (indexName, value) {
        var index = this.getIndex(indexName).index.get(value);
        if (index != undefined) {
            return Object.keys(index).map(Number);
        }
        else {
            return [];
        }
    };
    Data.searchIndexAndGet = function (indexName, value) {
        return this.getMultiple(this.searchIndex(indexName, value));
    };
    Data.searchIndexAndGetOrLoad = function (indexName, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrLoadMultiple(this.searchIndex(indexName, value))];
            });
        });
    };
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
    Data.getURL = function () {
        return this.config.API + "/" + this.prefix;
    };
    /**
     * This loads all items of this type from the server.
     */
    Data.loadAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAndMerge(this.getURL())];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * This works just like the loadAll above, with one difference. It concatenates 'updated' to the url, assuming the API will use this to only show relevant data.
     */
    //TODO: Pass last update time.
    Data.refreshAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Data.fetchAndMerge(type.getURL() + "/updated")];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * This is only used internally by loadAll and refreshAll.
     */
    Data.fetchAndMerge = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default(url)];
                    case 1:
                        response = _a.sent();
                        this.merge(Data.getResponseMapper()(response.data));
                        return [2 /*return*/, new status(true, response.status)];
                    case 2:
                        e_1 = _a.sent();
                        throw new Error(e_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Whether or not an item of the given id exists. Should always be used before getProp.
     */
    Data.has = function (id, prefix) {
        if (prefix === void 0) { prefix = this.prefix; }
        return Data.REGISTRY.has(prefix + '.' + id);
    };
    Data.hasMultiple = function (ids, prefix) {
        var _this = this;
        if (prefix === void 0) { prefix = this.prefix; }
        return ids.reduce(function (prevValid, id) { return prevValid && _this.has(id); }, true);
    };
    /**
     * Does not perform loads, just gets the requested item by id.
     */
    Data.get = function (id, prefix) {
        if (prefix === void 0) { prefix = this.prefix; }
        return Data.REGISTRY.get(prefix + '.' + id);
    };
    /**
     * Either gets the item from the registry, or makes a new one and adds it to the registry.
     * Does not do any loading.
     */
    Data.getOrMake = function (id) {
        if (this.has(id)) {
            return this.get(id);
        }
        else {
            // @ts-ignore
            return new this(undefined, id).add();
        }
    };
    /**
     *Returns an array of multiple items from registry.
     */
    Data.getMultiple = function (ids) {
        var _this = this;
        return ids.map(function (id) { return _this.get(id); });
    };
    /**
     * This method allows filtering of all items of a particular type.
     */
    Data.getAll = function () {
        var _this = this;
        return __spread(Data.REGISTRY.values()).filter(function (v) { return v.type == _this; });
    };
    /**
     * Sometimes we want an object and want to abstract away whether or not it needs loading.
     * This returns the item by id through a promise.
     * recommended use is with the await operator.
     */
    Data.getOrLoad = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var loaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.has(id)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.get(id)];
                    case 1: return [4 /*yield*/, this.loadAll()];
                    case 2:
                        loaded = _a.sent();
                        if (this.has(id)) {
                            return [2 /*return*/, this.get(id)];
                        }
                        else {
                            throw new Error('Tried to load data, but item of requested id still not found.');
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Same thing as getProp or load but does it simultaneously for multiple items.
     */
    Data.getOrLoadMultiple = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var loaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasMultiple(ids)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.getMultiple(ids)];
                    case 1: return [4 /*yield*/, this.loadAll()];
                    case 2:
                        loaded = _a.sent();
                        if (this.hasMultiple(ids)) {
                            return [2 /*return*/, this.getMultiple(ids)];
                        }
                        else {
                            throw new Error('Tried to load data, but item of requested id still not found.');
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sometimes we have an array of objects, and specifically want to wait for all of those to load.
     * Instead of using Promise.all (which is bound to be rewritten as boilerplate many times...)
     * This takes in an array of objects, and returns an array of statuses (through promise)
     */
    Data.loadMultiple = function (objects) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(objects.map(function (obj) { return obj.load(); }))];
            });
        });
    };
    /** Takes an array of data objects. JSON, not Dummy.
     * instantiates local class objects for them.
     * This is meant primarily to take raw data from the server and merge it to the local store.
     * TODO: Extend this to allow caching and offline save.
     * **/
    Data.merge = function (objects) {
        var _this = this;
        objects.forEach(function (obj) {
            var id = obj.id;
            var data = __assign({}, obj);
            delete data.id;
            //Now we must create class objects, or update existing ones, for the type passed in.
            if (Data.has(id, _this.prefix)) {
                //Update existing object.
                Data.get(id, _this.prefix).update(data, true);
            }
            else {
                //Or create a new one and add it to the registry.
                // @ts-ignore
                (new _this(data, id)).add();
            }
        });
    };
    //</editor-fold>
    /**Instance Data Methods**/
    //<editor-fold name = "Instance Data Methods">
    /**
     * When a data object is instantiated it is not automatically registered. This registers it.
     * If data object is created using built in methods such as load, loadAll, etc, it is automatically added.
     */
    Data.prototype.add = function () {
        Data.REGISTRY.set(this.type.prefix + '.' + this.id, this);
        return this;
    };
    Data.prototype.remove = function () {
        Data.REGISTRY.delete(this.type.prefix + '.' + this.id);
        return true;
    };
    /**
     * Subscribes to changes in the data object. key must be unique.
     */
    Data.prototype.subscribe = function (key, handler) {
        if (key) {
            this.subscriptions.set(key, handler);
            //We notify once.
            this.notify();
            return true;
        }
        return false;
    };
    /**
     * Prompts data object to notify all subscribed entities of its current state.
     */
    Data.prototype.notify = function () {
        var _this = this;
        __spread(this.subscriptions.values()).forEach(function (handler) { return handler(_this); });
        return true;
    };
    /**
     * Returns the current state of a data object, as a concatenation of data (committed) and updated (overwritten)
     */
    Data.prototype.consolidate = function () {
        return __assign({ id: this.id }, this.data, this.updated);
    };
    /**
     * Commits the object to its current state silently.
     */
    Data.prototype.commit = function () {
        this.data = this.consolidate();
        return this;
    };
    /**
     * Adds data nonpermanantly.
     * If commit is true, will also commit the data.
     * Unless silent is true, will notify.
     */
    Data.prototype.update = function (data, commit, silent) {
        if (commit === void 0) { commit = false; }
        if (silent === void 0) { silent = false; }
        if (commit) {
            this.data = __assign({}, this.data, data);
        }
        else {
            this.updated = __assign({}, this.updated, data);
        }
        //It may be possible that the server has requested an id change.
        if (data.id) {
            this.remove();
            this.id = data.id;
            this.add();
        }
        this.index();
        if (!silent) {
            this.notify();
        }
        return this;
    };
    /**
     * Disregard anything in the updated store, getProp rid of it.
     */
    Data.prototype.revert = function () {
        this.updated = {};
        this.notify();
        return this;
    };
    /**
     * Load just this object from server. This is generally discouraged as it may be inefficient.
     */
    Data.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(this.type.getURL() + '/' + this.id)];
                    case 1:
                        response = _a.sent();
                        this.update(Data.getResponseMapper()(response.data), true);
                        return [2 /*return*/, new status(true, response.status)];
                    case 2:
                        err_1 = _a.sent();
                        throw new Error(err_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save just this object to the server.
     */
    Data.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        response = void 0;
                        if (!(this.id < 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, axios_1.default.post(this.type.getURL() + '/', this.consolidate())];
                    case 1:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, axios_1.default.put(this.type.getURL() + '/' + this.id, this.consolidate())];
                    case 3:
                        response = _a.sent();
                        _a.label = 4;
                    case 4:
                        //Great, now that we've got the response we should load to make sure nothing else has changed.
                        //TODO: Make this more flexible by allowing alternative methods of local reload.
                        //We optimistically commit our data as if it's in line with the server, but also trigger a reload.
                        this.commit();
                        this.load();
                        return [2 /*return*/, new status(true, response.status)];
                    case 5:
                        err_2 = _a.sent();
                        throw new Error(err_2);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    //TODO: Write this.
    Data.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new status(true, 200)];
            });
        });
    };
    //TODO: Comment these!!!!
    Data.prototype.raw = function (prop) {
        return this.consolidate()[prop];
    };
    //Basically this gets a property, does a registry lookup if needed.
    Data.prototype.getProp = function (prop) {
        var property = this.consolidate()[prop];
        var propType = this.propTypeMap[prop];
        if (Array.isArray(propType) && propType[0].isDataType) {
            return property.map(function (id) { return propType[0].getOrMake(id); });
        }
        else if (propType.isDataType) {
            return propType.getOrMake(property);
        }
        else {
            return property;
        }
    };
    //This does what getProp does, actually loads the object for data if needed.
    Data.prototype.loadProp = function (prop) {
        return __awaiter(this, void 0, void 0, function () {
            var property, propType, objects, object;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        property = this.consolidate()[prop];
                        propType = this.propTypeMap[prop];
                        if (!(Array.isArray(propType) && propType[0].isDataType)) return [3 /*break*/, 2];
                        objects = property.map(function (id) { return propType[0].getOrMake(id); });
                        return [4 /*yield*/, propType[0].loadMultiple(objects)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, objects];
                    case 2:
                        if (!propType.isDataType) return [3 /*break*/, 4];
                        object = propType.getOrMake(property);
                        return [4 /*yield*/, object.load()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, object];
                    case 4: return [2 /*return*/, property];
                }
            });
        });
    };
    /**
     * Returns data, stripped from the class object.
     * Remember, references are stored in referencers by id.
     * If pure is true, the nested relationships will be 'connected', by DATA not REFERENCE
     *
     * This function looks exceptionally complex, but this is out of necessity to support referential arrays.
     * **/
    Data.prototype.flatten = function (pure, maxDepth, depth) {
        if (maxDepth === void 0) { maxDepth = 5; }
        if (depth === void 0) { depth = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var data, p, propTypeMap, propType, _a, _b, _i, item, id, valuePromise, value, valuePromises, values;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!Data.has(this.id, this.type.prefix)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.load()];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        data = this.consolidate();
                        if (!pure) {
                            return [2 /*return*/, data];
                        }
                        if (depth > maxDepth) {
                            return [2 /*return*/, data];
                        }
                        p = '';
                        propTypeMap = this.propTypeMap;
                        _a = [];
                        for (_b in propTypeMap)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        p = _a[_i];
                        if (!(data[p] != undefined)) return [3 /*break*/, 7];
                        propType = propTypeMap[p];
                        if (!propType.isDataType) return [3 /*break*/, 5];
                        item = void 0;
                        id = data[p];
                        if (Data.has(id, propType.prefix)) {
                            item = Data.get(id, propType.prefix);
                        }
                        else {
                            item = new propType(undefined, id);
                        }
                        valuePromise = item.flatten(true, maxDepth, depth + 1);
                        return [4 /*yield*/, valuePromise];
                    case 4:
                        value = _c.sent();
                        data[p] = value;
                        _c.label = 5;
                    case 5:
                        if (!(Array.isArray(propType) && propType[0].isDataType)) return [3 /*break*/, 7];
                        valuePromises = data[p].map(function (id) {
                            var item;
                            if (Data.has(id, propType[0].prefix)) {
                                item = Data.get(id, propType[0].prefix);
                            }
                            else {
                                item = new propType[0](undefined, id);
                            }
                            return item.flatten(true, maxDepth, depth + 1);
                        });
                        return [4 /*yield*/, Promise.all(valuePromises)];
                    case 6:
                        values = _c.sent();
                        data[p] = values;
                        _c.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [2 /*return*/, data];
                }
            });
        });
    };
    //This helps us later on, when we flatten. Allows us to know when a property is actually a referential class.
    Data.isDataType = true;
    //A store of all data object, by ID. This ensures that there is always a link, and that nothing gets GCed away.
    Data.REGISTRY = new Map();
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
    Data.INDICES = new Map();
    Data.config = {
        API: undefined,
        mapResponseToData: function (data) { return data; }
    };
    return Data;
}());
exports.default = Data;
//# sourceMappingURL=Data.js.map