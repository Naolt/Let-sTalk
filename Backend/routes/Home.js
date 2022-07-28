const express = require("express");
const router = express.Router();
const {
  getChats,
  sendMessage,
  getNextMessage,
} = require("../contollers/chatContoller");
const { protect } = require("../middlewares/authMiddleware");

//loads user profile and chat rooms
router.get("/chats", getChats);

//posts message to the db
router.post("/sendMessage", sendMessage);

//for pagination

router.get("/message/:chat-:page", getNextMessage);

//router.post("/message/:from-:to", (req, res) => {
//  res
//    .status(200)
//    .json({ message: "posting the message" + req.params.from + req.params.to });
//});

module.exports = router;
