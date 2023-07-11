import express from "express";
import auth from "../middleWares/auth.js";
import quizController from "../controller/quizController.js";
const router = express.Router();

router.use(auth);
router.post("/create", quizController.createQuiz);
router.get("/get-all", quizController.getAllQuiz);
router.get("/get-single/:quizId", quizController.getSingleQuiz);
router.patch("/update/:quizId", quizController.update);
router.delete("/delete/:quizId", quizController.deleteQuiz);
router.post("/result/:quizId", quizController.checkAnswer);

export default router;