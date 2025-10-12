import Enrollment, { IEnrollment } from "../models/enrollment.model";
import { LessonService } from "../../lesson/services/lesson.service";
import {
  PaginationOptions,
  PaginationResult,
  PaginationUtil,
} from "../../../shared/utils/pagination.util";
import { IUser } from "../../user/models/user.model";

export class EnrollmentService {
  
  static async createEnrollment(enrollmentData: {
    student: string;
    course: string;
  }): Promise<IEnrollment> {
    return Enrollment.create(enrollmentData);
  }

  static async findEnrollment(
    studentId: string,
    courseId: string
  ): Promise<IEnrollment | null> {
    return Enrollment.findOne({ student: studentId, course: courseId });
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

  // MAIN METHOD: Get student enrollments with progress (used by controller)
  static async getStudentEnrollmentsWithProgress(
    studentId: string,
    options: PaginationOptions
  ): Promise<PaginationResult<any>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const totalItems = await Enrollment.countDocuments({ student: studentId });

    // Fetch enrollments with populated data
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: "course",
        select: "title description category imageUrl isActive",
        populate: { path: "instructor", select: "name email" },
      })
      .populate({
        path: "completedLessons",
        select: "title order videoUrl course",
      })
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit);

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Handle case where course doesn't exist
        if (!enrollment.course || !enrollment.course._id) {
          return {
            ...enrollment.toObject(),
            progress: 0,
            totalLessons: 0,
          };
        }

        // Calculate progress
        const totalLessons = await LessonService.countLessonsForCourse(
          enrollment.course._id.toString()
        );
        const completedCount = enrollment.completedLessons.length;
        const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

        return {
          ...enrollment.toObject(),
          progress: Math.round(progress),
          totalLessons,
        };
      })
    );

    return PaginationUtil.createPaginationResult(
      enrollmentsWithProgress,
      totalItems,
      options
    );
  }

  // Get students enrolled in a course (used by CourseController)
  static async getStudentsForCourse(
    courseId: string,
    options: PaginationOptions
  ): Promise<PaginationResult<IUser>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const filter = { course: courseId };
    const totalItems = await Enrollment.countDocuments(filter);

    const enrollments = await Enrollment.find(filter)
      .populate("student", "name email createdAt")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit);

    const students = enrollments.map(
      enrollment => enrollment.student
    ) as unknown as IUser[];

    return PaginationUtil.createPaginationResult(students, totalItems, options);
  }
}