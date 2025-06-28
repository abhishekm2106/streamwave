import { Router } from "express";
import { getMessages, getStreamToken } from "../controllers/chat.controller.js";
import protectedRoutes from "../middlewares/protectedRoutes.js";

const router = Router();

router.get("/token", protectedRoutes, getStreamToken);

router.get("/messages/:roomId", protectedRoutes, getMessages);

export default router;
