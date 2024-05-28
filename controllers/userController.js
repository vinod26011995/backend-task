const jwt = require("jsonwebtoken");
const { catchAsyncError } = require("../middlewares/catchasyncError");
const db = require("../models/db");
const express = require("express");

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const { token } = req.cookies;

  console.log("first", req.cookies);
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

router.get(
  "/me",
  authenticateToken,
  catchAsyncError(async (req, res, next) => {
    console.log(req.user);
    // Correct the usage of findByPk here
    const user = await db.Users.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  })
);

module.exports = router;
