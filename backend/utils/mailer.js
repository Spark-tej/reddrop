import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const secure = port === 465;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
  requireTLS: true,
  tls: { rejectUnauthorized: false },
});

// Verify transporter at startup; log warnings instead of breaking app startup.
transporter.verify().then(
  () => console.log("Mailer: SMTP transporter ready", host, port),
  (err) => console.warn("Mailer: transporter verify failed", err && err.message)
);

export const sendMail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || `RedDrop <no-reply@reddrop.app>`;
  return transporter.sendMail({ from, to, subject, html, text });
};
