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
    cleanPath: function(str) {
        return str.substr(1)
    },
    binURLValidator: function(req, res, next) {
        let path = self.cleanPath(req.path);
        if (path.match(new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)) === null) return next(new Error("uuid is in wrong format"));
        return next();
    },
    validateObjectValueSize: function(obj) {
        Object.entries(obj).forEach(([key, val]) => {
            if (self.fieldOverSized(val)) {
                return `field ${key} more than 10kb. current: ${Utils.getStringSize(val)}`;
            }
        });

        return null;
    }
}