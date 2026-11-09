import express from "express"
import studentRoutes from "./routes/student.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Student API");
});


// All student routes here
app.use("/api", studentRoutes);

export default app;