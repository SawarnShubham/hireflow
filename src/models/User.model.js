const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },
    image:{
      type: String,
      default: null
    },

    role: {
      type: String,
      enum: ["CANDIDATE", "RECRUITER"],
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    verified: {
      type:Boolean,
		default: false
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
