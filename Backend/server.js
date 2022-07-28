let express = require("express");
require("dotenv").config();
let mongoose = require("mongoose");
let home = require("./routes/Home");
let auth = require("./routes/Auth");
let cors = require("cors");
let cookieParser = require("cookie-parser");
const { protect } = require("./middlewares/authMiddleware");
const { handleRefreshToken } = require("./contollers/refreshTokenController");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middlewares/credentials");
//intializing the app
let app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

//handle options credentials check before cors
//and fetch cookies credentials requirement
app.use(credentials);

//cross origin resource sharing
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
});

//Connecting to the db

mongoose.connect(process.env.DB_URL).then(() => {
  //and createing the server
  app.listen(process.env.PORT, () => {
    console.log(
      "Connected to the Database and server at port",
      process.env.PORT
    );
  });
});

const errorHandler = (err, req, res, next) => {
  console.log("this is the error" + err);
  res.status(400).json({ message: err.message, stack: err.stack });
};
//routes
app.use("/user", auth);
app.use("/refresh", handleRefreshToken);

app.use("/home", home);
app.use(errorHandler);
