import mongoose from 'mongoose';

const deadlineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    targetRoles: {
      type: [String],
      enum: ['student', 'faculty', 'all'],
      default: ['all'],
    },
    targetProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectProposal' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'createdModel', required: true },
    createdModel: { type: String, required: true, enum: ['Student', 'Faculty', 'Hod', 'Admin'] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Deadline = mongoose.model('Deadline', deadlineSchema);
