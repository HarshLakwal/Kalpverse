import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    level: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        options: {
          option1: { type: String, required: true },
          option2: { type: String, required: true },
          option3: { type: String, required: true },
          option4: { type: String, required: true },
        },
        correctAnswer: {
          type: String,
          required: true,
        },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.questions.correctAnswer;
  return obj;
 }

export default mongoose.model("quiz", questionSchema);
