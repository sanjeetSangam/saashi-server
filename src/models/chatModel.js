const mongoose = require("mongoose");

// chat model with the reference of particular chat users, latest message with the sender and message body, if it is gorup then the group admin also
const chatModel = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },

    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Chat = mongoose.model("chat", chatModel);

module.exports = Chat;
