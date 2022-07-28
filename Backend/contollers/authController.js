const bcrypt = require("bcrypt");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

//@desc Register new user
//@route POST /api/user
//@access Public
const register = async (req, res, next) => {
  console.log(req.body);
  let {
    firstName,
    lastName,
    password,
    rePassword,
    email,
    userName,
    imgUrl = "profile.png",
  } = req.body;
  console.log(req.body);

  //checking empty fields

  if (
    !firstName ||
    !lastName ||
    !password ||
    !rePassword ||
    !email ||
    !userName ||
    !imgUrl
  ) {
    res.status(400).json({ status: "bad", message: "Field can't be empty" });
    return;
  }

  //checking if passwords match
  if (password !== rePassword) {
    res.status(400).json({ status: "bad", message: "Password does't match" });
    return;
  }
  //checking duplicate username and
  try {
    const duplicateUser = await User.findOne({ userName: userName });
    if (duplicateUser) {
      res
        .status(400)
        .json({ status: "bad", message: "Username Already taken" });
      return;
    } else {
      const duplicateEmail = await User.findOne({ email: email });
      if (duplicateEmail) {
        res.status(400).json({ status: "bad", message: "Email already taken" });
        return;
      }
    }

    //Hash password
    const salt = await bcrypt.genSalt(10);
    let user;
    bcrypt.hash(password, salt).then(function (hash) {
      // Store hashed password on DB.
      password = hash;
      // insert empty refresh token
      let refreshToken = "";
      user = User.create({
        firstName,
        lastName,
        password: hash,
        email,
        userName,
        imgUrl,
        refreshToken,
      }).then((doc) => {
        res.status(201).json({
          status: "ok",
          message: "User Created Successfully",
          _id: doc.id,
        });
      });
    });

    return;
  } catch (err) {
    next(err);
  }
};

//@desc Authenticate a user
//@route POST /sign/in
//@access Private
const signin = async (req, res, next) => {
  let { email, password } = req.body;
  //check user
  try {
    const user = await User.findOne({ email: email });
    let user_id = user._id;
    if (user && (await bcrypt.compare(password, user.password))) {
      //create jwt
      console.log("true");
      const accessToken = jwt.sign(
        { id: user_id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30s" }
      );
      const refreshToken = jwt.sign(
        { id: user_id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      //save refresh token with current user
      let user = await User.findOneAndUpdate(
        { _id: user_id },
        { refreshToken: refreshToken }
      );

      console.log(user);
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(201).json({ accessToken });
    } else {
      res
        .status(400)
        .json({ status: "bad", message: "Invalid email or password" });
    }
  } catch (err) {
    next(err);
  }
};

const signout = async (req, res, next) => {
  const User = require("../models/User");
  const asyncHandler = require("express-async-handler");
  const jwt = require("jsonwebtoken");

  let cookies = req.cookies;
  //check cookie
  try {
    if (cookies?.jwt) {
      //create jwt
      console.log(cookies.jwt);
      const refreshToken = cookies.jwt;

      //check user refresh token
      let foundUser = await User.findOne({ refreshToken: refreshToken });

      if (!foundUser) {
        res.clearCookie("jwt", { httpOnly: true });
        return res.sendStatus(204); // forbidden
      }

      //delete refresh token of current user
      let updatedUser = await User.findOneAndUpdate(
        { refreshToken: refreshToken },
        { refreshToken: "" }
      );
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      res.sendStatus(204); //no content
    } else {
      //no cookies
      res.sendStatus(204);
    }
  } catch (err) {
    next(err);
  }
};

const getMe = asyncHandler(async (req, res, next) => {
  res.json({ message: "User data display" });
});

//Genereate JWT
const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
module.exports = {
  register,
  signin,
  getMe,
  signout,
};
