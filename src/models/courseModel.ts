 import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICourse extends Document {
  instructor: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema: Schema<ICourse> = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Course: Model<ICourse> = mongoose.model<ICourse>("Course", courseSchema);

export default Course;
