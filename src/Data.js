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
    function Data(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.data, data = _c === void 0 ? {} : _c, _d = _b.id, id = _d === void 0 ? undefined : _d, _e = _b.type, type = _e === void 0 ? undefined : _e;
        //A store of all data in object form. Allows flexible server-updates.
        this.data = {};
        //Similar to data, instead, stores only updated properties.
        this.updated = {};
        //This object can notify other entities of changes through lambda functions.
        this.subscriptions = new Map();
        /** If we ever have to create locally, a negative id ensures no collision. **/
        if (id == undefined) {
            this.id = (-(Data.REGISTRY.size + 1)).toString() + '.' + type.prefix;
        }
        else {
            this.id = id;
        }
        this.type = type;
        this.data = __assign({}, data);
    }
    Data.setResponseDataMapping = function (mapper) {
        this.config.mapResponseToData = mapper;
    };
    Data.getResponseMapper = function () {
        return Data.config.mapResponseToData;
    };
    /**
     * This loads all items of this type from the server.
     */
    Data.loadAll = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Data.fetchAndMerge(type.getURL(), type)];
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
    Data.refreshAll = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Data.fetchAndMerge(type.getURL() + "/updated", type)];
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
    Data.fetchAndMerge = function (url, type) {
        return __awaiter(this, void 0, void 0, function () {
            var response, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default(url)];
                    case 1:
                        response = _a.sent();
                        Data.merge(Data.getResponseMapper()(response.data), type);
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
     * Whether or not an item of the given id exists. Should always be used before get.
     */
    Data.has = function (id, prefix) {
        return Data.REGISTRY.has(prefix + '.' + id);
    };
    Data.hasMultiple = function (ids, prefix) {
        return ids.reduce(function (prevValid, id) { return prevValid && Data.has(id, prefix); }, true);
    };
    /**
     * Does not perform loads, just gets the requested item by id.
     */
    Data.get = function (id, prefix) {
        return Data.REGISTRY.get(prefix + '.' + id);
    };
    /**
     *
     */
    Data.getOrMake = function (id, type) {
        if (Data.has(id, type.prefix)) {
            return Data.get(id, type.prefix);
        }
        else {
            // @ts-ignore
            return new type(undefined, id);
        }
    };
    Data.getMultiple = function (ids, prefix) {
        return ids.map(function (id) { return Data.get(id, prefix); });
    };
    /**
     * This method allows filtering of all items of a particular type.
     */
    Data.getAll = function (type) {
        return __spread(Data.REGISTRY.values()).filter(function (v) { return v.type == type; });
    };
    /**
     * Sometimes we want an object and want to abstract away whether or not it needs loading.
     * This returns the item by id through a promise.
     * recommended use is with the await operator.
     */
    Data.getOrLoad = function (id, type) {
        return __awaiter(this, void 0, void 0, function () {
            var loaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Data.has(id, type.prefix)) return [3 /*break*/, 1];
                        return [2 /*return*/, Data.get(id, type.prefix)];
                    case 1: return [4 /*yield*/, Data.loadAll(type)];
                    case 2:
                        loaded = _a.sent();
                        if (Data.has(id, type.prefix)) {
                            return [2 /*return*/, Data.get(id, type.prefix)];
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
    Data.getOrLoadMultiple = function (ids, type) {
        return __awaiter(this, void 0, void 0, function () {
            var loaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasMultiple(ids, type.prefix)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.getMultiple(ids, type.prefix)];
                    case 1: return [4 /*yield*/, Data.loadAll(type)];
                    case 2:
                        loaded = _a.sent();
                        if (Data.hasMultiple(ids, type.prefix)) {
                            return [2 /*return*/, Data.getMultiple(ids, type.prefix)];
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
    /** Takes an array of data objects. instantiates local class objects for them. This is meant primarily to take data from the server and merge it to the local store.**/
    Data.merge = function (objects, type) {
        objects.forEach(function (obj) {
            var id = obj.id;
            var data = __assign({}, obj);
            delete data.id;
            //Now we must create class objects, or update existing ones, for the type passed in.
            if (Data.has(id, type.prefix)) {
                //Update existing object.
                Data.get(id, type.prefix).update(data, true);
            }
            else {
                //Or create a new one and add it to the registry.
                (new type(data, id)).add();
            }
        });
    };
    /**Instance Data Methods**/
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
        if (!silent) {
            this.notify();
        }
        return this;
    };
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
    Data.prototype.get = function (prop) {
        var property = this.consolidate()[prop];
        var propType = this.propTypeMap[prop];
        if (Array.isArray(propType) && propType[0].isDataType) {
            return property.map(function (id) { return Data.getOrMake(id, propType[0]); });
        }
        else if (propType.isDataType) {
            return Data.getOrMake(property, propType);
        }
        else {
            return property;
        }
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
            var data, p, _loop_1, this_1, _a, _b, _i;
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
                        _loop_1 = function () {
                            var type_1, item, id, valuePromise, value, valuePromises, values;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(data[p] != undefined)) return [3 /*break*/, 4];
                                        type_1 = this_1.propTypeMap[p];
                                        if (!type_1.isDataType) return [3 /*break*/, 2];
                                        item = void 0;
                                        id = data[p];
                                        if (Data.has(id, type_1.prefix)) {
                                            item = Data.get(id, type_1.prefix);
                                        }
                                        else {
                                            item = new type_1(undefined, id);
                                        }
                                        valuePromise = item.flatten(true, maxDepth, depth + 1);
                                        return [4 /*yield*/, valuePromise];
                                    case 1:
                                        value = _a.sent();
                                        data[p] = value;
                                        _a.label = 2;
                                    case 2:
                                        if (!(Array.isArray(type_1) && type_1[0].isDataType)) return [3 /*break*/, 4];
                                        valuePromises = data[p].map(function (id) {
                                            var item;
                                            if (Data.has(id, type_1[0].prefix)) {
                                                item = Data.get(id, type_1[0].prefix);
                                            }
                                            else {
                                                item = new type_1[0](undefined, id);
                                            }
                                            return item.flatten(true, maxDepth, depth + 1);
                                        });
                                        return [4 /*yield*/, Promise.all(valuePromises)];
                                    case 3:
                                        values = _a.sent();
                                        data[p] = values;
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a = [];
                        for (_b in this.propTypeMap)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        p = _a[_i];
                        return [5 /*yield**/, _loop_1()];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, data];
                }
            });
        });
    };
    //This helps us later on, when we flatten. Allows us to know when a property is actually a referential class.
    Data.isDataType = true;
    //A store of all data object, by ID. This ensures that there is always a link, and that nothing gets GCed away.
    Data.REGISTRY = new Map();
    Data.config = {
        API: undefined,
        mapResponseToData: function (data) { return data; }
    };
    return Data;
}());
exports.default = Data;
//# sourceMappingURL=Data.js.map