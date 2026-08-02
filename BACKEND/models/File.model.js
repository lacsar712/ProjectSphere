import mongoose from 'mongoose';

const fileSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectProposal',
      required: true,
    },
    fileType: {
      type: String,
      enum: ['document', 'presentation', 'paper'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export const FileSubmission = mongoose.model('FileSubmission', fileSubmissionSchema);
