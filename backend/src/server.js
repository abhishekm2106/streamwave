import express from "express";
import dotenv from "dotenv";
import http from "http";
import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/users.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
import CookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { Server } from "socket.io";
import Chats from "./models/Chats.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app); // server created from app
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

const __dirname = path.resolve(); // get the current directory of the file that is running the code

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow frontend to send cookies to backend
  })
);
app.use(express.json());
app.use(CookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

io.on("connection", (socket) => {
  console.log("User connected with socket id:", socket.id);

  socket.on("join", (data) => {
    socket.data.roomId = data.roomId;
    socket.join(data.roomId);
    console.log("User: " + data.user.fullName + " joined room: " + data.roomId);
  });

  socket.on("leave", (data) => {
    if (socket.data.roomId) {
      console.log("User leaving room:", socket.data.roomId);
      socket.leave(socket.data.roomId);
      delete socket.data.roomId;
    }
  });

  socket.on("message", async (data) => {
    const currentRoomId = socket.data.roomId;
    console.log("Message Received in room: " + currentRoomId);
    const timestamp = new Date().toISOString();

    const messageData = {
      message: data.message,
      authUser: data.authUser,
      time: timestamp,
    };

    const newMessage = await Chats.findByIdAndUpdate(
      currentRoomId,
      {
        $push: { messages: messageData },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    // console.log("New Message: " + newMessage);
    io.to(currentRoomId).emit("receive_message", { ...data, time: timestamp }); // Keep the full data for the frontend
  });

  socket.on("call", (data) => {
    console.log("Call received: " + JSON.stringify(data));
    socket.broadcast.emit("receive_call", data);
  });
  socket.on("cancel_call", (data) => {
    console.log("Call canceller: " + JSON.stringify(data));
    socket.broadcast.emit("cancel_call", data);
  });

  socket.on("decline_call", (data) => {
    console.log("Call declined: " + JSON.stringify(data));
    socket.broadcast.emit("decline_call", data);
  });

  socket.on("timeout_declined", (data) => {
    console.log("Call declined due to timeout: " + JSON.stringify(data));
    socket.broadcast.emit("timeout_declined_server", data);
  });

  socket.on("accept_call", (data) => {
    console.log("Call accepted from server: ");
    console.log(JSON.stringify(data));
    socket.broadcast.emit("accept_call", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Clean up room data when user disconnects
    if (socket.data.roomId) {
      console.log("User left room:", socket.data.roomId);
      socket.leave(socket.data.roomId);
      delete socket.data.roomId;
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
