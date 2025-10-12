// modules/admin/routes/admin.routes.ts

import express from "express";
import { AdminController } from "../controllers/admin.controller";
import { protect, isAdmin } from "../../../shared/middleware/auth.middleware";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// ===== DASHBOARD =====
router.get("/dashboard", AdminController.getDashboard);

// ===== USER MANAGEMENT =====
router.get("/users", AdminController.getAllUsers);
router.get("/users/:id", AdminController.getUserById);
router.patch("/users/:id/toggle-status", AdminController.toggleUserStatus);

// ===== COURSE MANAGEMENT =====
router.get("/courses", AdminController.getAllCourses);
router.get("/courses/:id", AdminController.getCourseById);
router.patch("/courses/:id/toggle-status", AdminController.toggleCourseStatus);

export default router;