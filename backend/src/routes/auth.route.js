import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller.js";

const router = Router();

router.get("/signin", signin);

router.get("/signup", signup);

router.get("/signout", signup);

export default router;
