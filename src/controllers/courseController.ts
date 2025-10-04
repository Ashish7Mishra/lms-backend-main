 import { Request, Response } from "express";
import Course from "../models/courseModel";

const createCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, category, imageUrl } = req.body;

        if (!title || !description || !category) {
            res.status(400).json({ message: 'Please provide all fields' });
            return;
        }

        const courseData: any = {
            title,
            description,
            category,
            instructor: req.user._id,
        };

        if (imageUrl) {
            courseData.imageUrl = imageUrl;
        }

        const course = await Course.create(courseData);
        res.status(201).json(course);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
        const courses = await Course.find({})
            .populate("instructor", "name email");

        res.status(200).json(courses);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getCourseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("instructor", "name email");

        if (course) {
            res.status(200).json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'User not authorized to update this course' });
            return;
        }

        const { title, description, category, imageUrl } = req.body;

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.imageUrl = imageUrl || course.imageUrl;

        const updatedCourse = await course.save();
        res.status(200).json(updatedCourse);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'User not authorized to delete this course' });
            return;
        }

        await course.deleteOne();
        res.status(200).json({ message: 'Course removed successfully' });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};
