import express from "express";
import adminRoute from "../routes/adminRoute.js";
import schoolRoute from "./schoolRoute.js";
import quizRoute from "./quizRoute.js";
import subscriptionRoute from "../routes/subscriptionRoute.js";

const router = express.Router();

router.use("/admin", adminRoute);
router.use("/school", schoolRoute);
router.use("/quiz", quizRoute);
router.use("/subscription", subscriptionRoute);

export default router;
