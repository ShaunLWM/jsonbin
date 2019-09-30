const redis = require("redis");

class Redis {
    constructor() {
        this.client = redis.createClient();
    }

    keyExists(key) {
        return this.client.exists(key);
    }

    addObj(key, value) {
        if (!Array.isArray(value)) value = [value];
        value.map(v => {
            this.client.hmset(key, v);
        })
    }
}

module.exports = Redis;