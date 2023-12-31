import joi from "joi";
import bcrypt from "bcrypt";
import adminModel from "../Model/adminModelSchema.js";
import JWTService from "../services/JWTService.js";
import fs from "fs";
import schoolModel from "../Model/schoolModelSchema.js";


const validateAdmin = (user) => {
  const adminRegisterSchema = joi.object({
    adminName: joi.string().required(),
    adminEmail: joi.string().email().required(),
    adminPassword: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}")).required(),
    confirmPassword: joi.ref("adminPassword"),
    role: joi.string().default("admin"),
    profilePic: joi.string().default("default.jpg"),
  });
  return adminRegisterSchema.validate(user);
};

const adminRegister = async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) {
    return res.status(422).json({
      success: false,
      message: error.message
    });
  }

  let fileName;
  console.log(req.file)
  if (req.file) {
    fileName = req.file.filename;
  }
  let token;
  let adminDetail;
  try {
    const adminData = new adminModel(req.body);
    let emailExist = await adminModel.findOne({
      adminEmail: req.body.adminEmail,
    });
    if (emailExist) {
       fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Admin already exist",
      });
    } else {
      adminData.adminPassword = await bcrypt.hash(req.body.adminPassword, 10);
      (adminData.profilePic = fileName ? fileName : null),
        (adminDetail = await adminData.save());

      token = JWTService.sign({ _id: adminData._id, role: adminData.role });
      adminDetail.adminPassword = undefined;
    }
  } catch (error) {
     fs.unlinkSync(req.file.path);
     return res.status(500).json({
      success: false,
      message: error.message
    });
  }
  res.json({
    success: true,
    status: 201,
    message: "Admin registered successfully",
    result: adminDetail,
    token: token,
  });
};

const adminLogin = async (req, res) => {
  const adminLoginSchema = joi.object({
    adminEmail: joi.string().email().required(),
    adminPassword: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
      .required(),
  });
  const { error } = adminLoginSchema.validate(req.body);
  if (error) {
    return res.status(422).json({
      success: false,
      message: error.message
    });
  }
  let adminData;
  let token;
  try {
    adminData = await adminModel.findOne({ adminEmail: req.body.adminEmail });
    if (!adminData) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.adminPassword,
      adminData.adminPassword
    );
    if (!isPasswordMatch) {
      return res
        .status(404)
        .json({ success: false, message: "Password not match" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
  token = JWTService.sign({ _id: adminData._id, role: adminData.role });
  adminData = await adminModel.findOne({ adminEmail: req.body.adminEmail });
  res.status(200).json({
    success: true,
    message: "Login Successful",
    token: token,
    adminData: adminData,
  });
};

const getAllAdminList = async (req, res) => {
  try {
    // const limitValue = req.query.limit || 2;
    // const skipValue = req.query.skip || 0;
    // const adminList = await adminModel.find().limit(limitValue).skip(skipValue);
    
    const adminList = await adminModel.find();
    res.status(200).json({
      success: true,
      message: `Data available`,
      adminList: adminList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getSingle = async (req, res) => {
  try {
    const adminData = await adminModel.findById(req.params.id);
    if (adminData) {
      return res.status(200).json({
        success: true,
        message: `Admin data successfully fetch`,
        adminData: adminData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const activeDeActiveUser = async (req, res) => {
  let { id } = req.params;
  let role = req.user.role;
  let schoolData;
  // const isActiveSchema = joi.object({
  //   isActive: joi.boolean().required(),
  // });
  // const { error } = isActiveSchema.validate(req.body);
  // if (error) {
  //   return res.status(422).json({
  //     success: false,
  //     message: error.message,
  //   });
  // }
  try {
    if (role === "admin") {
      const isActive = await schoolModel.findById(id)
      let status;
      isActive.isActive ? status = false : status = true
      await schoolModel.findOneAndUpdate({ _id: id }, {
          $set: {
              isActive: status
          },
          new: true
      });
      return res.status(200).json({ message: `User ${status ? "Active" : "Inactive"} successfull` })
      } 
      // else {
      //   schoolData.isActive = true;
      //   await schoolData.save();
      //   return res.status(200).json({
      //     success: true,
      //     message: `User Activate successful`,
      //     schoolData: schoolData,
      //   });
      // }
    }
   catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// function paginatedResults(model) {
//   // middleware function
//   return (req, res, next) => {
//     const page = parseInt(req.query.page) || 2;
//     const limit = parseInt(req.query.limit) || 0;
 
//     // calculating the starting and ending index
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
 
//     const results = {};
//     if (endIndex < model.length) {
//       results.next = {
//         page: page + 1,
//         limit: limit
//       };
//     }
 
//     if (startIndex > 0) {
//       results.previous = {
//         page: page - 1,
//         limit: limit
//       };
//     }
 
//     results.results = model.slice(startIndex, endIndex);
 
//     res.paginatedResults = results;
//     next();
//   };
// }


export default {
  adminRegister,
  adminLogin,
  getAllAdminList,
  getSingle,
  activeDeActiveUser,
};
