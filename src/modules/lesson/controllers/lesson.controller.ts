import { Request, Response } from "express";
import { LessonService } from "../services/lesson.service";
import { CourseService } from "../../course/services/course.service";
import { PaginationUtil } from "../../../shared/utils/pagination.util";
import { ResponseUtil } from "../../../shared/utils/response.util";
import { ValidationUtil } from "../../../shared/utils/validation.util";

export class LessonController {

  static async addLessonToCourse(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, order, videoLink } = req.body;
      const { courseId } = req.params;

      if (!title || !content || !order) {
        ResponseUtil.validationError(res, "Please provide all fields");
        return;
      }

      if (!req.file && !videoLink) {
        ResponseUtil.validationError(
          res,
          "Please either upload a video file or provide a video link"
        );
        return;
      }

      if (videoLink && !ValidationUtil.isValidUrl(videoLink)) {
        ResponseUtil.validationError(res, "Please provide a valid video URL");
        return;
      }

      const course = await CourseService.getCourseById(courseId);
      if (!course) {
        ResponseUtil.notFound(res, "Course not found");
        return;
      }

      const isOwner = await CourseService.checkCourseOwnership(
        courseId,
        (req.user!._id as any).toString()
      );
      if (!isOwner) {
        ResponseUtil.forbidden(res, "User not authorized to add lessons to this course");
        return;
      }
      const videoUrl = req.file ? req.file.path : videoLink;
      const videoType = req.file ? "upload" : "link";

      const lesson = await LessonService.createLesson({
        title,
        content,
        order,
        course: courseId,
        videoUrl,
        videoType,
      });

      ResponseUtil.success(res, lesson, "Lesson created successfully", 201);
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }

  static async getLessonsForCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const paginationOptions = PaginationUtil.validatePaginationParams(req, res);
      if (!paginationOptions) return;

      const userId = req.user?._id?.toString();
      const result = await LessonService.getLessonsForCourse(
        courseId,
        paginationOptions,
        userId
      );

      ResponseUtil.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Lessons retrieved successfully"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }

  static async updateLesson(req: Request, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const instructorId = (req.user!._id as any).toString();

      const isOwner = await LessonService.checkLessonOwnership(lessonId, instructorId);
      if (!isOwner) {
        ResponseUtil.forbidden(res, "User not authorized to update this lesson");
        return;
      }

      const { title, content, order, videoLink } = req.body;
      const updateData: any = {};

      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (order) updateData.order = order;

      // Handle video update
      if (req.file) {
        updateData.videoUrl = req.file.path;
        updateData.videoType = "upload";
      } else if (videoLink) {
        if (!ValidationUtil.isValidUrl(videoLink)) {
          ResponseUtil.validationError(res, "Please provide a valid video URL");
          return;
        }
        updateData.videoUrl = videoLink;
        updateData.videoType = "link";
      }

      const updatedLesson = await LessonService.updateLesson(lessonId, updateData);
      ResponseUtil.success(res, updatedLesson, "Lesson updated successfully");
    } catch (error: any) {
      LessonController.handleLessonError(res, error);
    }
  }

  static async deleteLesson(req: Request, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const instructorId = (req.user!._id as any).toString();

      const isOwner = await LessonService.checkLessonOwnership(lessonId, instructorId);
      if (!isOwner) {
        ResponseUtil.forbidden(res, "User not authorized to delete this lesson");
        return;
      }

      await LessonService.deleteLesson(lessonId);
      ResponseUtil.success(
        res,
        { message: "Lesson removed successfully" },
        "Lesson deleted successfully"
      );
    } catch (error: any) {
      LessonController.handleLessonError(res, error);
    }
  }

  // Helper method for error handling
  private static handleLessonError(res: Response, error: any): void {
    console.error(error);
    if (error.message === "Lesson not found") {
      ResponseUtil.notFound(res, error.message);
    } else if (error.message === "Server error: Could not populate course details.") {
      ResponseUtil.error(res, error.message, 500);
    } else {
      ResponseUtil.error(res, "Server Error", 500);
    }
  }
}