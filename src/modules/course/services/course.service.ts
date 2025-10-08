import Course, { ICourse } from "../models/course.model";
import mongoose from "mongoose";
import {
  PaginationOptions,
  PaginationResult,
  PaginationUtil,
} from "../../../shared/utils/pagination.util";
import Enrollment from "../../enrollment/models/enrollment.model";
import Lesson from "../../lesson/models/lesson.model";

export class CourseService {

  static async createCourse(courseData: {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    instructor: string;
  }): Promise<ICourse> {
    const course = await Course.create(courseData);
    return course;
  }

  static async getAllCourses(
    options: PaginationOptions,
    userId?: string
  ): Promise<PaginationResult<any>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const totalItems = await Course.countDocuments({});

    const courses = await Course.find({})
      .populate("instructor", "name email")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit)
      .lean();

    if (!userId) {
      return PaginationUtil.createPaginationResult(courses, totalItems, options);
    }

    const courseIds = courses.map((course) => course._id);
    const userEnrollments = await Enrollment.find({
      student: userId,
      course: { $in: courseIds },
    });
    const enrolledCourseIds = userEnrollments.map(e => e.course);
    const lessonCountsResult = await Lesson.aggregate([
      { $match: { course: { $in: enrolledCourseIds } } },
      { $group: { _id: '$course', totalLessons: { $sum: 1 } } }
    ]);

    const enrollmentMap = new Map(
      userEnrollments.map((e) => [e.course.toString(), e])
    );
    const lessonCountMap = new Map(
      lessonCountsResult.map(lc => [lc._id.toString(), lc.totalLessons])
    );
    // 4. Add 'enrollment' and 'progress' to each course object
    const coursesWithProgress = courses.map((course) => {
      const enrollment = enrollmentMap.get(course._id.toString());

      if (enrollment) {
        const totalLessons = lessonCountMap.get(course._id.toString()) || 0;
        const progress =
          totalLessons > 0
            ? (enrollment.completedLessons.length / totalLessons) * 100
            : 0;

        return {
          ...course,
          enrollment: enrollment, // You can also return just 'true' or the enrollment ID
          progress: Math.round(progress),
        };
      } else {
        return {
          ...course,
          enrollment: null,
          progress: 0,
        };
      }
    });

    return PaginationUtil.createPaginationResult(coursesWithProgress, totalItems, options);
  }

  static async getCourseById(id: string): Promise<ICourse | null> {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid course ID");
    }
    return await Course.findById(id).populate("instructor", "name email");
  }

  static async updateCourse(
    id: string,
    updateData: {
      title?: string;
      description?: string;
      category?: string;
      imageUrl?: string;
    }
  ): Promise<ICourse | null> {
    const course = await Course.findById(id);
    if (!course) {
      throw new Error("Course not found");
    }

    Object.assign(course, updateData);
    return await course.save();
  }

  static async deleteCourse(id: string): Promise<void> {
    const course = await Course.findById(id);
    if (!course) {
      throw new Error("Course not found");
    }
    await course.deleteOne();
  }

  static async getCoursesByInstructor(
    instructorId: string,
    options: PaginationOptions
  ): Promise<PaginationResult<ICourse>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const totalItems = await Course.countDocuments({
      instructor: instructorId,
    });

    const courses = await Course.find({ instructor: instructorId })
      .populate("instructor", "name email")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit);

    return PaginationUtil.createPaginationResult(courses, totalItems, options);
  }

  static async checkCourseOwnership(
    courseId: string,
    instructorId: string
  ): Promise<boolean> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    return course.instructor.toString() === instructorId;
  }
}
