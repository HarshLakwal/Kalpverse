import mongoose, { Schema } from "mongoose";

const roleAndPermissionSchema = new mongoose.Schema(
  {
    roleName: { type: String, default: '' },
    permission: [
        {
            subComponent: { type: String },
            permissions:[
                {
                    name: String,
                    method:String,
                    route: String,
                    isPermission: Boolean
                }
            ]
        }
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("role", roleAndPermissionSchema);