 import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController";
import {
  addLessonToCourse,
  getLessonsForCourse,
} from "../controllers/lessonController";
import { protect, isInstructor } from "../middleware/authMiddleware";

const router = express.Router();

router
  .route("/")
  .post(protect, isInstructor, createCourse)
  .get(getAllCourses);

router
  .route("/:id")
  .get(getCourseById)
  .put(protect, isInstructor, updateCourse)
  .delete(protect, isInstructor, deleteCourse);

router
  .route("/:courseId/lessons")
  .post(protect, isInstructor, addLessonToCourse)
  .get(getLessonsForCourse);

export default router;
