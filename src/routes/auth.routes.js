const express = require('express');
const router= express.Router();
const authController = require('../controllers/auth.controller');
const registerValidator = require('../utils/validation');

router.post(
    "/register",
    registerValidator.registerValidator,
    authController.register
)

router.post(
    "/login",
    registerValidator.loginValidator,
    authController.login
)

module.exports = router;