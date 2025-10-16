import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../shared/config/cloudinary.config";
import { Request, Response, NextFunction } from "express";

const courseImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "lms/course_images",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: `course-${req.user!._id}-${Date.now()}`,
      resource_type: "image",
    };
  },
});

const lessonVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "lms/lesson_videos",
      resource_type: "video",
      public_id: `lesson-${req.params.courseId}-${Date.now()}`,
      allowed_formats: ["mp4", "mov", "avi", "mkv"],
    };
  },
});

export const uploadCourseImage = multer({ 
  storage: courseImageStorage 
}).single("image");

export const uploadLessonVideo = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer({
    storage: lessonVideoStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
      ];
      if (allowedTypes.includes(file.mimetype)) cb(null, true);
      else cb(new Error("Only video files (mp4, mov, avi, mkv) are allowed"));
    },
  }).single("video");

  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const videoLink = req.body?.videoLink;

    if (videoLink) {
      console.log("Received video link instead of file:", videoLink);
    }

    next();
  });
};