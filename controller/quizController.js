import joi from "joi";
import questionModel from "../Model/questionModelSchema.js";

let role;

// const createQuiz = async (req, res, next) => {
//     role = req.user.role
//     // const questionSchema = joi.object({
//     //     categoryOf: joi.string().required(),
//     //     question: joi.string().required(),
//     //     correctAnswer: joi.string().required(),
//     // })
//     // const { error } = questionSchema.validate(req.body);

//     // if (error) {
//     //     return next(error)
//     // }

//     // let dataArray = req.body
//     // dataArray.map((items)=> {
//     //     console.log(items)
//     // })
//     try {
//         let newQuestion
//         if (role === "admin") {
//             console.log(req.body)
//             newQuestion = await questionModel.find({ categoryOf: req.body.categoryOf });
//             console.log(newQuestion)

//             // push in current data
//             if (!newQuestion) {

//                 let newQuestion = new questionModel(req.body)
//                 await newQuestion.save();
//                 return res.status(200).json({
//                     success: true,
//                     message: `New field ${req.body.categoryOf} category added successfully `,
//                     data: newQuestion,
//                 })
//             }

//             //else add new data
//             else {
//                 console.log(req.body)
//                 newQuestion.push(req.body);
//                 newQuestion.save()

//                  await newQuestion.save();
//                 return res.status(200).json({
//                     success: true,
//                     result: `Question added successfully in ${req.body.categoryOf} category`,
//                     data: newQuestion,
//                 })
//             }
//         } else {
//             return res.status(404).json({
//                 success: false,
//                 message: 'you are not a authorized person'
//             })
//         }
//     } catch (err) {
//         return next(err)
//     }

// }

const createQuiz = async (req, res, next) => {
  role = req.user.role;
  const questionSchema = joi.object({
    categoryOf: joi.string().required(),
    questions: joi.array().items({
      question: joi.string().required(),
      options: joi.object().keys({
        option1: joi.string().required(),
        option2: joi.string().required(),
        option3: joi.string().required(),
        option4: joi.string().required(),
      }),
      correctAnswer: joi.string().required(),
    }),
  });
  const { error } = questionSchema.validate(req.body);

  if (error) {
    return next(error);
  }
  try {
    role = req.user.role;
    if (role === "admin") {
      const questionData = await new questionModel(req.body);

      let isExist = await questionModel.findOne({
        categoryOf: req.body.categoryOf,
      });

      if (isExist) {
        return res.status(404).json({
          success: false,
          message: "Quiz already exist",
        });
      }
      else {
        await questionData.save();
        return res.status(201).json({
          success: true,
          message: `Question ${req.body.categoryOf} category added successfully `,
          data: questionData,
        });
    //   } else {
    //     return res.status(401).json({
    //       success: true,
    //       message: `Please fallow proper structure`,
    //     });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (err) {
    return next(err);
  }
};

const getAllQuiz = async (req, res, next) => {
  role = req.user.role;
  try {
    if (role === "admin") {
      const quizList = await questionModel.find();
      let size = quizList.length;
      let message;
      if (size > 1) {
        message = `Total ${size} quizzes available`;
      } else if (size < 1) {
        message = `No quiz found`;
        return res.status(400).json({
          status: true,
          message: message,
        });
      } else {
        message = `Total ${size} quiz available`;
      }
      return res.status(200).json({
        status: true,
        message: message,
        adminList: quizList,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (err) {
    return next(err);
  }
};

const getSingleQuiz = async (req, res, next) => {
  role = req.user.role;
  const { quizId } = req.params;
  try {
    if (role === "admin") {
      const quizList = await questionModel.findById(quizId);
      let size = quizList.questions.length;
      let message;
      if (size > 1) {
        message = `Total ${size} questions available in ${quizList.categoryOf} category`;
      } else if (size < 1) {
        message = `No quiz found`;
        return res.status(400).json({
          status: true,
          message: message,
        });
      } else {
        message = `Total ${size} question available`;
      }
      return res.status(200).json({
        status: true,
        message: message,
        adminList: quizList,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (err) {
    return next(err);
  }
};

// const update = async (req, res, next) => {
//     role = req.user.role
//     let { quizId } = req.params
//     // let fileName
//     // if (req.file) {
//     //     fileName = req.file.filename;
//     // }
//     console.log(d)
//     try {
//         if (role === "admin") {
//             let question = await questionModel.findOne({ _id: id, 'questions._id': questionId }, { 'questions.$': 1 })

//         } else {
//             return res.status(404).json({
//                 success: false,
//                 message: 'you are not a authorized person',
//             });
//         }
//     } catch (error) {
//         return next(error)
//     }
// };

const update = async (req, res, next) => {
  role = req.user.role;
  let { quizId } = req.params;
  try {
    if (role === "admin") {
      const quizData = await questionModel.findByIdAndUpdate(quizId, req.body, {
        new: true,
      });
      if (quizData) {
        res.status(200).json({
          success: true,
          message: `Update quiz successfully.`,
          quizData: quizData,
        });
      } else {
        res.status(403).json({
          success: false,
          message: `quiz not found.`,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const checkAnswer = async (req, res, next) => {
  role = req.user.role;
  const { quizId } = req.params;
  let totalQuestions = 0;
  let attemptQuestions = 0;
  let rightAnswer = 0;
  let wrongAnswer = 0;
  let answerArray;
  let rawArray;
  let valueArray;

  try {
    if (role === "admin") {
      const quizData = await questionModel.findById(quizId);
      if (quizData) {
        //convert object into array
        rawArray = req.body;
        valueArray = Object.values(rawArray);
        valueArray.map((items) => {
          answerArray = items;
        });
        // find length of both array
        totalQuestions = quizData.questions.length;
        attemptQuestions = answerArray.length;

        //check each question and correct answer with answerArray
        for (let index = 0; index < totalQuestions; index++) {
          for (let index2 = 0; index2 < attemptQuestions; index2++) {
            if (
              quizData.questions[index]._id == answerArray[index2].questionId &&
              quizData.questions[index].correctAnswer ===
                answerArray[index2].selectedAnswer
            ) {
              rightAnswer++;
            }
          }
        }
        // calculate wrong answer
        wrongAnswer = attemptQuestions - rightAnswer;
        return res.status(200).json({
          success: true,
          message: `Total question ${totalQuestions}, attempt questions ${attemptQuestions}, right answer ${rightAnswer} and wrong answer ${wrongAnswer}`,
        });
      } else {
        return res.status(403).json({
          success: false,
          message: `quiz not found.`,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  role = req.user.role;
  let { quizId } = req.params;
  try {
    if (role === "admin") {
      const quizData = await questionModel.findByIdAndDelete(quizId);
      if (quizData) {
        res.status(200).json({
          success: true,
          message: `This quiz deleted successfully.`,
          quizData: quizData,
        });
      } else {
        res.status(403).json({
          success: false,
          message: `Quiz not found or deleted.`,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (error) {
    return next(error);
  }
};

export default { createQuiz, getAllQuiz, getSingleQuiz, checkAnswer, update, deleteQuiz};
