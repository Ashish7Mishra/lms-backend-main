 import { Request, Response } from 'express';
import Lesson from '../models/lessonModel';
import Course from '../models/courseModel';

const addLessonToCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, order } = req.body;
    const { courseId } = req.params;

    if (!title || !content || !order) {
      res.status(400).json({ message: 'Please provide all fields' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'User not authorized to add lessons to this course' });
      return;
    }

    const lesson = await Lesson.create({
      title,
      content,
      order,
      course: courseId,
    });

    res.status(201).json(lesson);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getLessonsForCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 'asc' });
    res.status(200).json(lessons);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId).populate('course');
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'User not authorized to update this lesson' });
      return;
    }

    const { title, content, order } = req.body;
    lesson.title = title || lesson.title;
    lesson.content = content || lesson.content;
    lesson.order = order || lesson.order;

    const updatedLesson = await lesson.save();
    res.status(200).json(updatedLesson);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId).populate('course');
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'User not authorized to delete this lesson' });
      return;
    }

    await lesson.deleteOne();
    res.status(200).json({ message: 'Lesson removed successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  addLessonToCourse,
  getLessonsForCourse,
  updateLesson,
  deleteLesson,
};
