const User = require("../models/userModel");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const newToken = (user) => {
  return jwt.sign({ user: user }, process.env.HASH_WORD);
};

// for register user
module.exports.register = async (req, res, next) => {
  try {
    const { first_name, last_name, username, email, password } = req.body;

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      return res.json({ message: "Username already used", status: false });
    }

    const mailCheck = await User.findOne({ email });
    if (mailCheck) {
      return res.json({ message: "Email already used", status: false });
    }

    const hashedPassword = await brcypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
    });

    // we will create token for the user
    const token = newToken(user);

    delete user.password;

    return res.json({ status: true, user, token });
  } catch (err) {
    next(err);
  }
};

// for login
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ message: "User does not exist!", status: false });
    }

    const isPasswordValid = await brcypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.json({
        message: "Incorrect Password! Please enter correct password",
        status: false,
      });
    }

    // if found
    const token = newToken(user);

    delete user.password;

    return res.json({ status: true, user, token });
  } catch (err) {
    next(err);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      {
        new: true,
      }
    );

    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (err) {
    next(err.message);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "first_name",
      "last_name",
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    return res.json(users);
  } catch (err) {
    next(err.message);
  }
};

module.exports.allUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(keyword)
      .find({
        _id: { $ne: req.user._id },
      })
      .lean()
      .exec();

    return res.send(users).status(200);
  } catch (err) {
    next(err);
  }
};
