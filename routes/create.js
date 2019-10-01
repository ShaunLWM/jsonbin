const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const Utils = require("../modules/Utils");
const uuid = require("uuid/v4");
const cryptoRandomString = require("crypto-random-string");

router.post("/*", [Utils.validateUrl, Utils.ensureBody, Utils.ensureJson, Utils.validateObjectValueSize, Utils.keysValidator, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})], (req, res) => {
    let data = req.body;
    let finalized = null;
    let db = req.app.database;
    if (Array.isArray(data)) {
        finalized = data.map(element => formatData(element, req, db))
    } else {
        finalized = formatData(data, req, db);
    }

    return res.status(200).json(finalized);
});

function formatData(data, req, db) {
    let p = Object.assign({
        _id: `-${cryptoRandomString({ length: 8, type: "url-safe" })}`,
        _createdOn: new Date(),
        _success: true
    }, data);

    if (typeof req._collection !== "undefined") p["_collection"] = req._collection;
    db.add(req._bin, p);
    return p;
}
module.exports = router;