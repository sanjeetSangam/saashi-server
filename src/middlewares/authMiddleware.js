var jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];

        // decodes token id
        const decoded = jwt.verify(token, process.env.HASH_WORD);

        req.user = await User.findById(decoded.user._id).select("-password");

        next();
      } catch (err) {
        res.status(401);
        throw new Error("Not Authorized, no token");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Not Authorized, no token");
    }
  } catch (err) {
    return res.send(err.message).status(400);
  }
};

module.exports = { protect };
