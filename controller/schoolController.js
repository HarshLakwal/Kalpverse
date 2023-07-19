import joi from "joi";
import bcrypt from "bcrypt";
import schoolModel from "../Model/schoolModelSchema.js";
import JWTService from "../services/JWTService.js";
import fs from "fs";
import fork from "fork";
import { Schema, set } from "mongoose";

let token;
let schoolDetail;
let role;
let schoolData;

// const validateUser = (user, requestType) => {
//   const schoolRegisterSchema = joi.object({
//     schoolName: joi.string().required(),
//     schoolEmail: joi
//       .string()
//       .email()
//       .alter({
//         post: (schoolRegisterSchema) => schoolRegisterSchema.required(),
//         patch: (schoolRegisterSchema) => schoolRegisterSchema.forbidden(),
//       }),
//     schoolPassword: joi
//       .string()
//       .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
//       .alter({
//         post: (schoolRegisterSchema) => schoolRegisterSchema.required(),
//         patch: (schoolRegisterSchema) => schoolRegisterSchema.forbidden(),
//       }),
//     confirmPassword: joi.ref("schoolPassword"),
//     schoolAddress: joi.string().required(),
//     schoolCity: joi.string().required(),
//     schoolState: joi.string().required(),
//     schoolPhone: joi
//       .string()
//       .length(10)
//       .pattern(/^[0-9]+$/)
//       .required(),
//     role: joi.string().default("school"),
//     profilePic: joi.string().default("default.jpg"),
//   });
//   return schoolRegisterSchema.tailor(requestType).validate(user);
// };

const validateSchoolUpdate = (user) => {
  const schoolRegisterSchema = joi.object({
    schoolName: joi.string().required(),
    schoolEmail: joi.string().email().required(),
    schoolState: joi.string().required(),
    schoolAddress: joi.string().required(),
    schoolPhone: joi.string().length(10).pattern(/^[0-9]+$/).required(),
    loginDevices: joi.object().keys({
      devices:joi.array().items({
        deviceId: joi.string().required(),
      }),
    }),
  });

  return schoolRegisterSchema.validate(user);
};

const validateUser = (user) => {
  const schoolRegisterSchema = joi.object({
    schoolName: joi.string().required(),
    schoolEmail: joi.string().email().required(),
    schoolState: joi.string().required(),
    schoolAddress: joi.string().required(),
    schoolPhone: joi.string().length(10).pattern(/^[0-9]+$/).required(),
    loginDevices: joi.object().keys({
      email:joi.string().email().required(),
      password:joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}")).required(),
      confirmPassword: joi.ref("password"),
      devices:joi.array().items({
        deviceId: joi.string().required(),
      }),
    }),
    role: joi.string().default("school"),
    logo: joi.string().default("default.jpg"),
  });

  return schoolRegisterSchema.validate(user);
};

// const schoolRegister = async (req, res) => {
//   // const schoolRegisterSchema = joi.object({
//   //     schoolName: joi.string().required(),
//   //     schoolEmail: joi.string().email().required(),
//   //     schoolPassword: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}')).required(),
//   //     confirmPassword: joi.ref('schoolPassword'),
//   //     schoolAddress: joi.string().required(),
//   //     schoolCity: joi.string().required(),
//   //     schoolState: joi.string().required(),
//   //     schoolPhone: joi.string().required(),
//   //     role: joi.string().default('school'),
//   //     profilePic: joi.string().default('default.jpg'),
//   // })
//   // const { error } = schoolRegisterSchema.validate(req.body)
//   // if (error) {
//   //     return next(error);
//   // }

//   const { error } = validateUser(req.body, "post");
//   if (error) {
//     return res.status(422).json({
//       success: false,
//       message: error.message
//     });
//   }
//   let fileName;
//   if (req.file) {
//     fileName = req.file.filename;
//   }
//   try {
//     role = req.user.role;
//     if (role === "admin") {
//       schoolData = new schoolModel(req.body);
//       let emailExist = await schoolModel.findOne({
//         schoolEmail: req.body.schoolEmail,
//       });
//       if (emailExist) {
//        // fs.unlinkSync(req.file.path);
//         return res.status(404).json({
//           success: false,
//           message: "School already exist",
//         });
//       } else {
//         schoolData.schoolPassword = await bcrypt.hash(
//           req.body.schoolPassword,
//           10
//         );
//         (schoolData.profilePic = fileName ? fileName : "default.jpg" ),
//           (schoolDetail = await schoolData.save());

//         token = JWTService.sign({ _id: schoolData._id, role: schoolData.role });
//         schoolDetail.schoolPassword = undefined;

//         return res.status(201).json({
//           success: true,
//           message: "School registered successfully",
//           result: schoolDetail,
//           token: token,
//         });
//       }
//     } else {
//      // fs.unlinkSync(req.file.path);
//       return res.status(401).json({
//         success: false,
//         message: "You are not a authorized person",
//       });
//     }
//   } catch (error) {
//    // fs.unlinkSync(req.file.path);
//    return res.status(500).json({
//     success: false,
//     message: error.message
//   });
//   }
// };

const schoolRegister = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(422).json({
      success: false,
      message: error.message
    });
  }

  let password =req.body.loginDevices.password
  let email =req.body.loginDevices.email
  let role = req.user.role;
  let fileName;
  if (req.file) {
    fileName = req.file.filename;
  }

  try {
    if (role === "admin") {
      schoolData = new schoolModel(req.body);
      console.log("role",role)
      console.log("schoolData",req.body)
      
      let emailExist = await schoolModel.findOne({ "loginDevices.email": email });
     
      if (emailExist) {
       // fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: "School already exist",
        });
      } else {
      
        schoolData.loginDevices.password = await bcrypt.hash(
         password,10);
        (schoolData.logo = fileName ? fileName : "default.jpg" ),
          (schoolDetail = await schoolData.save());

        token = JWTService.sign({ _id: schoolData._id, role: schoolData.role });
        schoolDetail.loginDevices.password = undefined;

        return res.status(201).json({
          success: true,
          message: "School registered successfully",
          result: schoolDetail,
          token: token,
        });
      }
    } else {
     // fs.unlinkSync(req.file.path);
      return res.status(401).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (error) {
   // fs.unlinkSync(req.file.path);
   return res.status(500).json({
    success: false,
    message: error.message
  });
  }
};

// const schoolLogin = async (req, res) => {
//   const schoolLoginSchema = joi.object({
//     schoolEmail: joi.string().email().required(),
//     schoolPassword: joi
//       .string()
//       .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
//       .required(),
//   });
//   const { error } = schoolLoginSchema.validate(req.body);
//   if (error) {
//     return res.status(422).json({
//       success: false,
//       message: error.message
//     });
//   }
//   try {
//     // role = req.user.role
//     let { schoolEmail, schoolPassword } = req.body;
//     // if (role === "school" || role === "admin") {
//     schoolData = await schoolModel.findOne({ schoolEmail: schoolEmail });
//     if (!schoolData) {
//       return res.status(404).json({
//         success: false,
//         message: "School does not exist",
//       });
//     }
//     console.log("pasward", schoolData.schoolPassword);
//     const isPasswordMatch = await bcrypt.compare(
//       schoolPassword,
//       schoolData.schoolPassword
//     );
//     if (!isPasswordMatch) {
//       return res.status(404).json({
//         success: false,
//         message: "Password not match",
//       });
//     }

//     token = JWTService.sign({ _id: schoolData._id, role: schoolData.role });
//     // schoolData = await schoolModel.findOne({ schoolEmail: req.body.schoolEmail })
//     return res.status(200).json({
//       success: true,
//       message: "Login Successful",
//       token: token,
//       schoolData: schoolData,
//     });
//     // } else {
//     //     return res.status(404).json({
//     //         success: false,
//     //         message: 'You are not a authorized person'
//     //     })
//     // }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


const schoolLogin = async (req, res) => {
  const schoolLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
      .required(),
  });
  const { error } = schoolLoginSchema.validate(req.body);
  if (error) {
    return res.status(422).json({
      success: false,
      message: error.message
    });
  }
  try {
    // role = req.user.role
    let { email, password } = req.body;
    // if (role === "school" || role === "admin") {
    schoolData = await schoolModel.findOne({ "loginDevices.email": email });
    if (!schoolData) {
      return res.status(404).json({
        success: false,
        message: "School does not exist",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      schoolData.loginDevices.password
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const allSchoolList = async (req, res) => {
  role = req.user.role;
  try {
    if (role === "admin") {
      const schoolList = await schoolModel.find();
      res.status(200).json({
        success: true,
        message: `Success`,
        schoolList: schoolList,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// const schoolUpdate = async (req, res) => {
//   role = req.user.role;
//   let fileName;
//   let currentProfile;
//   if (req.file) {
//     fileName = req.file.filename;
//   }
//   // const updateSchema = validateUser.schoolRegisterSchema.fork(Object.keys(req.body), (schema)=> schema.optional());
//   //const {error , value } = updateSchema.validate(req.body)
//   const { error } = validateUser(req.body);
//   if (error) {
//     fs.unlinkSync(req.file.path);
//     return res.status(422).json({
//       success: false,
//       message: error.message
//     });
//   }
//   try {
//     if (role === "admin") {
//       try {
//         const data = await schoolModel.findById({ _id: req.params.id });
//         currentProfile = data.profilePic;
//       } catch (error) {
//         return res.status(500).json({
//           success: false,
//           message: error.message
//         });
//       }
//       const schoolData = await schoolModel.findByIdAndUpdate(req.params.id, {
//         $set: {
//           schoolName: req.body.schoolName,
//           schoolAddress: req.body.schoolAddress,
//           schoolCity: req.body.schoolCity,
//           schoolState: req.body.schoolState,
//           schoolPhone: req.body.schoolPhone,
//           profilePic: fileName ? fileName : currentProfile,
//         },
//       });
//       if (schoolData) {
//         res.status(200).json({
//           success: true,
//           message: `Update school successfully.`,
//         });
//       }
//     } else {
//       return res.status(401).json({
//         success: false,
//         message: "You are not a authorized person",
//       });
//     }
//   } catch (error) {
//     fs.unlinkSync(req.file.path);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

const schoolUpdate = async (req, res) => {
  role = req.user.role;
  let fileName;
  let currentProfile;
  if (req.file) {
    fileName = req.file.filename;
  }
  // const updateSchema = validateUser.schoolRegisterSchema.fork(Object.keys(req.body), (schema)=> schema.optional());
  //const {error , value } = updateSchema.validate(req.body)

  const { error } = validateSchoolUpdate(req.body);
  if (error) {
    fs.unlinkSync(req.file.path);
    return res.status(422).json({
      success: false,
      message: error.message
    });
  }
  try {
    if (role === "admin") {
      try {
        const data = await schoolModel.findById({ _id: req.params.id });
        currentProfile = data.logo;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      const schoolData = await schoolModel.findByIdAndUpdate( req.params.id ,req.body);
      if (schoolData) {
        res.status(200).json({
          success: true,
          message: `Update school successfully.`,
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (error) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const schoolDelete = async (req, res) => {
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
      return res.status(401).json({
        success: false,
        message: "You are not a authorized person",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getSingleSchool = async (req, res) => {
  // role = req.user.role
  const id = req.params.id;
  try {
    // if (role === "admin") {
    schoolData = await schoolModel.findOne({ _id: id });
    if (schoolData) {
      return res.status(200).json({
        success: true,
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
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
