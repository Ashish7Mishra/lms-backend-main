import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../shared/config/cloudinary.config";

const courseImageStorage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params: async (req,file)=>{
        return{
            folder:"lms/course_images",
            allowed_formats:["jpg","png","jpeg"],
            public_id:`course-${req.user!._id}-${Date.now()}`,
            resource_type: "image",
        }
    }
})

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

export const uploadCourseImage = multer({ storage: courseImageStorage }).single(
  "image"
);

export const uploadLessonVideo = multer({ storage: lessonVideoStorage }).single(
  "video"
);