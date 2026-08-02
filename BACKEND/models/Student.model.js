import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true, minlength: 3 },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 8 },
    role: { type: String, required: true, default: 'student' },
    profilePhoto: { url: String, publicId: String },
    mobileNumber: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    otpHash: String,
    otpExpiry: Date,
    otpAttempts: { type: Number, default: 0 },
    refreshToken: String,
    
    // Student specifics
    course: { type: String, required: true },
    branch: { type: String, enum: ['Computer Science', 'Electrical', 'Mechanical Polytechnic', 'BCA', 'BBA', 'MBA', 'MCA', 'B.Ed', 'M.Ed'], required: true },
    year: { type: String, enum: ['1', '2', '3', '4'], default: '4' },
    section: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
    enrollmentNumber: String,
    isBanned: { type: Boolean, default: false },
    banReason: String,
    githubId: String,
    linkedinId: String,
    portfolioLink: String,
    resume: { url: String, publicId: String },
  },
  { timestamps: true }
);

export const Student = mongoose.model('Student', studentSchema);
