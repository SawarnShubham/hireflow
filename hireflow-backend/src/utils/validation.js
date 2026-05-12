const { check } = require("express-validator");

exports.registerValidator = [
  check("name", "Full name is required").notEmpty(),

  check("email", "Enter a valid email address").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),

  check("phone", "Phone number must be 10 digits")
    .optional({ checkFalsy: true })
    .isNumeric()
    .isLength({
      min: 10,
      max: 10,
    }),

  check("password")
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  .withMessage(
    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
  ),

  check("role", "Role must be either CANDIDATE or RECRUITER").isIn([
    "CANDIDATE",
    "RECRUITER",
  ]),
];

exports.loginValidator = [
  check("email", "Enter a valid email address").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }), 
  check("password", "Password is required").notEmpty(),
];
