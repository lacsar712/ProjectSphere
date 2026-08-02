import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: 2000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdModel',
      required: true,
    },
    createdModel: { type: String, required: true, enum: ['Student', 'Faculty', 'Hod', 'Admin'] },
    createdByName: { type: String, required: true },
    createdByRole: {
      type: String,
      enum: ['admin', 'hod', 'faculty'],
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'student', 'faculty'],
      default: 'all',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
