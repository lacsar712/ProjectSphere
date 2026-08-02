import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectProposal', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderModel: { type: String, enum: ['Student', 'Faculty', 'Hod'], required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
