import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/users.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
import CookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(CookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
