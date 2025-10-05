import { Request, Response } from "express";
import Enrollment from "../models/enrollmentModel";
import Course from "../models/courseModel";
import Lesson from "../models/lessonModel";

// Enroll in a course
const enrollInCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;

    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (alreadyEnrolled) {
      res.status(400).json({ message: "Already enrolled in this course" });
      return;
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
    });

    res.status(201).json(enrollment);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all enrolled courses for a student
const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title");

    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = await Lesson.countDocuments({
          course: enrollment.course._id,
        });
        const completedLessonsCount = enrollment.completedLessons.length;

        const progress = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

        return {
          ...enrollment.toObject(), 
          progress: Math.round(progress),
          totalLessons: totalLessons, 
        };
      })
    );

    res.status(200).json(enrollments);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a lesson as complete
const markLessonAsComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.body;
    const studentId = req.user._id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course,
    });

    if (!enrollment) {
      res.status(404).json({ message: 'You are not enrolled in this course' });
      return;
    }

    await Enrollment.updateOne(
      { _id: enrollment._id },
      { $addToSet: { completedLessons: lessonId } }
    );

    res.status(200).json({ message: 'Lesson marked as complete' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { enrollInCourse, getMyEnrollments, markLessonAsComplete };
