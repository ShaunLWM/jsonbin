const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const Utils = require("../modules/Utils");
const uuid = require("uuid/v4");

router.post("/*", [Utils.binURLValidator, Utils.ensureBody, Utils.ensureJson, Utils.validateObjectValueSize, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})], (req, res) => {
    let data = (typeof req.body === "object") ? req.body : JSON.parse(req.body);
    let finalized = null;
    if (Array.isArray(data)) {
        finalized = data.map(element => formatData(element, req._collection))
    } else {
        finalized = formatData(data, req._collection);
    }

    return res.status(200).json(finalized);
});

function formatData(data, collection) {
    let p = Object.assign({
        _id: uuid(),
        _createdOn: new Date(),
        _success: true
    }, data);

    if (typeof collection !== "undefined") p["_collection"] = collection;
    return p;
}
module.exports = router;