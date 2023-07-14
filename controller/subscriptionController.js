import joi from "joi";
import subscriptionPlanSchema from "../Model/subscriptionPlanSchema.js";
import JWTService from "../services/JWTService.js";

let token;
let role;

const subscriptionAdd = async (req, res) => {
  const subscriptionSchema = joi.object({
    subscriptionTitle: joi.string().required(),
    subscriptionPrice: joi.string().required(),
    subscriptionValidity: joi.string().required(),
  });
  const { error } = subscriptionSchema.validate(req.body);
  if (error) {
    return res.status(422).json({
      success: false,
      message: error.message,
    });
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
      return res.status(401).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const allPlanList = async (req, res) => {
  try {
      const subscriptionPlanList = await subscriptionPlanSchema.find();
      res.status(200).json({
        success: true,
        message: `success`,
        subscriptionPlanList: subscriptionPlanList,
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const planUpdate = async (req, res) => {
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
      return res.status(401).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const planDelete = async (req, res) => {
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
      return res.status(401).json({
        success: false,
        message: "you are not a authorized person",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPlanDetail = async (req, res) => {
  const id = req.params.id;
  try {
      const subscriptionPlanData = await subscriptionPlanSchema.findOne({
        _id: id,
      });
      res.status(200).json({
        success: true,
        message: `${subscriptionPlanData.subscriptionTitle} detail`,
        detail: subscriptionPlanData,
      });
    }
   catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export default {
  subscriptionAdd,
  allPlanList,
  planUpdate,
  planDelete,
  getPlanDetail,
};
