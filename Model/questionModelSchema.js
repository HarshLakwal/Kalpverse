import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // quizTitle: { type: String },
    categoryOf: { type: String },
    questions: [
      {
        question: { type: String },
        options: {
          option1: { type: String },
          option2: { type: String },
          option3: { type: String },
          option4: { type: String },
        },
        correctAnswer: {
          type: String,
        },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("quiz", questionSchema);
