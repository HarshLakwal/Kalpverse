import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    schoolName: { type: String, required: true },
    schoolEmail: { type: String, required: true },
    schoolPassword: { type: String, required: true },
    schoolAddress: { type: String, required: true },
    schoolCity: { type: String, required: true },
    schoolState: { type: String, required: true },
    schoolPhone: { type: String, required: true },
    profilePic: { type: String, required: true },
    role: { type: String, default: "school" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("school", schoolSchema);
