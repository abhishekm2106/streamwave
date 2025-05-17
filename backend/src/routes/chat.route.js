import { Router } from "express";
import { getStreamToken } from "../controllers/chat.controller.js";
import protectedRoutes from "../middlewares/protectedRoutes.js";

const router = Router();

router.get("/token", protectedRoutes, getStreamToken);

export default router;
