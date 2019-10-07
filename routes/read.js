const router = require("express").Router();
const Utils = require("../modules/Utils");

router.get("/*", Utils.validateUrl, async(req, res, next) => {
    let database = req.app.database;
    let key = req._bin;
    let keyExist = await database.keyExists(key);
    if (!keyExist) return next(new Error("bin does not exist"));
    let data = await database.get(key, req);
    if (typeof req.query["sort"] !== "undefined" && req.query["sort"].trim().length > 0) {
        return res.status(200).json(data.sort(Utils.dynamicSort(req.query["sort"])));
    }

    if (typeof req.query["q"] !== "undefined" && req.query["q"].trim().length > 0) {
        return res.status(200).json(Utils.parseQuery(req.query["q"], data));
    }

    return res.status(200).json(data);
});

module.exports = router;