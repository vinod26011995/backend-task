const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { sendResetPasswordEmail } = require("../utlis/emailService");
const { catchAsyncError } = require("../middlewares/catchasyncError");
const ErrorHandler = require("../utlis/ErrorHandler");
const router = express.Router();

router.post(
  "/signup",
  catchAsyncError(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await db.Users.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    res.status(201).json({ message: "user created successfully", user });
  })
);

router.post(
  "/login",
  catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await db.Users.findOne({ where: { email } });
    if (!user) return next(new ErrorHandler("Invalid deatils", 404));
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new ErrorHandler("Invalid deatils", 404));
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .cookie("token", token)
      .json({ message: "login successfull", token, user });
  })
);

router.post(
  "/forget-password",
  catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    const user = await db.Users.findOne({ where: { email } });
    if (!user) return next(new ErrorHandler("Invalid deatils", 404));

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 300000;
    await user.save();
    await sendResetPasswordEmail(email, token);
    res.json({ message: "password reset link send successfully" });
  })
);

router.post(
  "/reset-password",
  catchAsyncError(async (req, res, next) => {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.Users.findOne({
      where: { id: decoded.id, resetPasswordToken: token },
    });
    if (!user) return next(new ErrorHandler("Invalid deatils", 404));
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    res.json({ message: "password reset successfully" });
  })
);

module.exports = router;
