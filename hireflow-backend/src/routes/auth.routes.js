const express = require('express');
const router= express.Router();
const authController = require('../controllers/auth.controller');
const registerValidator = require('../utils/validation');
const verifyToken = require("../middlewares/auth.middleware");

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

router.get("/me", verifyToken, authController.me)

router.put("/me", verifyToken, authController.updateMe)

router.patch("/me/password", verifyToken, authController.changePassword)

module.exports = router;
