const router = require("express").Router();
const Utils = require("../modules/Utils");

router.get("/*", Utils.validateUrl, async(req, res, next) => {
    let database = req.app.database;
    let key = req._bin;
    let keyExist = await database.keyExists(key);
    if (!keyExist) return next(new Error("bin does not exist"));
    let data = await database.get(key, req);
    console.log(req.query);
    if (typeof req.query["sort"] !== "undefined" && req.query["sort"].trim().length > 0) {
        return res.status(200).json(data.sort(Utils.dynamicSort(req.query["sort"])));
    }

    if (typeof req.query["q"] !== "undefined" && req.query["q"].trim().length > 0) {
        let q = {};
        let fq = req.query["q"] + ",";
        fq.split(",").forEach(i => ((i.length > 1) ? q[i.split(":")[0]] = i.split(":")[1] : ""));
        let filtered = [];
        let keysSize = Object.keys(q).length;
        console.log(keysSize);
        filtered = data.filter(element => {
            let resultArray = [];
            Object.entries(q).forEach(([key, value]) => {
                if (typeof element[key] === "undefined") {
                    resultArray.push(false)
                } else if (value.startsWith(">=")) {
                    resultArray.push(element[key] >= parseFloat(value.substr(2)));
                } else if (value.startsWith("<=")) {
                    resultArray.push(element[key] <= parseFloat(value.substr(2)));
                } else if (value.startsWith(">")) {
                    resultArray.push(element[key] > parseFloat(value.substr(1)));
                } else if (value.startsWith("<")) {
                    resultArray.push(element[key] < parseFloat(value.substr(1)));
                } else {
                    resultArray.push(element[key] === value);
                }
            });

            return resultArray.filter(element => {
                return element;
            }).length === keysSize;
        })

        return res.status(200).json(filtered);
    }

    return res.status(200).json(data);
});

module.exports = router;