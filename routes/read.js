const router = require("express").Router();
const Utils = require("../modules/Utils");
const flatted = require("flatted");

router.get("/*", Utils.validateUrl, async(req, res, next) => {
    let database = req.app.database;
    let key = req._bin;
    if (!database.keyExists(key)) return next(new Error("bin does not exist"));
    let data = await database.get(key, req);
    return res.status(200).json(data);
});

module.exports = router;