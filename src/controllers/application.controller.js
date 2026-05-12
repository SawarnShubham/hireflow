const mongoose = require("mongoose");
const Applications = require("../models/Application.model");
const Jobs = require("../models/Job.model");

exports.applyToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.userId;

    // Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID format",
      });
    }

    // Check job existence
    const job = await Jobs.findOne({ _id: id, active: true });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or inactive",
      });
    }

    // Resume validation (FILE BASED)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume (PDF only)",
      });
    }

    const application = await Applications.create({
      candidateId,
      jobId: job._id,
      resume: {
        path: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    // Duplicate application
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    console.error("Apply job error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.userId;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID format",
      });
    }

    // Check job ownership
    const job = await Jobs.findOne({ _id: jobId, author: recruiterId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found or you do not have permission to view applications for this job",
      });
    }

    // Fetch applications
    const applications = await Applications.find({ jobId })
      .populate("candidateId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalApplications = await Applications.countDocuments({ jobId });

    // Shape response (IMPORTANT)
    const formattedApplications = applications.map((app) => ({
      applicationId: app._id,
      status: app.status,
      appliedAt: app.createdAt,

      candidate: {
        id: app.candidateId._id,
        name: app.candidateId.name,
        email: app.candidateId.email,
      },

      resume: {
        path: app.resume.path,
        originalName: app.resume.originalName,
        mimeType: app.resume.mimeType,
      },
    }));

    return res.status(200).json({
      success: true,
      totalApplications,
      currentPage: page,
      totalPages: Math.ceil(totalApplications / limit),
      applications: formattedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications for job:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.myapplications = async (req, res) => {
  try {
    const candidateId = req.user.userId;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch applications for logged-in candidate
    const applications = await Applications.find({ candidateId })
      .populate("jobId", "title company location job_type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalApplications = await Applications.countDocuments({
      candidateId,
    });

    // Shape response
    const formattedApplications = applications.map((app) => ({
      applicationId: app._id,
      status: app.status,
      appliedAt: app.createdAt,

      job: {
        id: app.jobId._id,
        title: app.jobId.title,
        company: app.jobId.company,
        location: app.jobId.location,
        jobType: app.jobId.job_type,
      },

      resume: {
        path: app.resume.path,
        originalName: app.resume.originalName,
        mimeType: app.resume.mimeType,
      },
    }));

    return res.status(200).json({
      success: true,
      totalApplications,
      currentPage: page,
      totalPages: Math.ceil(totalApplications / limit),
      applications: formattedApplications,
    });
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.userId;

    // 1️⃣ Validate Application ID
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Application ID format",
      });
    }

    // 2️⃣ Validate Status
    const allowedStatus = [
      "APPLIED",
      "INTERVIEW_SCHEDULED",
      "REJECTED",
      "HIRED",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    // 3️⃣ Find Application
    const application = await Applications.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // 4️⃣ Check Job Ownership
    const job = await Jobs.findOne({
      _id: application.jobId,
      author: recruiterId,
    });

    if (!job) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this application",
      });
    }

    // 5️⃣ Update Status
    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating application status",
    });
  }
};
