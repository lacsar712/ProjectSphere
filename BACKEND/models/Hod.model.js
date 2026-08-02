import mongoose from 'mongoose';

const hodSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true, minlength: 3 },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 8 },
    role: { type: String, required: true, default: 'hod' },
    profilePhoto: { url: String, publicId: String },
    mobileNumber: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    otpHash: String,
    otpExpiry: Date,
    otpAttempts: { type: Number, default: 0 },
    refreshToken: String,
    
    department: { type: String, enum: ['Computer Science', 'Electrical', 'Mechanical Polytechnic', 'BCA', 'BBA', 'MBA', 'MCA', 'B.Ed', 'M.Ed'], required: true },
  },
  { timestamps: true }
);

export const Hod = mongoose.model('Hod', hodSchema);
