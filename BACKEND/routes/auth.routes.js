import express from 'express';
import {
  registerStudent,
  registerFaculty,
  verifyOTP,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/register/student', upload.single('profilePhoto'), registerStudent);
router.post('/register/faculty', upload.single('profilePhoto'), registerFaculty);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

// Placeholder for ME route to test Auth middleware
router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

export default router;
