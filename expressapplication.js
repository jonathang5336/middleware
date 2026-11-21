
import fs from "fs";
import os from "os";
import path from "path";
import express from "express";

const router = express.Router();

const DATA_FILE = path.join(os.tmpdir(), "faculty.json");

// Create temporary data file if it doesn't exist
const initializeData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
};

const readData = () => {
  initializeData();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

const writeData = (data) => {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
};

// Create a faculty member
router.post("/", (req, res) => {
  const allFaculty = readData();

  const newFaculty = {
    id: allFaculty.length === 0
      ? 1
      : allFaculty[allFaculty.length - 1].id + 1,
    ...req.body,
  };

  allFaculty.push(newFaculty);
  writeData(allFaculty);

  res.status(201).json({
    message: "Faculty member created successfully",
    data: newFaculty,
  });
});

// Get all faculty members
router.get("/", (req, res) => {
  let allFaculty = readData();
  const dept = req.query.dept;

  if (dept) {
    allFaculty = allFaculty.filter(
      (faculty) => faculty.dept === dept
    );
  }

  res.status(200).json({
    message: "Faculty retrieved successfully",
    data: allFaculty,
  });
});

// Get one faculty member by ID
router.get("/:id", (req, res) => {
  const allFaculty = readData();
  const facultyId = parseInt(req.params.id);

  const faculty = allFaculty.find(
    (faculty) => faculty.id === facultyId
  );

  if (faculty) {
    res.status(200).json({
      message: "Faculty member retrieved successfully",
      data: faculty,
    });
  } else {
    res.status(404).json({
      message: "Faculty member not found",
    });
  }
});

// Update a faculty member
router.put("/:id", (req, res) => {
  const allFaculty = readData();
  const facultyId = parseInt(req.params.id);

  const facultyIndex = allFaculty.findIndex(
    (faculty) => faculty.id === facultyId
  );

  if (facultyIndex !== -1) {
    const updatedFaculty = {
      ...allFaculty[facultyIndex],
      ...req.body,
      id: facultyId,
    };

    allFaculty[facultyIndex] = updatedFaculty;
    writeData(allFaculty);

    res.status(200).json({
      message: "Faculty member updated successfully",
      data: updatedFaculty,
    });
  } else {
    res.status(404).json({
      message: "Faculty member not found",
    });
  }
});

// Delete a faculty member
router.delete("/:id", (req, res) => {
  const facultyId = parseInt(req.params.id);
  const allFaculty = readData();

  const facultyIndex = allFaculty.findIndex(
    (faculty) => faculty.id === facultyId
  );

  if (facultyIndex !== -1) {
    const deletedFaculty = allFaculty.splice(facultyIndex, 1)[0];
    writeData(allFaculty);

    res.status(200).json({
      message: "Faculty member deleted successfully",
      data: deletedFaculty,
    });
  } else {
    res.status(404).json({
      message: "Faculty member not found",
    });
  }
});

export default router;
