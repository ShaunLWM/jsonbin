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
            let c = (typeof v["_collection"] !== "undefined") ? `#${v["_collection"]}` : "";
            this.client.hmset(key, {
                [`${v["_id"]}${c}`]: flatted.stringify(v)
            });
        });
    }

    async get(key, collection) {
        if (typeof collection === "undefined") {
            let data = await this.client.hgetallAsync(key);
            return this.parseObj(data);
        }

        let arr = [];
        let cursor = "0";
        let shouldEnd = false;
        while (!shouldEnd) {
            let data = await this.client.hscanAsync(key, cursor, "MATCH", `*#${collection}`);
            cursor = data[0];
            if (data[1].length > 0) {
                arr = arr.concat(data[1].filter((element, index) => {
                    return index % 2 === 1;
                }).map(v => {
                    return flatted.parse(v);
                }));
            }

            if (cursor === "0") break;
        }

        return arr;
    }

    parseObj(data) {
        let arr = []
        Object.entries(data).forEach(([key, value]) => {
            arr.push(flatted.parse(value));
        });

        return arr;
    }
}

module.exports = Redis;