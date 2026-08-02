import crypto from 'crypto';

export const generateOTP = () => {
  // Generate 6-character alphanumeric OTP: uppercase letters (A-Z) + digits (0-9)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    otp += characters[randomBytes[i] % characters.length];
  }
  return otp;
};
