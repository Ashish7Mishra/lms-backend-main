import { Request, Response } from "express";
import { EnrollmentService } from "../services/enrollment.service";
import { LessonService } from "../../lesson/services/lesson.service";
import { PaginationUtil } from "../../../shared/utils/pagination.util";
import { ResponseUtil } from "../../../shared/utils/response.util";
import { CourseService } from "../../course/services/course.service";

export class EnrollmentController {
  static async enrollInCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.body;
      const studentId = (req.user!._id as any).toString();

      const course = await CourseService.getCourseById(courseId);
      if (!course || !course.isActive) {
        ResponseUtil.notFound(res, "Course not found or is inactive");
        return;
      }

      const alreadyEnrolled = await EnrollmentService.findEnrollment(
        studentId,
        courseId
      );

      if (alreadyEnrolled) {
        ResponseUtil.validationError(res, "Already enrolled in this course");
        return;
      }

      const enrollment = await EnrollmentService.createEnrollment({
        student: studentId,
        course: courseId,
      });

      ResponseUtil.success(
        res,
        enrollment,
        "Successfully enrolled in course",
        201
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server error", 500);
    }
  }

  static async getMyEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const studentId = (req.user!._id as any).toString();
      const paginationOptions = PaginationUtil.validatePaginationParams(
        req,
        res
      );
      if (!paginationOptions) return;

      const result = await EnrollmentService.getStudentEnrollmentsWithProgress(
        studentId,
        paginationOptions
      );

      ResponseUtil.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Enrollments retrieved successfully"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server error", 500);
    }
  }

  static async markLessonAsComplete(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { lessonId } = req.body;
      const studentId = (req.user!._id as any).toString();

      const lesson = await LessonService.getLessonById(lessonId);
      if (!lesson) {
        ResponseUtil.notFound(res, "Lesson not found");
        return;
      }

      const enrollment = await EnrollmentService.findEnrollment(
        studentId,
        (lesson.course._id as any).toString()
      );

      if (!enrollment) {
        ResponseUtil.notFound(res, "You are not enrolled in this course");
        return;
      }

      await EnrollmentService.markLessonAsComplete(
        (enrollment._id as any).toString(),
        lessonId
      );
      ResponseUtil.success(
        res,
        { message: "Lesson marked as complete" },
        "Lesson completed successfully"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server Error", 500);
    }
  }
}
