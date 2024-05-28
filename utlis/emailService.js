const nodemailer = require("nodemailer");
const ErrorHandler = require("./ErrorHandler");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smpt.gmail.com",
  post: 465,
  auth: {
    user: process.env.GMAIL_USER || "vinodyv95@gmail.com",
    pass: process.env.GMAIL_PASS || "ycdcqgxfiycwbmhk",
  },
});

const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `http://localhost:${process.env.PORT}/reset-password?token=${token}`;
  await transporter.sendMail(
    {
      from: process.GMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `here is reset password link ${resetLink} valied for 5 minute.`,
    },
    (err, info) => {
      console.log(err);
      console.log(info);
    }
  );
};

module.exports = { sendResetPasswordEmail };
