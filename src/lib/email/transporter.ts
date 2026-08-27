import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailAddress =
  process.env.NOREPLY_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER;
export const fromEmail = `"Fade Master" <${emailAddress}>`;
