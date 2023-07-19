import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    adminPassword: { type: String, required: true },
    profilePic: { type: String, require: true },
    role: { type: mongoose.Types.ObjectId, ref: "role", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("admin", adminSchema);
