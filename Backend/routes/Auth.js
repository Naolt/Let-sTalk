const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const {
  register,
  signin,
  getMe,
  signout,
} = require("../contollers/authController");
const catchAsync = require("../middlewares/catchAsync");
const { protect } = require("../middlewares/authMiddleware");
//@desv Register a user

router.post("/signup", catchAsync(register));
router.post("/signin", catchAsync(signin));
router.post("/signout", asyncHandler(signout));
router.get("/getMe", protect, getMe);

module.exports = router;
