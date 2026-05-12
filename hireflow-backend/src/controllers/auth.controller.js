const bcrypt = require("bcrypt");
const userModel = require("../models/User.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  address: user.address || "",
  linkedin: user.linkedin || "",
  github: user.github || "",
  about: user.about || "",
  image: user.image || "",
  role: user.role,
});

exports.register = async (req, res) => {
  try {
    // Getting the data

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array();
      return res.status(400).json({
        success: false,
        message: formattedErrors[0]?.msg || "Please check your details and try again.",
        errors: formattedErrors,
      });
    }

    const { name, email, password, phone, role } = req.body;

    const isExists = await userModel.findOne({ email });
    if (isExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role,
    });

    const userData = await newUser.save();
    if (userData) {
      return res.status(201).json({
        success: true,
        message: "The data has been saved successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//jwt.sign(payload, secret, options)

const generateAccessToken = async (user) => {
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );
  return token;
};

exports.login = async (req, res) => {
  try {
    // Getting the data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array();
      return res.status(400).json({
        success: false,
        message: formattedErrors[0]?.msg || "Please check your login details and try again.",
        errors: formattedErrors,
      });
    }

    const { email, password } = req.body;
    const userEmail = email.toLowerCase();

    const user = await userModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const accessToken = await generateAccessToken(user);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        ...toPublicUser(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "address", "about", "linkedin", "github", "image"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await userModel
      .findByIdAndUpdate(req.user.userId, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const strongPassword =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);

    if (!strongPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
