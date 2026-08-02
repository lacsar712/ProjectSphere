import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true, minlength: 3 },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 8 },
    role: { type: String, required: true, default: 'faculty' },
    profilePhoto: { url: String, publicId: String },
    mobileNumber: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    otpHash: String,
    otpExpiry: Date,
    otpAttempts: { type: Number, default: 0 },
    refreshToken: String,

    // Faculty specifics
    department: { type: String, enum: ['Computer Science', 'Electrical', 'Mechanical Polytechnic', 'BCA', 'BBA', 'MBA', 'MCA', 'B.Ed', 'M.Ed'], required: true },
    designation: String,
    employeeId: String,
    rejectionReason: String,
    specialization: String,
    maxStudents: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export const Faculty = mongoose.model('Faculty', facultySchema);
