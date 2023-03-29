var jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

// middleware to authorize the logged in user
const protect = async (req, res, next) => {
  let token;
  try {
    // check if there is headers consisitng the token and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // split the token detail coming from header and take the token from it
        token = req.headers.authorization.split(" ")[1];

        // decodes token id
        const decoded = jwt.verify(token, process.env.HASH_WORD);

        // send the user back without the password
        req.user = await User.findById(decoded.user._id).select("-password");

        // and move onto the next process 
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
