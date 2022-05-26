const {
  register,
  login,
  setAvatar,
  getAllUsers,
  allUsers,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.get("/", protect, allUsers);

module.exports = router;
