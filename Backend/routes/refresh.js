const express = require("express");
const router = express.Router();
const refreshTokenController = require("./../contollers/refreshTokenController");

router.get("/", refreshTokenController.refresh);

module.exports = router;
