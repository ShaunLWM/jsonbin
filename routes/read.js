const router = require("express").Router();
const Utils = require("../modules/Utils");
const flatted = require("flatted");

router.get("/*", Utils.binURLValidator, async(req, res, next) => {
    let database = req.app.database;
    let bin = req._bin;
    if (!database.keyExists(bin)) return next(new Error("bin does not exist"));
    let data = await database.get(bin, req._collection);
    return res.status(200).json(data);
});

module.exports = router;