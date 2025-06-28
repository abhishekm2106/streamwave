import { io } from "socket.io-client";
const serverPath =
  import.meta.env.VITE_BASE_URL === "development"
    ? "http://localhost:5001"
    : "/";
export const socket = io(serverPath);
