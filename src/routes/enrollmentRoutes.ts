 import express from "express";
import {
  enrollInCourse,
  getMyEnrollments,
  markLessonAsComplete,
} from "../controllers/enrollmentController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, enrollInCourse);
router.get("/", protect, getMyEnrollments);

router.route("/complete-lesson").post(protect, markLessonAsComplete);

export default router;
