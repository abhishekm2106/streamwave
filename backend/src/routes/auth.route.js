import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signin", signin);

router.post("/signup", signup);

router.post("/signout", signup);

export default router;
