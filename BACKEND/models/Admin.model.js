import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true, minlength: 3 },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 8 },
    role: { type: String, required: true, default: 'admin' },
    profilePhoto: { url: String, publicId: String },
    mobileNumber: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    otpHash: String,
    otpExpiry: Date,
    otpAttempts: { type: Number, default: 0 },
    refreshToken: String,
  },
  { timestamps: true }
);

export const Admin = mongoose.model('Admin', adminSchema);
