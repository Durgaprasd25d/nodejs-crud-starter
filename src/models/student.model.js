import mongoose from "mongoose";

const studentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Student email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    age: {
      type: Number,
      min: [6, "Age must be at least 6"],
      max: [60, "Age cannot exceed 60"],
    },
    marks: {
      type: Number,
      min: [0, "Marks cannot be less than 0"],
      max: [100, "Marks cannot exceed 100"],
    },
    city: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
