const Chat = require("../models/chatModel");

const User = require("../models/userModel");

const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      console.log("UserId param is not sent with the request");
      return res.sendStatus(400);
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .lean()
      .exec();

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "first_name last_name avatarImage username",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );

      res.send(FullChat).status(200);
    }
  } catch (err) {
    res.send(err.message).status(400);
  }
};

const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .lean()
      .exec()
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "first_name last_name avatarImage username",
        });

        res.status(200).send(results);
      });
  } catch (err) {
    res.send(err.message).status(400);
  }
};

const createGroupChat = async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.send("Please fill all the fields").status(400);
    }

    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users is required to form a group chat");
    }

    users.push(req.user);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({
      _id: groupChat._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // console.log(fullGroupChat);

    return res.send(fullGroupChat).status(200);
    //
  } catch (err) {
    res.send(err.message).status(400);
  }
};

const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.send("Chat not Found").status(404);
    } else {
      res.json(updatedChat).status(201);
    }
    //
  } catch (err) {
    res.send(err.message).status(400);
  }
};

const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.send("Chat not Found").status(404);
    } else {
      res.json(added).status(201);
    }

    //
  } catch (err) {
    res.send(err).status(400);
  }
};

const removefromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.send("Chat not Found").status(404);
    } else {
      res.json(removed).status(201);
    }

    //
  } catch (err) {
    res.send(err).status(400);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removefromGroup,
};
