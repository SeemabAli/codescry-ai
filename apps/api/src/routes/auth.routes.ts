import { Router } from "express";
import {
  getCurrentUserController,
  loginController,
  registerController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, getCurrentUserController);

export default router;