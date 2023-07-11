import joi from "joi";
import bcrypt from "bcrypt";
import schoolModel from "../Model/schoolModelSchema.js";
import JWTService from "../services/JWTService.js";
import fs from "fs";
import fork from "fork";
import { Schema } from "mongoose";

let token;
let schoolDetail;
let role;
let schoolData;

const validateUser = (user, requestType) => {
  const schoolRegisterSchema = joi.object({
    schoolName: joi.string().required(),
    schoolEmail: joi
      .string()
      .email()
      .alter({
        post: (schoolRegisterSchema) => schoolRegisterSchema.required(),
        patch: (schoolRegisterSchema) => schoolRegisterSchema.forbidden(),
      }),
    schoolPassword: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
      .alter({
        post: (schoolRegisterSchema) => schoolRegisterSchema.required(),
        patch: (schoolRegisterSchema) => schoolRegisterSchema.forbidden(),
      }),
    confirmPassword: joi.ref("schoolPassword"),
    schoolAddress: joi.string().required(),
    schoolCity: joi.string().required(),
    schoolState: joi.string().required(),
    schoolPhone: joi
      .string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    role: joi.string().default("school"),
    profilePic: joi.string().default("default.jpg"),
  });
  return schoolRegisterSchema.tailor(requestType).validate(user);
};

const schoolRegister = async (req, res, next) => {
  // const schoolRegisterSchema = joi.object({
  //     schoolName: joi.string().required(),
  //     schoolEmail: joi.string().email().required(),
  //     schoolPassword: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}')).required(),
  //     confirmPassword: joi.ref('schoolPassword'),
  //     schoolAddress: joi.string().required(),
  //     schoolCity: joi.string().required(),
  //     schoolState: joi.string().required(),
  //     schoolPhone: joi.string().required(),
  //     role: joi.string().default('school'),
  //     profilePic: joi.string().default('default.jpg'),
  // })
  // const { error } = schoolRegisterSchema.validate(req.body)
  // if (error) {
  //     return next(error);
  // }

  const { error } = validateUser(req.body, "post");
  if (error) {
    return next(error);
  }
  let fileName;
  if (req.file) {
    fileName = req.file.filename;
  }
  try {
    role = req.user.role;
    if (role === "admin") {
      schoolData = new schoolModel(req.body);
      let emailExist = await schoolModel.findOne({
        schoolEmail: req.body.schoolEmail,
      });
      if (emailExist) {
       // fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: "School already exist",
        });
      } else {
        schoolData.schoolPassword = await bcrypt.hash(
          req.body.schoolPassword,
          10
        );
        (schoolData.profilePic = fileName
          ? `/uploads/${fileName}`
          : "default.jpg"),
          (schoolDetail = await schoolData.save());

        token = JWTService.sign({ _id: schoolData._id, role: schoolData.role });
        schoolDetail.schoolPassword = undefined;

        return res.status(201).json({
          success: true,
          message: "School registered successfully",
          result: schoolDetail,
          token: token,
        });
      }
    } else {
     // fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (err) {
   // fs.unlinkSync(req.file.path);
    return next(err);
  }
};

const schoolLogin = async (req, res, next) => {
  const schoolLoginSchema = joi.object({
    schoolEmail: joi.string().email().required(),
    schoolPassword: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
      .required(),
  });
  const { error } = schoolLoginSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  try {
    // role = req.user.role
    let { schoolEmail, schoolPassword } = req.body;
    // if (role === "school" || role === "admin") {
    schoolData = await schoolModel.findOne({ schoolEmail: schoolEmail });
    if (!schoolData) {
      return res.status(404).json({
        success: false,
        message: "School does not exist",
      });
    }
    console.log("pasward", schoolData.schoolPassword);
    const isPasswordMatch = await bcrypt.compare(
      schoolPassword,
      schoolData.schoolPassword
    );
    if (!isPasswordMatch) {
      return res.status(404).json({
        success: false,
        message: "Password not match",
      });
    }

    token = JWTService.sign({ _id: schoolData._id, role: schoolData.role });
    // schoolData = await schoolModel.findOne({ schoolEmail: req.body.schoolEmail })
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token: token,
      schoolData: schoolData,
    });
    // } else {
    //     return res.status(404).json({
    //         success: false,
    //         message: 'You are not a authorized person'
    //     })
    // }
  } catch (err) {
    return next(err);
  }
};

const allSchoolList = async (req, res, next) => {
  role = req.user.role;
  try {
    if (role === "admin") {
      const schoolList = await schoolModel.find();
      res.status(200).json({
        status: true,
        message: `Total ${schoolList.length} data available`,
        schoolList: schoolList,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (err) {
    return next(err);
  }
};

const schoolUpdate = async (req, res, next) => {
  role = req.user.role;
  let fileName;
  let currentProfile;
  if (req.file) {
    fileName = req.file.filename;
  }
  // const updateSchema = validateUser.schoolRegisterSchema.fork(Object.keys(req.body), (schema)=> schema.optional());
  //const {error , value } = updateSchema.validate(req.body)
  const { error } = validateUser(req.body, "patch");
  if (error) {
    fs.unlinkSync(req.file.path);
    return next(error);
  }
  try {
    if (role === "admin") {
      try {
        const data = await schoolModel.findById({ _id: req.params.id });
        currentProfile = data.profilePic;
      } catch (err) {
        return next(err);
      }
      const schoolData = await schoolModel.findByIdAndUpdate(req.params.id, {
        $set: {
          schoolName: req.body.schoolName,
          schoolAddress: req.body.schoolAddress,
          schoolCity: req.body.schoolCity,
          schoolState: req.body.schoolState,
          schoolPhone: req.body.schoolPhone,
          profilePic: fileName ? `/uploads/${fileName}` : currentProfile,
        },
      });
      if (schoolData) {
        res.status(200).json({
          success: true,
          message: `Update school successfully.`,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (error) {
    fs.unlinkSync(req.file.path);
    return next(error);
  }
};

const schoolDelete = async (req, res, next) => {
  role = req.user.role;
  try {
    if (role === "admin") {
      schoolData = await schoolModel.findByIdAndDelete(req.params.id);
      if (schoolData) {
        return res.status(202).json({
          success: true,
          message: `School delete successfully`,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `School not found.`,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (error) {
    return next(err);
  }
};

const getSingleSchool = async (req, res, next) => {
  // role = req.user.role
  const id = req.params.id;
  try {
    // if (role === "admin") {
    schoolData = await schoolModel.findOne({ _id: id });
    if (schoolData) {
      return res.status(200).json({
        status: true,
        message: `This is the school details`,
        schoolData: schoolData,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: `School not found.`,
      });
    }
    // }
    // else {
    //     return res.status(404).json({
    //         success: false,
    //         message: 'You are not a authorized person'
    //     })
    // }
  } catch (err) {
    return next(err);
  }
};

// const schoolUpdate = async (req, res, next) => {
//     role = req.user.role
//     let fileName
//     if (req.file) {
//         fileName = req.file.filename;
//     }
//     const { error } = validateUser(req.body, "patch")
//     if (error) {
//         fs.unlinkSync(req.file.path)
//             return next(error);
//         }
//     try {
//         if (role === "admin") {
//             schoolData = await schoolModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
//             if (schoolData) {
//                 res.status(200).json({
//                     success: true,
//                     message: `Update school successfully.`,
//                 });
//             }
//         } else {
//             return res.status(404).json({
//                 success: false,
//                 message: 'You are not a authorized person',
//             });
//         }
//     } catch (error) {
//         return next(error)
//     }
// };

export default {
  schoolRegister,
  schoolLogin,
  allSchoolList,
  schoolUpdate,
  schoolDelete,
  getSingleSchool,
};
