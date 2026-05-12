const mongoose = require("mongoose");
const Jobs = require("../models/Job.model");
const Applications = require("../models/Application.model");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

    if (req.query.location) {
      query.location = { $regex: escapeRegex(req.query.location.trim()), $options: "i" };
    }

    if (req.query.job_type) {
      query.job_type = { $regex: escapeRegex(req.query.job_type.trim()), $options: "i" };
    }

    if (req.query.search) {
      const searchRegex = { $regex: escapeRegex(req.query.search.trim()), $options: "i" };
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
      ];
    }

    if (req.query.tags) {
      const tagsArray = req.query.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

      if (tagsArray.length > 0) {
        query.tags = { $in: tagsArray };
      }
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

exports.getMyJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID format",
      });
    }

    const job = await Jobs.findOne({ _id: id, author: req.user.userId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error fetching recruiter job:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to retrieve job",
    });
  }
};

/**
 * GET RECRUITER JOBS (Recruiter only)
 */
exports.getMyJobs = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const jobs = await Jobs.find({ author: recruiterId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const jobIds = jobs.map((job) => job._id);
    const counts = await Applications.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", total: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((acc, item) => {
      acc[item._id.toString()] = item.total;
      return acc;
    }, {});
    const jobsWithCounts = jobs.map((job) => ({
      ...job.toObject(),
      applicationCount: countMap[job._id.toString()] || 0,
    }));
    const totalJobs = await Jobs.countDocuments({ author: recruiterId });

    return res.status(200).json({
      success: true,
      total: totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching recruiter jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch your jobs",
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

    await Applications.updateMany(
      {
        jobId: job._id,
        status: { $in: ["APPLIED", "INTERVIEW_SCHEDULED"] },
      },
      { status: "CLOSED" }
    );

    return res.status(200).json({
      success: true,
      message: "Job closed successfully",
      job,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Failed to delete job",
    });
  }
};
