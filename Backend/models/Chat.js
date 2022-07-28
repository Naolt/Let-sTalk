const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    messages: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: "Message",
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
