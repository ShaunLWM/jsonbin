const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const Utils = require("../modules/Utils");
const uuid = require("uuid/v4");

router.post("/*", [Utils.binURLValidator, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})], (req, res, next) => {
    if (typeof req.body === "undefined") {
        return next(new Error("no body data found"));
    }

    if (!Utils.isJSON(req.body)) return next(new Error("data is not in valid json format"));
    let data = (typeof req.body === "object") ? req.body : JSON.parse(req.body);
    let finalized = null;
    if (Array.isArray(data)) {
        finalized = []
        data.forEach(element => {
            let result = Utils.validateObjectValueSize(element);
            if (result !== null) return next(new Error(result));
            finalized.push(Object.assign({
                _id: uuid(),
                _createdOn: new Date(),
                _success: true
            }, element));
        });
    } else if (typeof data === "object") {
        let result = Utils.validateObjectValueSize(data);
        if (result !== null) return next(new Error(result));
        finalized = Object.assign({
            _id: uuid(),
            _createdOn: new Date(),
            _success: true
        }, data);
    }

    return res.status(200).json(finalized);
});

module.exports = router;