const redis = require("redis");
const flatted = require("flatted")
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);

class Redis {
    constructor() {
        this.client = redis.createClient();
    }

    async keyExists(key) {
        return await this.client.existsAsync(key);
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

    getId(obj) {
        if (typeof obj["_collection"] !== "undefined") {
            return `${obj["_id"]}#${obj["_collection"]}`;
        }

        return obj["_id"];
    }

    async delete({ key, collection, id }) {
        if (typeof collection !== "undefined") {
            let data = await this._get(key, `*#${collection}`);
            if (data.length < 1) return;
            data.forEach(element => {
                this.client.hdel(key, this.getId(element));
            });
        } else if (typeof id !== "undefined") {
            let data = await this._get(key, `${id}*`);
            if (data.length < 1) return;
            data.forEach(element => {
                this.client.hdel(key, this.getId(element));
            });
        } else if (typeof collection === "undefined" && typeof id === "undefined") {
            this.client.del(key);
        }
    }

    async get(key, req) {
        let id = req._id
        let collection = req._collection
        if (typeof id !== "undefined") {
            return await this._get(key, `${id}*`);
        }

        if (typeof collection !== "undefined") {
            return await this._get(key, `*#${collection}`);
        }

        let data = await this.client.hgetallAsync(key);
        return this.parseObj(data);
    }

    async _get(key, params) {
        let arr = [];
        let cursor = "0";
        let shouldEnd = false;
        while (!shouldEnd) {
            let data = await this.client.hscanAsync(key, cursor, "MATCH", params);
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