import express from "express";
import cors from "cors";
import ejs from "ejs";
import routes from "./routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import socketio from "socket.io";
import * as handlers from "./middlewares.js";
import chatUtils from "./utils/chatUtils.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use("/", handlers.validateToken, routes);
app.set("views", "./public");
app.use("/", express.static("./public"));
app.use("/controller", express.static("./controller"));

io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    const { error, user } = chatUtils.addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = chatUtils.getUser(socket.id);
    io.to(message.room).emit(
      "message",
      chatUtils.generateMessage(message.username, message.text)
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = chatUtils.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: chatUtils.getUsersInRoom(user.room),
      });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
