// const userSchema = require(`../models/userSchema`);
// const jwt = require("jsonwebtoken");

// const createUser = async (req, res) => {
//   const userData = new userSchema(req.body);
//   try {
//     if (userData) {
//       const token = jwt.sign({ userData }, process.env.SECRETKEY, {
//         expiresIn: "5d",
//       });
//       const filePath = `/uploads/${req.file.filename}`;
//       userData.userProfilePicture = filePath;
//       await userData.sava();
//       res.status(201).json({
//         success: true,
//         message: `User created successfully.`,
//         user: userData,
//         token: token,
//       });
//     } else {
//       res.status(401).json({
//         success: false,
//         message: `User not created.`,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Error occur ${error.message}`,
//     });
//   }
// };

// const readUser = async (req, res) => {
//   try {
//     const userData = await userSchema.find();
//     if (userData) {
//       res.status(200).json({
//         success: true,
//         message: `Users data list`,
//         userData: userData,
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: `User not found`,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `error occur ${error.message}`,
//     });
//   }
// };

// const updateUser = async (req, res) => {
//   try {
//     const userData = await userSchema.findByIdAndUpdate(
//       req.params.id,
//       req.body
//     );
//     if (userData) {
//       res.status(200).json({
//         success: true,
//         message: `Update user successfully.`,
//       });
//     } else {
//       res.status(403).json({
//         success: false,
//         message: `User not updated.`,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `error occur ${error.message}`,
//     });
//   }
// };

// const deleteUser = async (req, res) => {
//   try {
//     const userData = await userSchema.findByIdAndDelete(req.params.id);
//     if (userData) {
//       res.status(202).json({
//         success: true,
//         message: `user delete successfully`,
//       });
//     } else {
//       res.status(404).json({
//         success: false,
//         message: `user not deleted.`,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `error occur ${error.message}`,
//     });
//   }
// };

// const thirdApi = async (req, res) => {
//   const user = await axios.get("https://jsonplaceholder.typicode.com/users");
//   console.log(user.data);
//   if (user !== null) {
//     res.status(200).json({
//       message: "thirdPartyApi",
//     });
//   }
// };

// module.exports = {
//   createUser,
//   readUser,
//   updateUser,
//   deleteUser,
//   thirdApi,
// };

// const crypto = require("crypto");
// const { promisify } = require("util");
// const jwt = require("jsonwebtoken");
// const User = require("../model/admin.model");
// const catchAsync = require("../utills/catchAsync");
// const AppError = require("../utills/appError");
// const mongoose = require("mongoose");
// const Email = require('../utills/email');

// const signToken = id => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN
//   });
// };

// const createSendToken = (user, statusCode, req, res) => {
//   const token = signToken(user._id);

//   res.cookie('jwt', token, {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN  24  60  60  1000
//     ),
//     httpOnly: true,
//     secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
//   });

//   // Remove password from output
//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     expiresIn: 86400,
//     data: user,
//   });
// };

// exports.signup = catchAsync(async (req, res, next) => {
//   const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//     role: req.body.role,
//     department: req.body.department,
//     designation: req.body.designation,
//     phone: req.body.phone,
//     address: req.body.address,
//     dob: req.body.dob,
//     gender: req.body.gender,
//     joinDate: req.body.joinDate,
//     addedBy: req.body.addedBy,
//     graduation: req.body.graduation,
//     shifts: req.body.shifts
//   });

//   new Email(newUser, req.body.password).sendEmail();

//   createSendToken(newUser, 201, req, res);
// });

// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   // 1) Check if email and password exist
//   if (!email || !password) {
//     return next(new AppError('Please provide email and password!', 400));
//   }
//   // 2) Check if user exists && password is correct
//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   // 3) If everything ok, send token to client
//   createSendToken(user, 200, req, res);
// });

// exports.logout = (req, res) => {
//   // res.cookie('jwt', 'loggedout', {
//   //   expires: new Date(Date.now() + 10 * 1000),
//   //   httpOnly: true
//   // });
//   // res.status(200).json({ status: 'success' });
// };

// exports.protect = catchAsync(async (req, res, next) => {
//   // 1) Getting token and check of it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return next(
//       new AppError('You are not logged in! Please log in to get access.', 401)
//     );
//   }

//   // 2) Verification token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   // 3) Check if user still exists
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError(
//         'The user belonging to this token does no longer exist.',
//         401
//       )
//     );
//   }
//   // 4) Check if user changed password after the token was issued
//   if (currentUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('User recently changed password! Please log in again.', 401)
//     );
//   }

//   // GRANT ACCESS TO PROTECTED ROUTE
//   req.user = currentUser;
//   res.locals.user = currentUser;
//   next();
// });

// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // roles ['admin', 'lead-guide']. role='user'
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action', 403)
//       );
//     }

//     next();
//   };
// };

// const express = require('express');
// const adminController = require('../../controller/adminController');
// const authController = require('../../controller/AuthController');

// const router = express.Router();

// router.post('/signup',
// authController.signup);

// router.post('/login', authController.login);
// router.get('/logout', authController.logout);

// // Protect all routes after this middleware
// router.use(authController.protect);

// router.patch('/updateMyPassword', authController.updatePassword);
// router.get('/me', adminController.getMe, adminController.getUser);
// router.patch(
//   '/updateMe',
//   adminController.uploadUserPhoto,
//   adminController.resizeUserPhoto,
//   adminController.updateMe
// );
// router.delete('/deleteMe', adminController.deleteMe);

// //------------------------------ Management Router --------------------------//

// router
//   .route('/getAll-managements/details')
//   .get( authController.restrictTo('Admin'), adminController.getAllManagement);

// router
//   .route('/:id')
//   .get( authController.restrictTo('Admin'), adminController.getUser)
//   .patch( authController.restrictTo('Admin') ,adminController.updateUser)
//   .put( authController.restrictTo('Admin'), adminController.deleteUser);

// //---------------------------------------- END -----------------------------------//

// //------------------------------ Employees Router --------------------------//

// router.post('/add-employee',
//   authController.restrictTo('Admin',"HR"),
//   authController.signup);

// router
//   .route('/getAll-employees/details')
//   .get( authController.restrictTo('Admin', "HR"), adminController.getAllEmployee);

//   router
//   .route('/employee/:id')
//   .get( authController.restrictTo('Admin', "HR"), adminController.getUser)
//   .patch( authController.restrictTo('Admin', "HR") ,adminController.updateUser)
//   .put( authController.restrictTo('Admin', "HR"), adminController.deleteUser);

// //---------------------------------------- END -----------------------------------//

// module.exports = router;
