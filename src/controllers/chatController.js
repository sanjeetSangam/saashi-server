const Chat = require("../models/chatModel");

const User = require("../models/userModel");

// create and fetch chat for user : one on one
const accessChat = async (req, res) => {
  try {
    // userId coming from the req
    const { userId } = req.body;

    // if there is no userId coming then make a error
    if (!userId) {
      console.log("UserId param is not sent with the request");
      return res.sendStatus(400);
    }

    //  if there is chatId then.. find the non group chat if exists then just populate it
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

    // if chat is already there then populate the message also with sender i.e latest message
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender", // path for the sender inside the latest message
      select: "first_name last_name avatarImage username", // populate with following details
    });

    // again if the chat exist, then just send existing chat with updated details
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      // otherwise create new chat
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createChat = await Chat.create(chatData);

      // after creating, just populate the new chat with user details
      const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );

      //  send back
      res.send(FullChat).status(200);
    }
  } catch (err) {
    res.send(err.message).status(400);
  }
};

// fetch all chat to current user
const fetchChats = async (req, res) => {
  try {
    // find all chat , the current user is part of and populate it
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) // and sort to latest chat created
      .lean()
      .exec()
      .then(async (results) => {
        //and populate also the message field inside the latest message
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

// create group chat
const createGroupChat = async (req, res) => {
  try {
    //  if there is no user and name of group
    if (!req.body.users || !req.body.name) {
      return res.send("Please fill all the fields").status(400);
    }

    // take all users from user body and parse it
    let users = JSON.parse(req.body.users);

    // if users is more than 2
    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users is required to form a group chat");
    }

    // if above are good to do, then push the current logged in user to user list
    users.push(req.user);

    // create new group with following details
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // and find it with the help of id from DB and populate it with the references
    const fullGroupChat = await Chat.findOne({
      _id: groupChat._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // console.log(fullGroupChat);

    // send back
    return res.send(fullGroupChat).status(200);
    //
  } catch (err) {
    res.send(err.message).status(400);
  }
};

// rename the group
const renameGroup = async (req, res) => {
  try {
    // chat id and chatname from the req
    const { chatId, chatName } = req.body;

    // find the group with the following id and update the fields and populate with the ref
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // if not chat found with the following id then error
    if (!updatedChat) {
      res.send("Chat not Found").status(404);
    } else {
      // return updated chat if all good to go
      res.json(updatedChat).status(201);
    }
    //
  } catch (err) {
    res.send(err.message).status(400);
  }
};

// add members to group
const addToGroup = async (req, res) => {
  try {
    // take the chat id and userId that to be pushed into group from req
    const { chatId, userId } = req.body;

    // update by finding chat and adding user into the group
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // handle not chat found and if no error then send the updated chat
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

// remove member from group
const removefromGroup = async (req, res) => {
  try {
    // take the chat id and userid that is to be removed
    const { chatId, userId } = req.body;

    // pull out of the group and update the group
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // handle not chat found and if no error then send the updated chat
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
