import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobileNo: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    pincode: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;