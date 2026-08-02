import { Student } from '../models/Student.model.js';
import { Faculty } from '../models/Faculty.model.js';
import { Hod } from '../models/Hod.model.js';
import { Admin } from '../models/Admin.model.js';
import { generateOTP } from '../utils/otp.util.js';
import { sendEmail, isOfflineEmail } from '../config/nodemailer.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import { toPublicUrl } from '../utils/localFiles.js';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UPLOAD_ROOT } from '../utils/localFiles.js';

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const getModelByRole = (role) => {
  switch (role) {
    case 'student': return Student;
    case 'faculty': return Faculty;
    case 'hod': return Hod;
    case 'admin': return Admin;
    default: return null;
  }
};

/** Skip email OTP when offline / local mode or SMTP is not configured */
const shouldSkipEmailVerification = () =>
  process.env.SKIP_EMAIL_VERIFICATION === 'true' ||
  process.env.LOCAL_OFFLINE === 'true' ||
  isOfflineEmail();

const photoFromUpload = (file) => {
  if (!file) return {};
  const relative = path.relative(UPLOAD_ROOT, file.path).replace(/\\/g, '/');
  return {
    url: toPublicUrl(file),
    publicId: relative || file.filename,
  };
};

export const registerStudent = async (req, res) => {
  console.log('\n\x1b[36m[AUTH]\x1b[0m POST /api/auth/register/student →', req.body?.email);
  try {
    const { name, email, password, mobileNumber, course, branch, year, section } = req.body;

    const userExists = await Student.findOne({ email });
    if (userExists) {
      console.log('\x1b[33m[WARN]\x1b[0m Student already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 12);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const skipEmail = shouldSkipEmailVerification();
    const student = await Student.create({
      name, email, password: hashedPassword,
      mobileNumber, course, branch, year, section,
      role: 'student', otpHash, otpExpiry,
      profilePhoto: photoFromUpload(req.file),
      isEmailVerified: skipEmail,
    });

    let emailSent = false;
    if (skipEmail) {
      console.log(`\x1b[33m[LOCAL]\x1b[0m Auto-verified student ${email}`);
    } else {
      emailSent = await sendEmail(
        email,
        'Verify Your Email Address',
        emailTemplates.otpEmail(name, otp)
      );
      if (!emailSent) {
        student.isEmailVerified = true;
        await student.save({ validateBeforeSave: false });
        console.log(`\x1b[33m[LOCAL]\x1b[0m Email unavailable — auto-verified ${email}`);
      }
    }

    const verified = student.isEmailVerified;
    console.log('\x1b[32m[SUCCESS]\x1b[0m Student registered:', email, '| verified:', verified);
    res.status(201).json({
      message: verified
        ? 'Student registered successfully. You can log in now.'
        : 'Student registered successfully. Please verify your email.',
      emailSent,
      verified,
      ...(verified ? {} : { otp }),
    });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m registerStudent:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const registerFaculty = async (req, res) => {
  console.log('\n\x1b[36m[AUTH]\x1b[0m POST /api/auth/register/faculty →', req.body?.email);
  try {
    const { name, email, password, mobileNumber, department, designation, employeeId } = req.body;

    const userExists = await Faculty.findOne({ email });
    if (userExists) {
      console.log('\x1b[33m[WARN]\x1b[0m Faculty already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 12);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const skipEmail = shouldSkipEmailVerification();
    // Local/offline: auto-approve so faculty can log in without external mail + HOD wait
    const autoApprove = process.env.LOCAL_OFFLINE === 'true' || isOfflineEmail();
    const faculty = await Faculty.create({
      name, email, password: hashedPassword,
      mobileNumber, department, designation, employeeId,
      role: 'faculty', otpHash, otpExpiry,
      isApproved: autoApprove,
      profilePhoto: photoFromUpload(req.file),
      isEmailVerified: skipEmail,
    });

    let emailSent = false;
    if (skipEmail) {
      console.log(`\x1b[33m[LOCAL]\x1b[0m Auto-verified faculty ${email}`);
    } else {
      emailSent = await sendEmail(
        email,
        'Verify Your Email Address',
        emailTemplates.otpEmail(name, otp)
      );
      if (!emailSent) {
        faculty.isEmailVerified = true;
        await faculty.save({ validateBeforeSave: false });
        console.log(`\x1b[33m[LOCAL]\x1b[0m Email unavailable — auto-verified ${email}`);
      }
    }

    const verified = faculty.isEmailVerified;
    console.log('\x1b[32m[SUCCESS]\x1b[0m Faculty registered:', email, '| verified:', verified, '| approved:', faculty.isApproved);
    res.status(201).json({
      message: verified
        ? (faculty.isApproved
          ? 'Faculty registered successfully. You can log in now.'
          : 'Faculty registered successfully. Awaiting HOD approval.')
        : 'Faculty registered successfully. Please verify your email.',
      emailSent,
      verified,
      isApproved: faculty.isApproved,
      ...(verified ? {} : { otp }),
    });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m registerFaculty:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  console.log('\n\x1b[36m[AUTH]\x1b[0m POST /api/auth/verify-otp →', req.body?.email);
  try {
    const { email, otp, role } = req.body;

    let user = null;
    if (role) {
      const Model = getModelByRole(role.toLowerCase());
      if (Model) user = await Model.findOne({ email });
    } else {
      user = await Student.findOne({ email }) || await Faculty.findOne({ email });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });
    if (user.otpAttempts >= 5) return res.status(400).json({ message: 'Maximum OTP attempts reached.' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'OTP expired' });

    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      console.log('\x1b[33m[WARN]\x1b[0m Invalid OTP attempt for:', email, '| Attempts:', user.otpAttempts);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    console.log('\x1b[32m[SUCCESS]\x1b[0m Email verified for:', email);
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m verifyOTP:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  console.log('\n\x1b[36m[AUTH]\x1b[0m POST /api/auth/login →', req.body?.email, 'Role:', req.body?.role);
  try {
    let { email, password, role } = req.body;
    if (email) email = email.trim().toLowerCase();

    if (!role) {
      return res.status(400).json({ message: 'Role is required for login' });
    }

    const Model = getModelByRole(role.toLowerCase());
    if (!Model) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await Model.findOne({ email });

    if (!user) {
      console.log('\x1b[31m[FAIL]\x1b[0m Login - user not found:', email);
      return res.status(404).json({ message: 'Invalid credentials' });
    }
    if (!user.isEmailVerified) {
      console.log('\x1b[33m[WARN]\x1b[0m Login blocked - email not verified:', email);
      return res.status(400).json({ message: 'Please verify your email first' });
    }
    if (user.role === 'faculty' && !user.isApproved) {
      console.log('\x1b[33m[WARN]\x1b[0m Login blocked - faculty pending HOD approval:', email);
      return res.status(403).json({ message: 'Account is pending HOD approval' });
    }
    if (user.role === 'student' && user.isBanned) {
      console.log('\x1b[33m[WARN]\x1b[0m Login blocked - student banned:', email);
      return res.status(403).json({ message: `Access denied: ${user.banReason || 'You have been temporarily restricted.'}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('\x1b[31m[FAIL]\x1b[0m Login - wrong password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    await Model.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken }, { new: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log('\x1b[32m[SUCCESS]\x1b[0m Login:', email, '| Role:', user.role);
    res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, accessToken });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m login:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    const Model = getModelByRole(role.toLowerCase());
    if (!Model) return res.status(400).json({ message: 'Invalid role' });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 12);
    user.otpHash = otpHash;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const emailSent = await sendEmail(
      email,
      'Reset Your Password',
      emailTemplates.otpEmail(user.name, otp)
    );

    if (!emailSent) {
      console.log(`\x1b[33m[LOCAL]\x1b[0m Password reset OTP for ${email}: ${otp}`);
      return res.status(200).json({
        message: 'OTP generated locally (no email service). Use the OTP shown.',
        otp,
        local: true,
      });
    }

    res.status(200).json({ message: 'OTP sent to email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    const Model = getModelByRole(role.toLowerCase());
    if (!Model) return res.status(400).json({ message: 'Invalid role' });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otpHash || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP request found.' });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    const isValid = await bcrypt.compare(otp, user.otpHash);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

    const resetToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ message: 'OTP verified', resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded || !decoded.id || !decoded.role) return res.status(401).json({ message: 'Invalid or expired reset session.' });

    const Model = getModelByRole(decoded.role.toLowerCase());
    const user = await Model.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired. Please try again.' });
    res.status(500).json({ message: error.message });
  }
};
