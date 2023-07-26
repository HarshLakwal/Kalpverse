import express from "express";
import multer from "../middleWares/imageUpload.js";
import adminController from "../controller/adminController.js";
import auth from "../middleWares/auth.js";

const router = express.Router();

router.post("/register", multer.imgUpload.single("logo"), adminController.adminRegister);
router.post("/login", adminController.adminLogin);
router.get("/get-all", adminController.getAllAdminList);
router.get("/get-single/:id", adminController.getSingle);
router.get("/activate-deactivateSchool/:id",auth, adminController.activeDeActiveUser);

export default router;
