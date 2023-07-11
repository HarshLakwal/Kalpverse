import joi from "joi";
import bcrypt from "bcrypt";
import adminModel from "../Model/adminModelSchema.js";
import JWTService from "../services/JWTService.js";
import fs from "fs";
import schoolModel from "../Model/schoolModelSchema.js";

const adminRegister = async (req, res, next) => {
  const adminRegisterSchema = joi.object({
    adminName: joi.string().required(),
    adminEmail: joi.string().email().required(),
    adminPassword: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
      .required(),
    confirmPassword: joi.ref("adminPassword"),
    role: joi.string().default("admin"),
    profilePic: joi.string().default("default.jpg"),
  });
  const { error } = adminRegisterSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  let fileName;
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
      // fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "admin already exist",
      });
    } else {
      adminData.adminPassword = await bcrypt.hash(req.body.adminPassword, 10);
      (adminData.profilePic = fileName
        ? `/uploads/${fileName}`
        : "default.jpg"),
        (adminDetail = await adminData.save());

      token = JWTService.sign({ _id: adminData._id, role: adminData.role });
      adminDetail.adminPassword = undefined;
    }
  } catch (err) {
    // fs.unlinkSync(req.file.path);
    return next(err);
  }
  res.json({
    success: true,
    status: 201,
    message: "admin registered successfully",
    result: adminDetail,
    token: token,
  });
};

const adminLogin = async (req, res, next) => {
  const adminLoginSchema = joi.object({
    adminEmail: joi.string().email().required(),
    adminPassword: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
      .required(),
  });
  const { error } = adminLoginSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  let adminData;
  let token;
  try {
    adminData = await adminModel.findOne({ adminEmail: req.body.adminEmail });
    if (!adminData) {
      return res
        .status(404)
        .json({ success: false, message: "user does not exist" });
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.adminPassword,
      adminData.adminPassword
    );
    if (!isPasswordMatch) {
      return res
        .status(404)
        .json({ success: false, message: "password not match" });
    }
  } catch (err) {
    return next(err);
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

const getAllAdminList = async (req, res, next) => {
  try {
    const adminList = await adminModel.find();
    res.status(200).json({
      status: true,
      message: `total ${adminList.length} data available`,
      adminList: adminList,
    });
  } catch (err) {
    return next(err);
  }
};

const getSingle = async (req, res, next) => {
  try {
    const adminData = await adminModel.findById(req.params.id);
    if (adminData) {
      return res.status(200).json({
        status: true,
        message: `Admin data successfully fetch`,
        adminData: adminData,
      });
    }
  } catch (err) {
    return next(err);
  }
};

const activeDeActiveUser = async (req, res, next) => {
  let { id } = req.params;
  let role = req.user.role;
  let schoolData;
  const isActiveSchema = joi.object({
    isActive: joi.boolean().required(),
  });
  const { error } = isActiveSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  try {
    if (role === "admin") {
      schoolData = await schoolModel.findById(id);
      if (req.body.isActive === false) {
        schoolData.isActive = false;
        await schoolData.save();
        return res.status(200).json({
          success: true,
          message: `User deactivate successful`,
          schoolData: schoolData,
        });
      } else {
        schoolData.isActive = true;
        await schoolData.save();
        return res.status(200).json({
          success: true,
          message: `User Activate successful`,
          schoolData: schoolData,
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};

export default {
  adminRegister,
  adminLogin,
  getAllAdminList,
  getSingle,
  activeDeActiveUser,
};
