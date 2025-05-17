import { Router } from "express";
import {
  onboard,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller.js";
import protectedRoutes from "../middlewares/protectedRoutes.js";

const router = Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/signout", signout);

router.post("/onboarding", protectedRoutes, onboard);

router.get("/me", protectedRoutes, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
