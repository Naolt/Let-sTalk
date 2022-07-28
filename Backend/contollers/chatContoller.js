const bcrypt = require("bcrypt");
const User = require("../models/User");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//let respStucture = {
//  user: {},
//  chats: [
//    {
//      chatID: "dfkdkdf",
//      other: {
//        _id,
//        userName,
//        firstName,
//        lastName,
//        email,
//        imgUrl,
//      },
//      message: {
//        sender: "e443434",
//        text,
//        status,
//        createdAt,
//        updatedAt,
//      },
//    },
//  ],
//};

const getChats = asyncHandler(async (req, res, next) => {
  let user = req.user;
  try {
    //get all the chats that the user is part of
    let chats = await Chat.find({ members: { $in: [user._id] } }).sort({
      updatedAt: 1,
    });
    let chatsStructured = [];

    for (const [key, chat] of Object.entries(chats)) {
      let messages = [];
      //console.log(chat);
      for (const [key, mesId] of Object.entries(chat.messages)) {
        //console.log(mesId);
        messages.push(await Message.findById(mesId).sort({ createdAt: 1 }));
      }
      console.log(messages);
      othersId = chat.members.filter((personID) => {
        if (personID != user._id) {
          return personID;
        }
      });
      let other = await User.findById(othersId[0]).select("-password");

      chatsStructured.push({
        _id: chat._id,
        messages: messages.sort((a, b) => {
          b.createdAt - a.createdAt;
        }),
        other: other,
      });
    }
    let response = {
      user: user,
      chats: chatsStructured,
    };
    //console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error(error);
  }
});

const sendMessage = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let { text, recv, status } = req.body;
  //check for created chat between the two person
  try {
    let message = new Message({
      text: text,
      sender: user._id,
      status: status,
    });
    let savedMessage = await message.save();

    let chat = await Chat.findOne({
      $and: [{ members: { $in: [user._id] } }, { members: { $in: [recv] } }],
    });

    //if there is existing chat
    if (chat) {
      console.log("chat already created" + chat);

      let messageAppended = [...chat.messages, message._id];

      console.log("message appended chat:" + messageAppended);
      //let updatedChat = await Chat.findByIdAndUpdate(chat._id, {
      //  messages: messageAppended,
      //});

      //update the message array
      let updatedChat = await Chat.findByIdAndUpdate(chat._id, {
        $push: {
          messages: message._id,
        },
      });

      console.log("Updated chat is this" + updatedChat);
      res.status(201).json({
        status: "ok",
        message: "chat Updated  succefully",
        updatedChat,
      });
    } else {
      let newChat = await Chat.create({
        messages: [savedMessage._id],
        members: [user._id, recv],
      });
      res
        .status(201)
        .json({ status: "ok", message: "Chat created succefully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error(error);
  }
});

const getNextMessage = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let chatID = req.params.chat;
  let page = req.params.page;

  const limit = 3;
  let offset = -(limit * page);

  let messages = await Chat.findById(chatID, {
    messages: { $slice: [offset, limit] },
  });

  res.status(200).json(messages);
});
module.exports = {
  getChats,
  sendMessage,
  getNextMessage,
};
