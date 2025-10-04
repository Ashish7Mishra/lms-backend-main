 import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema: Schema<IEnrollment> = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Enrollment: Model<IEnrollment> = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
