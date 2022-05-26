const express = require("express");

const cors = require("cors");
const mongoose = require("mongoose");

const userRoute = require("./src/routes/userRoute");
const messageRoute = require("./src/routes/messagesRoutes");
const chatRoutes = require("./src/routes/chatRoutes");

const app = express();
const socket = require("socket.io");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

// user routes
app.use("/api/auth", userRoute);

// message route
app.use("/api/messages", messageRoute);

// chat routes
app.use("/api/chat", chatRoutes);

// database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB has connected well");
  })
  .catch((err) => {
    console.log(err.message);
  });

// server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server has started on port : ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: ["http://localhost:3000", "https://saashi.netlify.app/"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join_chat", (data) => {
    socket.join(data);
  });

  socket.on("send_msg", (data) => {
    socket.to(data.chat._id).emit("recieve", data);
  });
});
