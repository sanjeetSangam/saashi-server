const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removefromGroup } = require("../controllers/chatController");

// normal route without chaining
router.post("/", protect, accessChat);

// route is used for chaining the routes
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/editchat").put(protect, renameGroup);
router.route("/addgroup").put(protect, addToGroup);
router.route("/removefromgroup").put(protect, removefromGroup);

module.exports = router;
