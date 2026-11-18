import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Handle errors
const handleError = (res, error) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map(
      (e) => e.message
    );

    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Mobile number already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, mobileNo, password, pincode } = req.body;

    if (!name || !mobileNo || !password || !pincode) {
      return res.status(400).json({
        success: false,
        message: "name, mobileNo, password, and pincode are all required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobileNo });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      mobileNo,
      password: hashedPassword,
      pincode,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        mobileNo: user.mobileNo,
        pincode: user.pincode,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { mobileNo, password } = req.body;

    if (!mobileNo || !password) {
      return res.status(400).json({
        success: false,
        message: "mobileNo and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ mobileNo });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        mobileNo: user.mobileNo,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        mobileNo: user.mobileNo,
      },
      token: token,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export { registerUser, loginUser };