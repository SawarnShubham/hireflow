const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    resume: {
      path: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
      },
      mimeType: {
        type: String,
      },
      size: {
        type: Number,
      },
    },

    status: {
      type: String,
      enum: ["APPLIED", "INTERVIEW_SCHEDULED", "REJECTED", "HIRED"],
      default: "APPLIED",
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   CRITICAL INDEX
   ========================= */

// Prevent duplicate applications (one candidate → one job → one application)
applicationSchema.index(
  { candidateId: 1, jobId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);
