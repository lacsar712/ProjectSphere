/**
 * Local-first mailer: never blocks offline usage.
 * When SMTP is not configured, emails are logged to the console and return false.
 */
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
);

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_PORT) === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log(`\x1b[32m[EMAIL]\x1b[0m SMTP configured → ${process.env.SMTP_HOST}`);
} else {
  console.log('\x1b[33m[EMAIL]\x1b[0m SMTP not configured — offline mode (OTP logged locally)');
}

export const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log(`\x1b[33m[EMAIL:LOCAL]\x1b[0m To: ${to} | Subject: ${subject}`);
    // Extract OTP-looking 6-digit code for console convenience
    const otpMatch = String(html).match(/\b(\d{6})\b/);
    if (otpMatch) console.log(`\x1b[33m[EMAIL:LOCAL]\x1b[0m OTP for ${to}: ${otpMatch[1]}`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"FYP Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    const otpMatch = String(html).match(/\b(\d{6})\b/);
    if (otpMatch) console.log(`\x1b[33m[EMAIL:LOCAL]\x1b[0m Fallback OTP for ${to}: ${otpMatch[1]}`);
    return false;
  }
};

/** True when running without external mail dependency */
export const isOfflineEmail = () => !smtpConfigured;
