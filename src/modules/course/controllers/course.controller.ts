import { Request, Response } from "express";
import { CourseService } from "../services/course.service";
import { PaginationUtil } from "../../../shared/utils/pagination.util";
import { ResponseUtil } from "../../../shared/utils/response.util";

export class CourseController {
  static async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, category, imageUrl } = req.body;

      if (!title || !description || !category) {
        ResponseUtil.validationError(res, "Please provide all fields");
        return;
      }

      const courseData: any = {
        title,
        description,
        category,
        instructor: (req.user!._id as any).toString(),
      };

      if (imageUrl) {
        courseData.imageUrl = imageUrl;
      }

      const course = await CourseService.createCourse(courseData);
      ResponseUtil.success(res, course, "Course created successfully", 201);
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }

  static async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const paginationOptions = PaginationUtil.validatePaginationParams(
        req,
        res
      );
      if (!paginationOptions) return;
       const userId = req.user?._id?.toString();
       

      const result = await CourseService.getAllCourses(paginationOptions,userId);
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
      const { id } = req.params;

      const course = await CourseService.getCourseById(id);

      if (course) {
        ResponseUtil.success(res, course, "Course retrieved successfully");
      } else {
        ResponseUtil.notFound(res, "Course not found");
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === "Invalid course ID") {
        ResponseUtil.validationError(res, error.message);
      } else {
        ResponseUtil.error(res, "Server Error", 500);
      }
    }
  }

  static async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.id;
      const instructorId = (req.user!._id as any).toString();

      // Check if user owns the course
      const isOwner = await CourseService.checkCourseOwnership(
        courseId,
        instructorId
      );
      if (!isOwner) {
        ResponseUtil.forbidden(
          res,
          "User not authorized to update this course"
        );
        return;
      }

      const { title, description, category, imageUrl } = req.body;
      const updateData: any = {};

      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (category) updateData.category = category;
      if (imageUrl) updateData.imageUrl = imageUrl;

      const updatedCourse = await CourseService.updateCourse(
        courseId,
        updateData
      );
      ResponseUtil.success(res, updatedCourse, "Course updated successfully");
    } catch (error: any) {
      console.error(error);
      if (error.message === "Course not found") {
        ResponseUtil.notFound(res, error.message);
      } else {
        ResponseUtil.error(res, "Server Error", 500);
      }
    }
  }

  static async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.id;
      const instructorId = (req.user!._id as any).toString();

      // Check if user owns the course
      const isOwner = await CourseService.checkCourseOwnership(
        courseId,
        instructorId
      );
      if (!isOwner) {
        ResponseUtil.forbidden(
          res,
          "User not authorized to delete this course"
        );
        return;
      }

      await CourseService.deleteCourse(courseId);
      ResponseUtil.success(
        res,
        { message: "Course removed successfully" },
        "Course deleted successfully"
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

  static async getMyCreatedCourses(req: Request, res: Response): Promise<void> {
    try {
      const paginationOptions = PaginationUtil.validatePaginationParams(
        req,
        res
      );
      if (!paginationOptions) return;

      const result = await CourseService.getCoursesByInstructor(
        (req.user!._id as any).toString(),
        paginationOptions
      );
      ResponseUtil.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Your courses retrieved successfully"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }
}
