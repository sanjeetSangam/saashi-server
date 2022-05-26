const {
  addMessage,
  getMessages,
} = require("../controllers/messagesController");
const { protect } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/addmsg", protect, addMessage);
router.get("/:chatId",protect, getMessages);

module.exports = router;
