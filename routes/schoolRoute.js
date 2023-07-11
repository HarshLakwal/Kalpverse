import express from "express";
import schoolController from "../controller/schoolController.js";
import multer from "../middleWares/imageUpload.js";
import auth from "../middleWares/auth.js";
const router = express.Router();

router.post("/login", schoolController.schoolLogin);
router.get("/get-single/:id", schoolController.getSingleSchool);

router.use(auth);
router.post(
  "/register",
  multer.imgUpload.single("profilePic"),
  schoolController.schoolRegister
);
router.get("/get-schools", schoolController.allSchoolList);
router.patch(
  "/update/:id",
  multer.imgUpload.single("profilePic"),
  schoolController.schoolUpdate
);
router.delete("/delete/:id", schoolController.schoolDelete);

export default router;
