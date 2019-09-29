const router = require("express").Router();
const Utils = require("../modules/Utils");

router.get("/*", Utils.binURLValidator, (req, res, next) => {

});

module.exports = router;