import jwt from "jsonwebtoken";
import JWTService from "../services/JWTService.js";

const authorization = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(404).json({
      success: false,
      message: "Token is not found",
    });
  }

  try {
    let token = authHeader.split(" ")[1];
    const { _id, role } = await JWTService.verify(token);
    const user = {
      _id,
      role,
    };
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: `Error occur ${err.message}`,
    });
  }
};

export default authorization;

// const authorization = async (req, res, next) => {
//   const authHeader =  req.headers.authorization;
//   if (authHeader) {
//     let token = authHeader.split(" ")[1];
//     jwt.verify(token,process.env.JWT_SECRET, (err, decode) => {
//       if (err) {
//         res.status(401).json({
//           success: false,
//           message: `Error occur ${err.message}`,
//         });
//       } else {
//         const {_id , role }= JWTService.verify(token);
//         const user={
//             _id,
//             role
//         }
//         console.log(req.user, "users token")
//         req.user = user;
//         next();
//       }

//     });
//   } else {
//     res.status(404).json({
//       success: false,
//       message: "Token is not found",
//     });
//   }
// };

// export default authorization;
