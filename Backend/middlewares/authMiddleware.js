const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
require("dotenv").config();
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //  get token from header
    try {
      token = req.headers.authorization.split(" ")[1];

      //verify the token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      //get user from the token
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("not Authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("not authorized no token");
  }
});
module.exports = { protect };
