import mongoose, { Document, Schema, Model } from "mongoose";
import { ICourse } from './courseModel';


export interface ILesson extends Document {
  course: mongoose.Types.ObjectId | ICourse; 
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema: Schema<ILesson> = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson: Model<ILesson> = mongoose.model<ILesson>("Lesson", lessonSchema);

export default Lesson;
