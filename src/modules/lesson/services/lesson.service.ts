import Lesson, { ILesson } from "../models/lesson.model";
import mongoose from "mongoose";
import {
  PaginationOptions,
  PaginationResult,
  PaginationUtil,
} from "../../../shared/utils/pagination.util";
import Enrollment from "../../enrollment/models/enrollment.model";

export class LessonService {
  
  static async createLesson(lessonData: {
    title: string;
    content: string;
    order: number;
    course: string;
    videoUrl: string;
    videoType: "upload" | "link";
  }): Promise<ILesson> {
    return Lesson.create(lessonData);
  }

  static async getLessonsForCourse(
    courseId: string,
    options: PaginationOptions,
    userId?: string
  ): Promise<PaginationResult<any>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    const totalItems = await Lesson.countDocuments({ course: courseId });

    const lessons = await Lesson.find({ course: courseId })
      .populate("course", "title instructor imageUrl")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit)
      .lean();

    if (!userId) {
      const lessonsWithDefault = lessons.map(lesson => ({
        ...lesson,
        isCompleted: false,
      }));
      return PaginationUtil.createPaginationResult(lessonsWithDefault, totalItems, options);
    }

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
    });

    const completedLessonSet = new Set(
      enrollment ? enrollment.completedLessons.map(id => id.toString()) : []
    );

    const lessonsWithCompletion = lessons.map(lesson => ({
      ...lesson,
      isCompleted: completedLessonSet.has(lesson._id.toString()),
    }));

    return PaginationUtil.createPaginationResult(lessonsWithCompletion, totalItems, options);
  }

  static async getLessonById(lessonId: string): Promise<ILesson | null> {
    return Lesson.findById(lessonId).populate("course");
  }

  static async updateLesson(
    lessonId: string,
    updateData: {
      title?: string;
      content?: string;
      order?: number;
      videoUrl?: string;
      videoType?: "upload" | "link"; 
    }
  ): Promise<ILesson | null> {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    Object.assign(lesson, updateData);
    return lesson.save();
  }

  static async deleteLesson(lessonId: string): Promise<void> {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await lesson.deleteOne();
  }

  static async checkLessonOwnership(
    lessonId: string,
    instructorId: string
  ): Promise<boolean> {
    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (lesson.course instanceof mongoose.Types.ObjectId) {
      throw new Error("Server error: Could not populate course details.");
    }

    return lesson.course.instructor.toString() === instructorId;
  }

  static async countLessonsForCourse(courseId: string): Promise<number> {
    return Lesson.countDocuments({ course: courseId });
  }
}