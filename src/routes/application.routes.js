const express = require("express");
const router = express.Router();

const {
  applyToJob,
  getApplicationsForJob,
  myapplications,
  updateApplicationStatus,
} = require("../controllers/application.controller");

const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const uploadResume = require("../middlewares/resumeUpload.middleware");

/**
 * Candidate applies to job
 */
router.post(
  "/apply/:id",
  verifyToken,
  allowRoles("CANDIDATE"),
  uploadResume.single("resume"),
  applyToJob
);

/**
 * Recruiter gets applications for a specific job
 */
router.get(
  "/job/:jobId",
  verifyToken,
  allowRoles("RECRUITER"),
  getApplicationsForJob
);
router.patch(
  "/:applicationId/status",
  verifyToken,
  allowRoles("RECRUITER"),
  updateApplicationStatus
);

router.get(
  "/me",
  verifyToken,
  allowRoles("CANDIDATE"),
  myapplications
); 


module.exports = router;
