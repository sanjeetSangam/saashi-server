const messageModel = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { chatId, content } = req.body;

    if (!content || !chatId) {
      console.log("Meaning less data:(");
      return res.sendStatus(400);
    }

    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    let data = await messageModel.create(newMessage);

    data = await data.populate("sender", "first_name  last_name avatarImage");

    data = await data.populate("chat");

    data = await User.populate(data, {
      path: "chat.users",
      select: "first_name last_name avatarImage username",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: data,
    })
      .lean()
      .exec();

    if (data) {
      return res.json(data).status(201);
    }

    return res.json({ msg: "Failed to add message to the databse" });

    //
  } catch (err) {
    next(err);
  }
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const messages = await messageModel
      .find({
        chat: req.params.chatId,
      })
      .populate("sender", "first_name last_name avatarImage username")
      .populate("chat")
      .lean()
      .exec();

    return res.json(messages).status(200);
    //
  } catch (err) {
    next(err);
  }
};
