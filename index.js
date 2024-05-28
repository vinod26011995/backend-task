const express = require("express");
require("dotenv").config({ path: "./.env" });
const db = require("./models/db");

const app = express();

//logger
const logger = require("morgan");
app.use(logger("tiny"));

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//cors
const cors = require("cors");
app.use(cors({ credentials: true, origin: true }));

//session and cookies
const session = require("express-session");
const cookiesParser = require("cookie-parser");
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.COOKIES_SECRET,
  })
);
app.use(cookiesParser());

app.use("/api/user", require("./controllers/userController"));
app.use("/api/auth", require("./controllers/authController"));

//error handler
const ErrorHandler = require("./utlis/ErrorHandler");
const { ganeratedError } = require("./middlewares/error");

app.all("*", (req, res, next) => {
  next(new ErrorHandler(`requested url not found ${req.url}`, 404));
});
app.use(ganeratedError);

app.listen(process.env.PORT, () => {
  console.log(`server is running ${process.env.PORT}`);
});
