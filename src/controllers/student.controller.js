import mongoose from "mongoose";
import Student from "../models/student.model.js";

const handleError = (res, error) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: messages.join(", ") });
  }
  if (error.code === 11000) {
    return res
      .status(409)
      .json({ success: false, message: "Email already exists" });
  }
  return res.status(500).json({ success: false, message: error.message });
};

const pickFields = (body = {}) => {
  const allowed = ["name", "email", "age", "course", "phone"];
  const data = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  });
  return data;
};


const createStudent = async (req, res) => {
  try {
    const studentData = pickFields(req.body);

    if (!studentData.name || !studentData.email || !studentData.course || !studentData.age) {
      return res.status(400).json({
        success: false,
        message: "Name, email, age, and course are required fields",
      });
    }

    const student = await Student.create(studentData);
    return res.status(201).json({ success: true, message: "Student created", data: student });
  } catch (error) {
    return handleError(res, error);
  }
};


const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        handleError(res, error);
    }
}

const getStudentByID =  async (req,res)=>{
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    handleError(res, error);
  }
}

const updateStudent = async (req, res) => {
  try {
    const studentData = pickFields(req.body);
    const student = await Student.findByIdAndUpdate(req.params.id, studentData, { new: true });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteStudent = async(req,res)=>{
  try{
    const student = await Student.findByIdAndDelete(req.params.id);
    if(!student){
      return res.status(404).json({success:false,message:"Student not found"});
    }
    res.status(200).json({success:true,message:"Student deleted successfully"});    
  }catch(error){
    handleError(res,error);
  }
}

export { createStudent, getAllStudents, getStudentByID, updateStudent, deleteStudent };