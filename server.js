
import express from "express";
import cors from "cors";
import morgan from "morgan";
import facultyRouter from "./expressapplication.js";

const app = express();

// Third-party middleware
app.use(cors());
app.use(morgan("dev"));

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware
const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

app.use(logger);

// Route-specific validation middleware
const validate = (req, res, next) => {
  const { name, gender, ward } = req.body || {};

  if (!name || !gender || !ward) {
    const err = new Error("Patient details are missing");
    err.statusCode = 400;
    return next(err);
  }

  next();
};

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Middleware Lab API is running successfully"
  });
});

// PATIENT API

// Create patient
app.post("/api/v1/patients", validate, (req, res) => {
  res.status(201).send("Patient record created successfully");
});

// Read all patients
app.get("/api/v1/patients", (req, res) => {
  const ward = req.query.ward;

  if (ward) {
    return res.status(200).send(
      `Patients of ${ward} ward fetched successfully`
    );
  }

  res.status(200).send("All patients fetched successfully");
});

// Read one patient
app.get("/api/v1/patients/:id", (req, res) => {
  const id = req.params.id;

  res.status(200).send(
    `Patient with id ${id} fetched successfully`
  );
});

// Update one patient
app.put("/api/v1/patients/:id", validate, (req, res) => {
  const id = req.params.id;

  res.status(200).send(
    `Patient with id ${id} updated successfully`
  );
});

// Delete one patient
app.delete("/api/v1/patients/:id", (req, res) => {
  const id = req.params.id;

  res.status(200).send(
    `Patient with id ${id} deleted successfully`
  );
});

// FACULTY API
app.use("/api/v1/faculty", facultyRouter);

// 404 middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Resource not found"
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  const errorCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(errorCode).json({
    message
  });
});

// Local development server
if (!process.env.VERCEL) {
  const PORT = 6500;

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel
export default app;
