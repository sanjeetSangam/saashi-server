const mongoose = require("mongoose");

// model model with sender details with content and the chat which it belongs
const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: { type: String, trim: true },
    chat : {type: mongoose.Schema.Types.ObjectId, ref: "chat"}
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("message", messageSchema);
