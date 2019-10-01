const router = require("express").Router();
const Utils = require("../modules/Utils");

router.delete("/*", Utils.validateUrl, (req, res) => {
    let key = req._bin;
    let collection = req._collection;
    let id = req._id;
    let database = req.app.database;
    database.delete({ key, collection, id });
    return res.status(200).json({ success: true })
});

module.exports = router;