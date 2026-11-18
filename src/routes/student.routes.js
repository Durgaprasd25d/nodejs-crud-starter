import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentByID,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";
import authenticateUser from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * AUTHENTICATION MIDDLEWARE
 * Strictly scoped to /students endpoints.
 * Requires: Authorization: Bearer <token>
 */
router.use("/students", authenticateUser);

// Complete Student CRUD
router.post("/students", createStudent);
router.get("/students", getAllStudents);
router.get("/students/:id", getStudentByID);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

export default router;