const { check } = require("express-validator");

exports.registerValidator = [
  check("name", "Name is required").notEmpty(),

  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),

  check("phone", "Phone number should be of 10 digits")
    .optional() // phone is optional in your model
    .isNumeric()
    .isLength({
      min: 10,
      max: 10,
    }),

  check(
    "password",
    "password must be greater than 6 charecters and conatians at least one uppercase letter,one lowercase letter, one number and one charecters"
  ).isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),

  check("role", "Role must be either CANDIDATE or RECRUITER").isIn([
    "CANDIDATE",
    "RECRUITER",
  ]),
];

exports.loginValidator = [
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }), 
  check("password", "Password is required").notEmpty(),
];
