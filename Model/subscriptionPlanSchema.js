import mongoose from "mongoose";
const Schema = mongoose.Schema;

const subscriptionPlanSchema = new Schema(
  {
    subscriptionTitle: { type: String, required: true },
    subscriptionPrice: { type: String, required: true },
    subscriptionValidity: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("subscriptionPlan", subscriptionPlanSchema);
