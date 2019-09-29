const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const Utils = require("../modules/Utils");
const uuid = require("uuid/v4");

router.post("/add", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}), (req, res, next) => {
    if (typeof req.body === "undefined") {
        throw new Error("no body data found");
    }

    if (!Utils.isJSON(req.body)) {
        throw new Error("data is not in valid json format");
    }

    let data = (typeof req.body === "object") ? req.body : JSON.parse(req.body);
    Object.entries(data).forEach(([key, val]) => {
        if (Utils.fieldOverSized(val)) {
            throw new Error(`field ${key} more than 10kb. current: ${Utils.getStringSize(val)}`);
        }
    });

    data = Object.assign({
        _id: uuid(),
        _createdOn: new Date()
    }, data);

    return res.status(200).json(data)
});

module.exports = router;