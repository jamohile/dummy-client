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
            this.id = -(Data.REGISTRY.size + 1);
        }
        else {
            this.id = id;
        }
        this.type = type;
        this.data = __assign({}, data);
    }
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
                        Data.merge(response.data.data, type);
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
    Data.has = function (id) {
        return Data.REGISTRY.has(id);
    };
    /**
     * Does not perform loads, just gets the requested item by id.
     */
    Data.get = function (id) {
        return Data.REGISTRY.get(id);
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
    Data.getOrLoad = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Data.has(id)) return [3 /*break*/, 1];
                        return [2 /*return*/, Data.get(id)];
                    case 1: 
                    /*TODO: Is this the fastest way?
                    This goes off the assumption that may as well load everything...we'll need it eventually.
                     */
                    // @ts-ignore
                    return [4 /*yield*/, Data.loadAll()];
                    case 2:
                        /*TODO: Is this the fastest way?
                        This goes off the assumption that may as well load everything...we'll need it eventually.
                         */
                        // @ts-ignore
                        _a.sent();
                        if (Data.has(id)) {
                            return [2 /*return*/, Data.get(id)];
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
    //TODO: CAnnot do loads...
    Data.getOrLoadMultiple = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ids.reduce(function (prevValid, id) { return prevValid && Data.has(id); }, true)) return [3 /*break*/, 1];
                        return [2 /*return*/, ids.map(function (id) { return Data.get(id); })];
                    case 1: 
                    // @ts-ignore
                    return [4 /*yield*/, Data.loadAll()];
                    case 2:
                        // @ts-ignore
                        _a.sent();
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
            if (Data.has(id)) {
                //Update existing object.
                Data.get(id).update(data, true);
            }
            else {
                //Or create a new one and add it to the registry.
                (new type({ id: id, data: data })).add();
            }
        });
    };
    /**Instance Data Methods**/
    /**
     * When a data object is instantiated it is not automatically registered. This registers it.
     * If data object is created using built in methods such as load, loadAll, etc, it is automatically added.
     */
    Data.prototype.add = function () {
        Data.REGISTRY.set(this.id, this);
        return this;
    };
    Data.prototype.remove = function () {
        Data.REGISTRY.delete(this.id);
        return true;
    };
    /**
     * Subscribes to changes in the data object. key must be unique.
     */
    Data.prototype.subscribe = function (key, handler) {
        if (key) {
            this.subscriptions.set(key, handler);
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
        return __assign({}, this.data, this.updated);
    };
    /**
     * Commits the object to its current state silently.
     */
    Data.prototype.commit = function () {
        this.data = this.consolidate();
        return true;
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
            this.data = __assign({}, this.data, { data: data });
        }
        else {
            this.updated = __assign({}, this.updated, { data: data });
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
        return true;
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
                        return [4 /*yield*/, axios_1.default.get(this.getURL() + '/' + this.id)];
                    case 1:
                        response = _a.sent();
                        this.update(response.data.data, true);
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
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.put(this.getURL() + '/' + this.id, this.consolidate())];
                    case 1:
                        response = _a.sent();
                        //Great, now that we've got the response we should load to make sure nothing else has changed.
                        //TODO: Make this more flexible by allowing alternative methods of local reload.
                        this.load();
                        return [2 /*return*/, new status(true, response.status)];
                    case 2:
                        err_2 = _a.sent();
                        throw new Error(err_2);
                    case 3: return [2 /*return*/];
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
    /**
     * Returns data, stripped from the class object.
     * Remember, references are stored in referencers by id.
     * If pure is true, the nested relationships will be 'connected', by DATA not REFERENCE
     *
     * This function looks exceptionally complex, but this is out of necessity to support referential arrays.
     * **/
    Data.prototype.flatten = function (pure) {
        return __awaiter(this, void 0, void 0, function () {
            var data, loads, p, type, done;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = this.consolidate();
                        if (!pure) {
                            return [2 /*return*/, data];
                        }
                        loads = new Map();
                        p = '';
                        //Populate loads.
                        for (p in this.propTypeMap) {
                            type = this.propTypeMap[p];
                            //Only do this special flattening on actual referential data.
                            if (type.isDataType) {
                                loads.set(p, Data.getOrLoad(data[p]));
                            }
                            //If this is a one to many, we use a seperate promise which will get/load multiple items at one time.
                            if (Array.isArray(type) && type[0].isDataType) {
                                loads.set(p, Data.getOrLoadMultiple(data[p]));
                            }
                        }
                        return [4 /*yield*/, Promise.all(__spread(loads.values())).then(function () {
                                //We ignore the result of the Promise.all, since it will not have the keys from loads, the property names.
                                var loadValues = __spread(loads.entries());
                                loadValues.forEach(function (_a) {
                                    var _b = __read(_a, 2), p = _b[0], valPromise = _b[1];
                                    return __awaiter(_this, void 0, void 0, function () {
                                        var value;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0: return [4 /*yield*/, valPromise];
                                                case 1:
                                                    value = _c.sent();
                                                    //Add the stripped data to the data return.
                                                    if (Array.isArray(value)) {
                                                        data[p] = value.map(function (v) { return v.consolidate(); });
                                                    }
                                                    else {
                                                        data[p] = value.consolidate();
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                });
                            })];
                    case 1:
                        done = _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    //This helps us later on, when we flatten. Allows us to know when a property is actually a referential class.
    Data.isDataType = true;
    //A store of all data object, by ID. This ensures that there is always a link, and that nothing gets GCed away.
    Data.REGISTRY = new Map();
    return Data;
}());
exports.Data = Data;
//# sourceMappingURL=Data.js.map