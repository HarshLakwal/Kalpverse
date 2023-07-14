import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    levelName: { type: String, required: true },
    description: { type: String, required: true },
    role: { type: String, default: "admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("level", levelSchema);
