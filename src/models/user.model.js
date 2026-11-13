import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{type: String, required: true},
    mobileNo:{type: String, required: true},
    password:{type: String, required: true},
    pincode:{type: String, required: true}
})

const User = mongoose.model("User",userSchema)
export default User;