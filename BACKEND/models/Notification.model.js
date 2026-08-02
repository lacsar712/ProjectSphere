import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel', required: true },
    userModel: { type: String, required: true, enum: ['Student', 'Faculty', 'Hod', 'Admin'] },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['deadline', 'approval', 'rejection', 'assignment', 'feedback', 'general', 'submission'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
