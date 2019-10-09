const router = require("express").Router();
const Utils = require("../modules/Utils");

router.delete("/*", Utils.validateUrl, async (req, res) => {
    let database = req.app.database;
    let key = req._bin;
    let collection = req._collection;
    let id = req._id;
    if (typeof req.query["q"] !== "undefined" && req.query["q"].trim().length > 0) {
        let data = await database.get(key, req);
        let results = Utils.parseQuery(req.query["q"], data);
        let hashes = [];
        if (results.length > 0) {
            results.map(result => {
                let id = result["_id"];
                if (typeof result["_collection"] !== "undefined") {
                    id = `${result["_id"]}#${result["_collection"]}`;
                }

                hashes.push(id);
            });

            await database.deleteKeyFromId(key, hashes);
        }

        return res.status(200).json({ success: true })
    }

    database.delete({ key, collection, id });
    return res.status(200).json({ success: true })
});

module.exports = router;