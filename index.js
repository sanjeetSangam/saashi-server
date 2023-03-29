const express = require("express");

const cors = require("cors");
const mongoose = require("mongoose");

const userRoute = require("./src/routes/userRoute");
const messageRoute = require("./src/routes/messagesRoutes");
const chatRoutes = require("./src/routes/chatRoutes");

const app = express();

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

// sockets with cors
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    credentials: true,
  },
});

// making connections to the socket
io.on("connection", (socket) => {
  // console.log("connnected to socket");

  // making user to join the socket
  socket.on("setup_user", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // user join the current chat
  socket.on("join_chat", (chat) => {
    socket.join(chat);
    // console.log("user has joined the chat" + chat);
  });

  // send message to the current chat
  socket.on("send_msg", (newMessage) => {
    var chat = newMessage.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("recieve", newMessage);
    });
  });

  // disconnect
  socket.off("setup_user", () => {
    conosle.log("User has been disconnected");
    socket.leave(userData._id);
  });
});
