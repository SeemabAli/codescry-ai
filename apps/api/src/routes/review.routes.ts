import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  getReviewByIdController,
  getReviewsController,
} from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createReviewController);
router.get("/", getReviewsController);
router.get("/:id", getReviewByIdController);
router.delete("/:id", deleteReviewController);

export default router;