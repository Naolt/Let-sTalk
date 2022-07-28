const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  let cookies = req.cookies;
  //check cookie
  try {
    if (cookies?.jwt) {
      //create jwt
      console.log(cookies.jwt);
      const refreshToken = cookies.jwt;

      //check user refresh token
      let foundUser = await User.findOne({ refreshToken: refreshToken });

      if (!foundUser) return res.sendStatus(403); // forbidden

      // evaluate jwt

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          console.log(decoded.id + "-----------" + foundUser._id);
          if (foundUser._id.toString() !== decoded.id.toString()) {
            console.log("Unauthorized access u tried");
            res.status(402).json({ status: "bad", message: "Unauthorized " });
            return;
          }
          const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30s" }
          );
          res.status(200).json({ accessToken });
        }
      );

      //save refresh token with current user
    } else {
      //no cookies
      res.sendStatus(401);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { handleRefreshToken };
