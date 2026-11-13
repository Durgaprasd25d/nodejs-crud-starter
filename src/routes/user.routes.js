import express from "express";

import {
  registerUser,
  loginUser,
} from "../controllers/user.controller.js";

import authenticateUser from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/profile", authenticateUser, (req, res) => {

  res.status(200).json({
    success: true,
    message: "Welcome to your profile",

    user: req.user,
  });

});

export default router;