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
        finalized = data.map(element => formatData(element))
    } else {
        finalized = formatData(data);
    }

    return res.status(200).json(finalized);
});

function formatData(data) {
    return Object.assign({
        _id: uuid(),
        _createdOn: new Date(),
        _success: true
    }, data);
}
module.exports = router;