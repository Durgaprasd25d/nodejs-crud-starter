import express from "express";
import studentRoutes from "./routes/student.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Student API");
});

// Authentication routes (Register & Login - Public)
// Mount both /api/auth and /auth to support both URL conventions
app.use("/api/auth", userRoutes);
app.use("/auth", userRoutes);

// Student routes (Protected by auth middleware)
app.use("/api", studentRoutes);
app.use("/", studentRoutes);

export default app;