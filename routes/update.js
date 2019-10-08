const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const Utils = require("../modules/Utils");

router.put("/*", [Utils.validateUrl, Utils.ensureBody, Utils.ensureJson, Utils.validateObjectValueSize, Utils.keysValidator, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})], async(req, res, next) => {
    let database = req.app.database;
    let key = req._bin;
    let id = req._id;
    let collection = req._collection;
    if (typeof id === "undefined") return next("id must be provided to update")
    console.log(key, id)
    let data = await database.get(key, req);
    if (data.length === 0) return next("id in bin does not exist");
    if (data.length > 1) return next("id has multiple data. please contact admin");
    // let updatedData = Object.assign(data[0], req.body);
    await database.delete({ key, collection, id });
    let p = Utils.formatDatabaseJson(data[0], req.body, true);
    await database.add(key, p);
    return res.status(200).json(p);
});

module.exports = router;