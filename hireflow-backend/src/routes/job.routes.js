const express = require("express");
const router = express.Router();

const {
  addJob,
  getJobById,
  getAllJobs,
  getMyJobs,
  getMyJobById,
  updateJobById,
  deleteJobById,
} = require("../controllers/job.controller");

const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

// ================= PUBLIC ROUTES =================

// Get all active jobs (public)
router.get("/", getAllJobs);

// ================= PROTECTED ROUTES =================
// Recruiter only

// Get own jobs
router.get(
  "/mine",
  verifyToken,
  allowRoles("RECRUITER"),
  getMyJobs
);

router.get(
  "/mine/:id",
  verifyToken,
  allowRoles("RECRUITER"),
  getMyJobById
);

// Get single job by ID (public)
router.get("/:id", getJobById);

// Create job
router.post(
  "/",
  verifyToken,
  allowRoles("RECRUITER"),
  addJob
);

// Update job (owner only)
router.put(
  "/:id",
  verifyToken,
  allowRoles("RECRUITER"),
  updateJobById
);

// Delete job (soft delete, owner only)
router.delete(
  "/:id",
  verifyToken,
  allowRoles("RECRUITER"),
  deleteJobById
);

module.exports = router;
