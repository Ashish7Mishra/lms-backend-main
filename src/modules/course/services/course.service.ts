import Course, { ICourse } from "../models/course.model";
import mongoose from "mongoose";
import {
  PaginationOptions,
  PaginationResult,
  PaginationUtil,
} from "../../../shared/utils/pagination.util";
import Enrollment from "../../enrollment/models/enrollment.model";
import Lesson from "../../lesson/models/lesson.model";
import User from "../../user/models/user.model";

export class CourseService {

  static async createCourse(courseData: {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    instructor: string;
  }): Promise<ICourse> {
    return Course.create(courseData);
  }

  static async getAllCourses(
    options: PaginationOptions,
    userId?: string
  ): Promise<PaginationResult<any>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    
    const activeInstructors = await User.find({
      role: "Instructor",
      isActive: true
    }).select("_id");

    const activeInstructorIds = activeInstructors.map(u => u._id);

    const query = {
      isActive: true,
      instructor: { $in: activeInstructorIds }
    };

    const totalItems = await Course.countDocuments(query);

    const courses = await Course.find({})
      .populate("instructor", "name email")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit)
      .lean();

    // If no user, return courses with default enrollment status
    if (!userId) {
      const coursesWithDefaults = courses.map((course) => ({
        ...course,
        enrollment: false,
        progress: 0,
      }));
      return PaginationUtil.createPaginationResult(coursesWithDefaults, totalItems, options);
    }

    // Get user's enrollments
    const courseIds = courses.map((course) => course._id);
    const userEnrollments = await Enrollment.find({
      student: userId,
      course: { $in: courseIds },
    });

    const enrolledCourseIds = userEnrollments.map(e => e.course);

    // Get lesson counts for enrolled courses
    const lessonCountsResult = await Lesson.aggregate([
      { $match: { course: { $in: enrolledCourseIds } } },
      { $group: { _id: '$course', totalLessons: { $sum: 1 } } }
    ]);

    // Create maps for quick lookup
    const enrollmentMap = new Map(
      userEnrollments.map((e) => [e.course.toString(), e])
    );
    const lessonCountMap = new Map(
      lessonCountsResult.map(lc => [lc._id.toString(), lc.totalLessons])
    );

    // Add enrollment and progress to each course
    const coursesWithProgress = courses.map((course) => {
      const enrollment = enrollmentMap.get(course._id.toString());

      if (enrollment) {
        const totalLessons = lessonCountMap.get(course._id.toString()) || 0;
        const progress = totalLessons > 0
          ? (enrollment.completedLessons.length / totalLessons) * 100
          : 0;

        return {
          ...course,
          enrollment: true,
          progress: Math.round(progress),
        };
      }

      return {
        ...course,
        enrollment: false,
        progress: 0,
      };
    });

    return PaginationUtil.createPaginationResult(coursesWithProgress, totalItems, options);
  }

  static async getCourseById(id: string): Promise<ICourse | null> {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid course ID");
    }
    return Course.findById(id).populate("instructor", "name email");
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

    if (!course.isActive) {
      throw new Error("Cannot update an inactive course");
    }

    Object.assign(course, updateData);
    return course.save();
  }

  static async deleteCourse(id: string): Promise<void> {
    const course = await Course.findById(id);
    if (!course) {
      throw new Error("Course not found");
    }
    course.isActive = false;
    await course.save();
  }

  static async getCoursesByInstructor(
    instructorId: string,
    options: PaginationOptions
  ): Promise<PaginationResult<ICourse>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const totalItems = await Course.countDocuments({ instructor: instructorId });

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