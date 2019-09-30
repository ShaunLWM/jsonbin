const redis = require("../modules/connector/redis");
let db = new redis();
console.log(db.keyExists("lol"))

db.addObj("lol", {
    name: "lame1",
    id: "id1"
})

db.addObj("lol", {
    name: "lame2",
    id: "id2"
})