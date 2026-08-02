import { ProjectProposal } from '../models/Proposal.model.js';
import { Message } from '../models/Message.model.js';
import { Notification } from '../models/Notification.model.js';
import { Student } from '../models/Student.model.js';

export const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const proposal = await ProjectProposal.findById(projectId);
    if (!proposal) return res.status(404).json({ message: 'Project not found' });

    // Auth check
    const isLeader = proposal.studentId.toString() === req.user._id.toString();
    const isMember = proposal.teamMembers?.some(m => m.email.toLowerCase().trim() === req.user.email?.toLowerCase().trim());
    const isFaculty = proposal.assignedFaculty?.toString() === req.user._id.toString();
    const isHOD = req.user.role === 'hod' && proposal.department === req.user.department;

    if (!isLeader && !isMember && !isFaculty && !isHOD) {
      return res.status(403).json({ message: 'You are not authorized to view messages for this project' });
    }

    const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendProjectMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const proposal = await ProjectProposal.findById(projectId).populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Project not found' });

    // Auth check
    const isLeader = proposal.studentId._id.toString() === req.user._id.toString();
    const isMember = proposal.teamMembers?.some(m => m.email.toLowerCase().trim() === req.user.email?.toLowerCase().trim());
    const isFaculty = proposal.assignedFaculty?.toString() === req.user._id.toString();
    const isHOD = req.user.role === 'hod' && proposal.department === req.user.department;

    if (!isLeader && !isMember && !isFaculty && !isHOD) {
      return res.status(403).json({ message: 'You are not authorized to send messages to this project' });
    }

    const senderModel = req.user.role === 'student' ? 'Student' : req.user.role === 'faculty' ? 'Faculty' : 'Hod';

    const message = await Message.create({
      projectId,
      senderId: req.user._id,
      senderModel,
      senderName: req.user.name,
      content
    });

    // Create notifications for other participants
    // 1. Notify student leader if sent by HOD or Faculty
    if ((isFaculty || isHOD) && proposal.studentId) {
      await Notification.create({
        userId: proposal.studentId._id,
        userModel: 'Student',
        message: `New message from ${req.user.name} in team channel.`,
        type: 'general',
        link: `/projects/${projectId}/messages`
      });
    }

    // 2. Notify Faculty if sent by student/HOD
    if ((isLeader || isMember || isHOD) && proposal.assignedFaculty) {
      await Notification.create({
        userId: proposal.assignedFaculty,
        userModel: 'Faculty',
        message: `New message from ${req.user.name} in project "${proposal.title}".`,
        type: 'general',
        link: `/projects/${projectId}/messages`
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrivateNotes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { privateNotes } = req.body;
    
    const proposal = await ProjectProposal.findById(projectId);
    if (!proposal) return res.status(404).json({ message: 'Project not found' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }

    // Only HOD or assigned Faculty can update private notes
    const isFaculty = proposal.assignedFaculty?.toString() === req.user._id.toString();
    const isHOD = req.user.role === 'hod' && proposal.department === req.user.department;

    if (!isFaculty && !isHOD) {
      return res.status(403).json({ message: 'Only supervisor or HOD can update private notes' });
    }

    proposal.privateNotes = privateNotes || '';
    await proposal.save();

    res.status(200).json({ message: 'Private notes updated successfully', privateNotes: proposal.privateNotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
