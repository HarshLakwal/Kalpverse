import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    schoolName: { type: String, required: true },
    schoolEmail: { type: String, required: true },
    schoolState: { type: String, required: true },
    schoolAddress: { type: String, required: true },
    schoolPhone: { type: String, required: true },
    logo: { type: String, required: true },
    role: { type: String, default: "school" },
    loginDevices: {
      email: { type: String, required: true },
      password: { type: String, required: true },
      devices: [
        {
          deviceId: { type: String, required: true },
        },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("school", schoolSchema);
