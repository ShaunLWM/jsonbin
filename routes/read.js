const router = require("express").Router();
const Utils = require("../modules/Utils");
const config = require("../config");

router.get("/*", Utils.validateUrl, async (req, res, next) => {
    let database = req.app.database;
    let key = req._bin;
    let keyExist = await database.keyExists(key);
    if (!keyExist) return next(new Error("bin does not exist"));
    let data = await database.get(key, req);
    // TODO: ?all=1
    let limit = Utils.reqHasLimit(req) || config.dataPerPage;
    let page = Utils.reqHasPage(req) || 1;
    if (limit) data = Utils.paginate(data, limit, page);
    if (typeof req.query["sort"] !== "undefined" && req.query["sort"].trim().length > 0) {
        return res.status(200).json(data.sort(Utils.dynamicSort(req.query["sort"])));
    }

    if (typeof req.query["q"] !== "undefined" && req.query["q"].trim().length > 0) {
        return res.status(200).json(Utils.parseQuery(req.query["q"], data));
    }

    return res.status(200).json(data);
});

module.exports = router;