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


const createStudent = (req,res)=>{
    const studentData = pickFields(req.body);
    console.log(studentData)

//add condition and validation

// const studentExists = Student.findOne({ email: studentData.email });
//     if (studentExists) {
//         return res.status(409).json({ success: false, message: "Email already exists" });
//     }

    // if(studentData.age < 6 || studentData.age > 60){
    //     return res.status(400).json({ success: false, message: "Age must be between 6 and 60" });
    // }

    if(!studentData.name || !studentData.email || !studentData.course || !studentData.age){
        return res.status(400).json({ success: false, message: "Name, Email and Course are required fields" });
    }

    const student = new Student(studentData);
    res.status(201).json({ success: true, message: "Student created", data: student });
}



export { createStudent };