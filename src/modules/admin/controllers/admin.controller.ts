// modules/admin/controllers/admin.controller.ts

import { Request, Response } from "express";
import { AdminService } from "../services/admin.services";
import { PaginationUtil } from "../../../shared/utils/pagination.util";
import { ResponseUtil } from "../../../shared/utils/response.util";

export class AdminController {
  
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      const activities = await AdminService.getRecentActivities();

      ResponseUtil.success(
        res,
        { stats, ...activities },
        "Dashboard data retrieved successfully"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const paginationOptions = PaginationUtil.validatePaginationParams(req, res);
      if (!paginationOptions) return;

      const { role, isActive, search } = req.query;

      const result = await AdminService.getAllUsers(paginationOptions, {
        role: role as string,
        isActive: isActive as string,
        search: search as string,
      });

      ResponseUtil.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Users retrieved successfully"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminService.getUserById(req.params.id);
      ResponseUtil.success(res, user, "User retrieved successfully");
    } catch (error: any) {
      console.error(error);
      if (error.message === "User not found") {
        ResponseUtil.notFound(res, error.message);
      } else {
        ResponseUtil.error(res, "Server Error", 500);
      }
    }
  }

  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminService.toggleUserStatus(req.params.id);
      ResponseUtil.success(
        res,
        user,
        `User ${user.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error: any) {
      console.error(error);
      if (error.message === "User not found") {
        ResponseUtil.notFound(res, error.message);
      } else {
        ResponseUtil.error(res, "Server Error", 500);
      }
    }
  }

  static async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const paginationOptions = PaginationUtil.validatePaginationParams(req, res);
      if (!paginationOptions) return;

      const { category, isActive, search, instructorId } = req.query;

      const result = await AdminService.getAllCourses(paginationOptions, {
        category: category as string,
        isActive: isActive as string,
        search: search as string,
        instructorId: instructorId as string,
      });

      ResponseUtil.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Courses retrieved successfully"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }

  static async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const course = await AdminService.getCourseById(req.params.id);
      ResponseUtil.success(res, course, "Course retrieved successfully");
    } catch (error: any) {
      console.error(error);
      if (error.message === "Course not found") {
        ResponseUtil.notFound(res, error.message);
      } else {
        ResponseUtil.error(res, "Server Error", 500);
      }
    }
  }

  static async toggleCourseStatus(req: Request, res: Response): Promise<void> {
    try {
      const course = await AdminService.toggleCourseStatus(req.params.id);
      ResponseUtil.success(
        res,
        course,
        `Course ${course.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error: any) {
      console.error(error);
      if (error.message === "Course not found") {
        ResponseUtil.notFound(res, error.message);
      } else {
        ResponseUtil.error(res, "Server Error", 500);
      }
    }
  }
}