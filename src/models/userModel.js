const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, required: true, min: 3, max: 20, unique: true },
    email: { type: String, required: true, max: 50, unique: true },
    password: { type: String, required: true, min: 8 },
    isAvatarImageSet: {
      type: Boolean,
      default: false,
    },
    avatarImage: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
