import Course, { ICourse } from "../models/course.model";
import mongoose from "mongoose";
import {
  PaginationOptions,
  PaginationResult,
  PaginationUtil,
} from "../../../shared/utils/pagination.util";

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
    options: PaginationOptions
  ): Promise<PaginationResult<ICourse>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const totalItems = await Course.countDocuments({});

    const courses = await Course.find({})
      .populate("instructor", "name email")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit);

    return PaginationUtil.createPaginationResult(courses, totalItems, options);
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
