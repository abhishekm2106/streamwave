import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/users.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
import CookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
