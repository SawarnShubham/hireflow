const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    job_type: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: String, // supports ranges like "5-8 LPA"
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Recruiter who created the job
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Job lifecycle control
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);



// For recruiter dashboards (jobs by recruiter)
jobSchema.index({ author: 1 });

// For public job listings (active jobs)
jobSchema.index({ active: 1 });

module.exports = mongoose.model("Job", jobSchema);
