let self = module.exports = {
    getStringSize: function(str) {
        return Buffer.byteLength(str, "utf8");
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
    }
}