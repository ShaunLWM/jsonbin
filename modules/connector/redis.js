const redis = require("redis");
const flatted = require("flatted")
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);

class Redis {
    constructor() {
        this.client = redis.createClient();
    }

    keyExists(key) {
        return this.client.exists(key);
    }

    add(key, value) {
        if (!Array.isArray(value)) value = [value];
        value.map(v => {
            this.client.hmset(key, {
                [v["_id"]]: flatted.stringify(v)
            });
        });
    }

    async get(key) {
        return await this.client.hgetallAsync(key);
    }
}

module.exports = Redis;