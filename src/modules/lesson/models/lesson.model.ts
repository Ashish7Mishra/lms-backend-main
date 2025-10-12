import mongoose, { Document, Schema } from "mongoose";
import { ICourse } from "../../course/models/course.model";

export interface ILesson extends Document {
  course: mongoose.Types.ObjectId | ICourse;
  title: string;
  content: string;
  order: number;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    course: { type: Schema.Types.ObjectId, required: true, ref: "Course" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILesson>("Lesson", lessonSchema);