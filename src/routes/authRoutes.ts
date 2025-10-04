 import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  instructorTest,
} from "../controllers/authController";
import { protect, isInstructor } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.get("/instructor-test", protect, isInstructor, instructorTest);

export default router;
