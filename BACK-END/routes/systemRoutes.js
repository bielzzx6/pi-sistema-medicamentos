// BACK-END/routes/idosoRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/systemController");

router.get("/version", controller.getVersion);
router.get("/verify-auth", controller.verifyAuth);

module.exports = router;
