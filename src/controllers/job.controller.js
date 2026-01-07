const mongoose = require("mongoose");
const Jobs = require("../models/Job.model");

/**
 * CREATE JOB (Recruiter only)
 */
exports.addJob = async (req, res) => {
  try {
    const { title, description, company, job_type, salary, tags, location } =
      req.body;

    // Input validation
    if (!title || !description || !company || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (title, description, company, location)",
      });
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      processedTags = Array.isArray(tags)
        ? tags.map((tag) => tag.trim().toLowerCase())
        : tags.split(",").map((tag) => tag.trim().toLowerCase());
    }

    const newJob = await Jobs.create({
      title,
      description,
      company,
      job_type,
      salary,
      location,
      tags: processedTags,
      author: req.user.userId, // ownership from JWT
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("Error adding job:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * GET JOB BY ID (Public, only active jobs)
 */
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID format",
      });
    }

    const job = await Jobs.findOne({ _id: id, active: true }).populate(
      "author",
      "name email"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to retrieve job",
    });
  }
};

/**
 * GET ALL JOBS (Public, Pagination)
 */
exports.getAllJobs = async (req, res) => {
  try {
    // ---------------- PAGINATION ----------------
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ---------------- BASE QUERY ----------------
    const query = { active: true };

    // ---------------- FILTERS ----------------

    // Filter by location
    if (req.query.location) {
      query.location = req.query.location;
    }

    // Filter by job type
    if (req.query.job_type) {
      query.job_type = req.query.job_type;
    }

    // Filter by tags (comma separated)
    if (req.query.tags) {
      const tagsArray = req.query.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());

      query.tags = { $in: tagsArray };
    }

    // ---------------- SORTING ----------------
    let sortOption = { createdAt: -1 }; // default: latest

    if (req.query.sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    // ---------------- DB QUERY ----------------
    const jobs = await Jobs.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalJobs = await Jobs.countDocuments(query);

    return res.status(200).json({
      success: true,
      total: totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch jobs",
    });
  }
};

/**
 * UPDATE JOB (Recruiter + Owner only)
 */
exports.updateJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, company, job_type, salary, tags, location } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID format",
      });
    }

    let processedTags;
    if (tags) {
      processedTags = Array.isArray(tags)
        ? tags.map((tag) => tag.trim().toLowerCase())
        : tags.split(",").map((tag) => tag.trim().toLowerCase());
    }

    const updatedJob = await Jobs.findOneAndUpdate(
      { _id: id, author: req.user.userId, active: true },
      {
        title,
        description,
        company,
        job_type,
        salary,
        location,
        ...(processedTags && { tags: processedTags }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error: Failed to update job",
    });
  }
};

/**
 * DELETE JOB (Soft delete, Recruiter + Owner only)
 */
exports.deleteJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID format",
      });
    }

    const job = await Jobs.findOneAndUpdate(
      { _id: id, author: req.user.userId, active: true },
      { active: false },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not authorized",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Failed to delete job",
    });
  }
};
