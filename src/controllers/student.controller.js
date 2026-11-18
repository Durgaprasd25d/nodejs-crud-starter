import mongoose from "mongoose";
import Student from "../models/student.model.js";

const handleError = (res, error) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A student with this email already exists",
    });
  }
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${error.value}`,
    });
  }
  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

const pickAllowedFields = (body = {}) => {
  const allowed = ["name", "email", "age", "marks", "city", "course", "phone"];
  const cleanData = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) {
      cleanData[key] = body[key];
    }
  });
  return cleanData;
};

/**
 * CREATE a new student (Protected by JWT Auth)
 */
const createStudent = async (req, res) => {
  try {
    const studentData = pickAllowedFields(req.body);

    if (req.user && req.user.id) {
      studentData.createdBy = req.user.id;
    }

    const student = await Student.create(studentData);

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * GET ALL STUDENTS with dynamic MongoDB Query Operators from req.query
 *
 * Supported query operators:
 * - Comparison:
 *     ?city=Bhubaneswar             ($eq)
 *     ?city_ne=Bhubaneswar          ($ne)
 *     ?course=MERN                  ($eq)
 *     ?course_ne=Java               ($ne)
 *     ?minMarks=70 & ?maxMarks=90   ($gte, $lte)
 *     ?marks_gt=80 & ?marks_lt=60   ($gt, $lt)
 *     ?minAge=18 & ?maxAge=25       ($gte, $lte)
 *     ?age_gt=20 & ?age_lt=30       ($gt, $lt)
 * - Array:
 *     ?cities=Bhubaneswar,Cuttack   ($in)
 *     ?excludeCities=Puri,Delhi     ($nin)
 *     ?courses=MERN,Java            ($in)
 *     ?excludeCourses=Python        ($nin)
 * - Logical:
 *     ?search=keyword               ($or across name, city, course)
 *     ?orCity=... & ?orMinMarks=... ($or condition)
 * - Pagination & Sort:
 *     ?sortBy=marks & ?order=desc
 *     ?page=1 & ?limit=10
 */
const getAllStudents = async (req, res) => {
  try {
    const filter = {};

    // 1. Comparison ($eq, $ne) for string fields
    if (req.query.city) {
      filter.city = { ...(filter.city || {}), $eq: req.query.city.trim() };
    }
    if (req.query.city_ne) {
      filter.city = { ...(filter.city || {}), $ne: req.query.city_ne.trim() };
    }
    if (req.query.course) {
      filter.course = { ...(filter.course || {}), $eq: req.query.course.trim() };
    }
    if (req.query.course_ne) {
      filter.course = { ...(filter.course || {}), $ne: req.query.course_ne.trim() };
    }

    // 2. Comparison ($gt, $gte, $lt, $lte, $eq, $ne) for numeric marks
    if (
      req.query.marks !== undefined ||
      req.query.marks_ne !== undefined ||
      req.query.minMarks !== undefined ||
      req.query.maxMarks !== undefined ||
      req.query.marks_gt !== undefined ||
      req.query.marks_lt !== undefined
    ) {
      filter.marks = {};
      if (req.query.marks !== undefined) filter.marks.$eq = Number(req.query.marks);
      if (req.query.marks_ne !== undefined) filter.marks.$ne = Number(req.query.marks_ne);
      if (req.query.minMarks !== undefined) filter.marks.$gte = Number(req.query.minMarks);
      if (req.query.maxMarks !== undefined) filter.marks.$lte = Number(req.query.maxMarks);
      if (req.query.marks_gt !== undefined) filter.marks.$gt = Number(req.query.marks_gt);
      if (req.query.marks_lt !== undefined) filter.marks.$lt = Number(req.query.marks_lt);
    }

    // 3. Comparison ($gt, $gte, $lt, $lte, $eq, $ne) for numeric age
    if (
      req.query.age !== undefined ||
      req.query.age_ne !== undefined ||
      req.query.minAge !== undefined ||
      req.query.maxAge !== undefined ||
      req.query.age_gt !== undefined ||
      req.query.age_lt !== undefined
    ) {
      filter.age = {};
      if (req.query.age !== undefined) filter.age.$eq = Number(req.query.age);
      if (req.query.age_ne !== undefined) filter.age.$ne = Number(req.query.age_ne);
      if (req.query.minAge !== undefined) filter.age.$gte = Number(req.query.minAge);
      if (req.query.maxAge !== undefined) filter.age.$lte = Number(req.query.maxAge);
      if (req.query.age_gt !== undefined) filter.age.$gt = Number(req.query.age_gt);
      if (req.query.age_lt !== undefined) filter.age.$lt = Number(req.query.age_lt);
    }

    // 4. Array Comparison ($in, $nin)
    if (req.query.cities) {
      const cityList = req.query.cities.split(",").map((c) => c.trim()).filter(Boolean);
      filter.city = { ...(filter.city || {}), $in: cityList };
    }
    if (req.query.excludeCities) {
      const excludedCities = req.query.excludeCities.split(",").map((c) => c.trim()).filter(Boolean);
      filter.city = { ...(filter.city || {}), $nin: excludedCities };
    }
    if (req.query.courses) {
      const courseList = req.query.courses.split(",").map((c) => c.trim()).filter(Boolean);
      filter.course = { ...(filter.course || {}), $in: courseList };
    }
    if (req.query.excludeCourses) {
      const excludedCourses = req.query.excludeCourses.split(",").map((c) => c.trim()).filter(Boolean);
      filter.course = { ...(filter.course || {}), $nin: excludedCourses };
    }

    // 5. Logical Operators ($or, $and)
    // Keyword search using $or across text fields:
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [
        { name: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
        { course: { $regex: searchRegex } },
      ];
    }

    // Custom $or condition passed via query parameters:
    if (req.query.orCity && req.query.orMinMarks) {
      filter.$or = [
        { city: { $eq: req.query.orCity.trim() } },
        { marks: { $gte: Number(req.query.orMinMarks) } },
      ];
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [students, total] = await Promise.all([
      Student.find(filter).sort(sort).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      appliedFilter: filter,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: students,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * GET SINGLE STUDENT BY ID
 */
const getStudentByID = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID format" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * UPDATE STUDENT BY ID
 */
const updateStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID format" });
    }

    const updateData = pickAllowedFields(req.body);

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * DELETE STUDENT BY ID
 */
const deleteStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID format" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export {
  createStudent,
  getAllStudents,
  getStudentByID,
  updateStudent,
  deleteStudent,
};