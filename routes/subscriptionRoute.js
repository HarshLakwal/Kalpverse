import express from "express";
import subscriptionController from "../controller/subscriptionController.js";
import multer from "../middleWares/imageUpload.js";
import auth from "../middleWares/auth.js";
const router = express.Router();

router.get("/get-all-plan", subscriptionController.allPlanList);
router.get("/get-single/:id", subscriptionController.getPlanDetail);

router.use(auth);
router.post("/add", subscriptionController.subscriptionAdd);
router.patch("/update/:id", subscriptionController.planUpdate);
router.delete("/delete/:id", subscriptionController.planDelete);

export default router;
