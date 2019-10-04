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
        if (!validKeys) return next(new Error("Invalid JSON keys. Keys should start with an alphabet"));
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
        return str.match(new RegExp(/^bin_[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)) !== null;
    },
    validateUrl: function(req, res, next) {
        let paths = self.cleanPath(req.path);
        if (paths.length > 2 || paths.length < 1) return next(new Error("wrong path parameters"))
        if (!self.matchUUIDv4(paths[0])) {
            return next(new Error("uuid is in wrong format"));
        }

        if (paths.length === 2) {
            if (self.matchCollection(paths[1])) {
                if (paths[1].length > 20) return next(new Error("collection length cannot be longer than 20 characters"));
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
    }
}