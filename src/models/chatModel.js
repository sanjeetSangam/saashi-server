const mongoose = require("mongoose");

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
