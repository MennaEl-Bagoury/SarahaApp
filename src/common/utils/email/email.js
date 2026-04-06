import nodemailer from "nodemailer";
import { EMAIL,PASSWORD } from "../../../../config/config.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

// Async function to send email
export const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Menna EL-Bagoury" <${EMAIL}>`,
      to,
      subject,
      text,
      html,
      attachments: attachments || [],
    });

    console.log("Message sent:", info.messageId);

    return info.accepted.length > 0 ? true : false;
  } catch (error) {
    console.log("Email Error:", error);
    return false;
  }
};

// Generate OTP
export const generatOTP = async () => {
  return Math.floor(100000 + Math.random() * 900000);
};