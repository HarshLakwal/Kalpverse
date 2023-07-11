import joi from "joi";
import subscriptionPlanSchema from "../Model/subscriptionPlanSchema.js";
import JWTService from "../services/JWTService.js";

let token;
let role;

const subscriptionAdd = async (req, res, next) => {
  const subscriptionSchema = joi.object({
    subscriptionTitle: joi.string().required(),
    subscriptionPrice: joi.string().required(),
    subscriptionValidity: joi.string().required(),
  });
  const { error } = subscriptionSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  try {
    role = req.user.role;
    if (role === "admin") {
      const subscriptionData = new subscriptionPlanSchema(req.body);
      let isExist = await subscriptionPlanSchema.findOne({
        subscriptionTitle: req.body.subscriptionTitle,
      });
      if (isExist) {
        return res.status(404).json({
          success: false,
          message: "subscription already exist",
        });
      } else {
        await subscriptionData.save();
        token = JWTService.sign({
          _id: subscriptionData._id,
          subscriptionTitle: subscriptionData.subscriptionTitle,
        });
        return res.status(201).json({
          success: true,
          message: "plan added successfully",
          result: subscriptionData,
          token: token,
        });
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

const allPlanList = async (req, res, next) => {
  try {
      const subscriptionPlanList = await subscriptionPlanSchema.find();
      res.status(200).json({
        status: true,
        message: `total ${subscriptionPlanList.length} data available`,
        userList: subscriptionPlanList,
      });

  } catch (err) {
    return next(err);
  }
};

const planUpdate = async (req, res, next) => {
  role = req.user.role;
  const { id } = req.params;

  try {
    if (role === "admin") {
      // let isExist = await subscriptionPlanSchema.findById(id)
      // console.log(isExist)
      //     console.log(req.body.params)
      //     console.log(isExist)
      //     if (isExist) {
      //         return res.status(404).json({
      //             success: false,
      //             message: 'subscription already exist'
      //         })
      //     }
      //     const {subscriptionTitle,subscriptionPrice,subscriptionLimit,subscriptionExpireAt} = isExist
      //     const expireAt = new Date();
      //     console.log(expireAt)
      //     expireAt.setMonth(expireAt.getMonth()+subscriptionLimit)
      //     subscriptionExpireAt=expireAt;

      const subscriptionPlanData =
        await subscriptionPlanSchema.findByIdAndUpdate(id, {
          $set: {
            subscriptionTitle: req.body.subscriptionTitle,
            subscriptionPrice: req.body.subscriptionPrice,
            subscriptionLimit: req.body.subscriptionLimit,
            // "subscriptionExpireAt":subscriptionExpireAt
          },
        });
      if (subscriptionPlanData) {
        res.status(200).json({
          success: true,
          message: `Update plan successfully.`,
          detail: subscriptionPlanData,
        });
      } else {
        res.status(403).json({
          success: false,
          message: `please enter a valid plan.`,
        });
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

const planDelete = async (req, res, next) => {
  role = req.user.role;
  try {
    if (role === "admin") {
      const subscriptionPlanData =
        await subscriptionPlanSchema.findByIdAndDelete(req.params.id);
      if (subscriptionPlanData) {
        return res.status(202).json({
          success: true,
          message: `Plan delete successfully`,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `Plan not found or deleted.`,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (error) {
    return next(err);
  }
};

const getPlanDetail = async (req, res, next) => {
  const id = req.params.id;
  try {
      const subscriptionPlanData = await subscriptionPlanSchema.findOne({
        _id: id,
      });
      res.status(200).json({
        status: true,
        message: `${subscriptionPlanData.subscriptionTitle} detail`,
        detail: subscriptionPlanData,
      });
    }
   catch (err) {
    return next(err);
  }
};


export default {
  subscriptionAdd,
  allPlanList,
  planUpdate,
  planDelete,
  getPlanDetail,
};
