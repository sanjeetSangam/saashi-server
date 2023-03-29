const messageModel = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// create message
module.exports.addMessage = async (req, res, next) => {
  try {
    // take the message content and chatid of particular group from req
    const { chatId, content } = req.body;

    // handle not chatid and message
    if (!content || !chatId) {
      console.log("Meaning less data:(");
      return res.sendStatus(400);
    }

    // message body for creation
    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    // create
    let data = await messageModel.create(newMessage);

    // populate with the send
    data = await data.populate("sender", "first_name  last_name avatarImage");

    // populate with the chat
    data = await data.populate("chat");

    // and also populate the users inside that chat
    data = await User.populate(data, {
      path: "chat.users",
      select: "first_name last_name avatarImage username",
    });

    // update the current chat with the message body as the latest message
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: data,
    })
      .lean()
      .exec();

    // return the msg
    if (data) {
      return res.json(data).status(201);
    }

    // return the error
    return res.json({ msg: "Failed to add message to the databse" });

    //
  } catch (err) {
    next(err);
  }
};

// fetch all chat for current chat
module.exports.getMessages = async (req, res, next) => {
  try {
    // fetch with the help of params coming from the url and populate also
    const messages = await messageModel
      .find({
        chat: req.params.chatId,
      })
      .populate("sender", "first_name last_name avatarImage username")
      .populate("chat")
      .lean()
      .exec();

    // return all messages found for the currrent chat
    return res.json(messages).status(200);
    //
  } catch (err) {
    next(err);
  }
};
