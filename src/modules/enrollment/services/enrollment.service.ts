import Enrollment, { IEnrollment } from "../models/enrollment.model";
import { LessonService } from "../../lesson/services/lesson.service";
import {
  PaginationOptions,
  PaginationResult,
  PaginationUtil,
} from "../../../shared/utils/pagination.util";

export class EnrollmentService {
  static async createEnrollment(enrollmentData: {
    student: string;
    course: string;
  }): Promise<IEnrollment> {
    const enrollment = await Enrollment.create(enrollmentData);
    return enrollment;
  }

  static async findEnrollment(
    studentId: string,
    courseId: string
  ): Promise<IEnrollment | null> {
    return await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });
  }

  static async getStudentEnrollments(
    studentId: string,
    options: PaginationOptions
  ): Promise<PaginationResult<IEnrollment>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const totalItems = await Enrollment.countDocuments({ student: studentId });

    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
      path: "course",
        select: "title description category imageUrl isActive",
      populate: { path: "instructor", select: "name email" },
    })
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit);

    return PaginationUtil.createPaginationResult(
      enrollments,
      totalItems,
      options
    );
  }

  static async markLessonAsComplete(
    enrollmentId: string,
    lessonId: string
  ): Promise<void> {
    await Enrollment.updateOne(
      { _id: enrollmentId },
      { $addToSet: { completedLessons: lessonId } }
    );
  }

  static async getEnrollmentWithProgress(
    enrollment: IEnrollment
  ): Promise<any> {
    if (!enrollment.course || !enrollment.course._id) {
      return {
        ...enrollment.toObject(),
        progress: 0,
        totalLessons: 0,
      };
    }

    const totalLessons = await LessonService.countLessonsForCourse(
      enrollment.course._id.toString()
    );
    const completedLessonsCount = enrollment.completedLessons.length;

    const progress =
      totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

    return {
      ...enrollment.toObject(),
      progress: Math.round(progress),
      totalLessons: totalLessons,
    };
  }

  static async getEnrollmentsWithProgress(
    enrollments: IEnrollment[]
  ): Promise<any[]> {
    return await Promise.all(
      enrollments.map(async (enrollment) => {
        return await this.getEnrollmentWithProgress(enrollment);
      })
    );
  }

  static async getStudentEnrollmentsWithProgress(
    studentId: string,
    options: PaginationOptions
  ): Promise<PaginationResult<any>> {
    const result = await this.getStudentEnrollments(studentId, options);
    const enrollmentsWithProgress = await this.getEnrollmentsWithProgress(
      result.data
    );

    return {
      data: enrollmentsWithProgress,
      pagination: result.pagination,
    };
  }
}
