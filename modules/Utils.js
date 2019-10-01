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
    keysValidator: function(req, res, next) {
        return Object.keys(req.body).every(key => /^[A-Za-z]/i.test(key[0]));
    },
    cleanPath: function(str) {
        return str.split("/").filter(s => s.length > 1);
    },
    validateUrl: function(req, res, next) {
        let paths = self.cleanPath(req.path);
        if (paths.length > 2 || paths.length < 1) return next(new Error("wrong path parameters"))
        if (paths[0].match(new RegExp(/^bin_[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)) === null) {
            return next(new Error("uuid is in wrong format"));
        }

        if (paths.length === 2) {
            if (paths[1].match(new RegExp(/^\w+$/g)) === null) return next(new Error("collection only allows alphanumeric characters"));
            req._collection = paths[1].trim();
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
        req.body = (typeof req.body === "object") ? req.body : JSON.parse(req.body);
        return next();
    },
    ensureBody: function(req, res, next) {
        if (typeof req.body === "undefined") return next(new Error("no body data found"));
        return next();
    }
}