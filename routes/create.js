const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const Utils = require("../modules/Utils");

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

    if (typeof req.body === "object") {
        Object.entries(req.body).forEach(([key, val]) => {
            if (Utils.fieldOverSized(val)) {
                throw new Error(`field ${key} more than 10kb. current: ${Utils.getStringSize(val)}`);
            }
        });

        // TODO: Add id, createdOn
    }

    return res.status(200).json({ success: true })
});

module.exports = router;