 import express from "express";
import {
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController";
import { protect, isInstructor } from "../middleware/authMiddleware";

const router = express.Router();

router
  .route("/:lessonId")
  .put(protect, isInstructor, updateLesson)
  .delete(protect, isInstructor, deleteLesson);

export default router;
