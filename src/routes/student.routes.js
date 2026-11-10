import express from "express";
import {createStudent,getAllStudents,getStudentByID, updateStudent,deleteStudent} from "../controllers/student.controller.js";


const router= express.Router();

router.post("/students",createStudent);
router.get("/students/:id",getStudentByID);
router.get("/students",getAllStudents);
router.put("/students/:id",updateStudent);
router.delete("/students/:id",deleteStudent);

export default router;