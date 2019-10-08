const cryptoRandomString = require("crypto-random-string");
const config = require("../config");

let self = module.exports = {
    getStringSize: function(str) {
        return Buffer.byteLength(str.toString(), "utf8");
    },
    fieldOverSized: function(str) {
        return self.getStringSize(str) > 10000;
    },
    isJSON: function(str) {
        if (typeof str === "object") str = JSON.stringify(str)
        try {
            return (JSON.parse(str) && !!str);
        } catch (e) {
            return false;
        }
    },
    isValidKeys: function(obj) {
        const keys = Object.keys(obj);
        return keys.every(key => /^[A-Za-z]/i.test(key[0]));
    },
    keysValidator: function(req, res, next) {
        let validKeys = Array.isArray(req.body) ? req.body.every(self.isValidKeys) : self.isValidKeys(req.body);
        if (!validKeys) return next(new Error("invalid JSON keys. keys should start with an alphabet"));
        return next();
    },
    cleanPath: function(str) {
        return str.split("/").filter(s => s.length > 1);
    },
    matchId: function(str) {
        return str.match(new RegExp(/^-[\w._~]{8}$/g)) !== null;
    },
    matchCollection: function(str) {
        return str.match(new RegExp(/^\w+$/g)) !== null;
    },
    matchUUIDv4: function(str) {
        let regex = `^${config.redisExtension}[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$`
        return str.match(new RegExp(regex, "i")) !== null;
    },
    validateUrl: function(req, res, next) {
        let paths = self.cleanPath(req.path);
        if (paths.length > 2 || paths.length < 1) return next(new Error("wrong path parameters"))
        if (!self.matchUUIDv4(paths[0])) return next(new Error("bin id is in wrong format"));
        if (paths.length === 2) {
            if (self.matchCollection(paths[1])) {
                if (paths[1].length > config.collectionLength) return next(new Error("collection length cannot be longer than 20 characters"));
                req._collection = paths[1].trim();
            } else if (self.matchId(paths[1])) {
                req._id = paths[1].trim();
            } else {
                return next(new Error("unknown path"));
            }
        }

        req._bin = paths[0];
        return next();
    },
    validateObjectValueSize: function(req, res, next) {
        Object.entries(req.body).forEach(([key, val]) => {
            if (self.fieldOverSized(val)) {
                return next(new Error(`field ${key} more than 10kb. current: ${Utils.getStringSize(val)}`));
            }
        });

        return next();
    },
    ensureJson: function(req, res, next) {
        if (!self.isJSON(req.body)) return next(new Error("data is not in valid json format"));
        req.body = (typeof req.body === "string") ? JSON.parse(req.body) : req.body;
        return next();
    },
    ensureBody: function(req, res, next) {
        if (typeof req.body === "undefined") return next(new Error("no body data found"));
        return next();
    },
    parseCustomSearch: function(params, data) {
        let q = {};
        params.split(",").forEach(i => (q[i.split(":")[0]] = i.split(":")[1]));
        let filtered_data = [];
        Object.entries(q).forEach(([key, value]) => { // "age": ">18"
            data.filter(element => { // {"name":"john", "age": 20}
                if (value.startsWith(">")) {
                    let str = parseInt(value.substr(1)); // ">18" -> "18"
                    return element[key] > str
                }
            });
        });
    },
    dynamicSort: function(property) {
        // https://stackoverflow.com/a/4760279
        let sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }

        return function(a, b) {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    },
    parseQuery: function(query, data) {
        let q = {};
        let fq = query + ",";
        fq.split(",").forEach(i => ((i.length > 1) ? q[i.split(":")[0]] = i.split(":")[1] : ""));
        let keysSize = Object.keys(q).length;
        let filtered = data.filter(element => {
            let resultArray = [];
            Object.entries(q).forEach(([key, value]) => {
                if (typeof element[key] === "undefined") {
                    resultArray.push(false)
                } else if (value.startsWith(">=")) {
                    resultArray.push(parseFloat(element[key]) >= parseFloat(value.substr(2)));
                } else if (value.startsWith("<=")) {
                    resultArray.push(parseFloat(element[key]) <= parseFloat(value.substr(2)));
                } else if (value.startsWith(">")) {
                    resultArray.push(parseFloat(element[key]) > parseFloat(value.substr(1)));
                } else if (value.startsWith("<")) {
                    resultArray.push(parseFloat(element[key]) < parseFloat(value.substr(1)));
                } else if (value.startsWith("=")) {
                    resultArray.push(parseFloat(element[key]) === parseFloat(value.substr(1)));
                } else if (value.startsWith("*")) {
                    resultArray.push(element[key].endsWith(value.substr(1)));
                } else if (value.endsWith("*")) {
                    resultArray.push(element[key].startsWith(value.slice(0, -1)));
                } else if (value.toLowerCase() === "true") {
                    resultArray.push(element[key] === true);
                } else if (value.toLowerCase() === "false") {
                    resultArray.push(element[key] === false);
                } else {
                    resultArray.push(element[key] === value);
                }
            });

            return resultArray.filter(element => {
                return element;
            }).length === keysSize;
        })

        return filtered;
    },
    formatDatabaseJson: function(data, updatedData = null, isUpdate = false) {
        if (!isUpdate) {
            return Object.assign(data, {
                _id: `-${cryptoRandomString({ length: 8, type: "url-safe" })}`,
                _createdOn: new Date()
            });
        }

        return Object.assign(updatedData, {
            _id: data["_id"],
            _createdOn: data["_createdOn"],
            _updatedOn: new Date()
        });

        // return Object.assign(data, updatedData, {
        //     _id: data["_id"],
        //     _createdOn: data["_createdOn"],
        //     _updatedOn: new Date()
        // });
    },
    paginate: function(array, page_size, page_number) {
        // https://stackoverflow.com/a/42761393
        --page_number;
        return array.slice(page_number * page_size, (page_number + 1) * page_size);
    },
    reqHasPage: function(req) {
        return typeof req.query["page"] !== "undefined" && parseInt(req.query["page"], 10);
    },
    reqHasLimit: function(req) {
        return typeof req.query["limit"] !== "undefined" && parseInt(req.query["limit"], 10);
    }
}