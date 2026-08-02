import { ProjectProposal } from '../models/Proposal.model.js';
import { FileSubmission } from '../models/File.model.js';
import { Deadline } from '../models/Deadline.model.js';
import { Notification } from '../models/Notification.model.js';
import { Faculty } from '../models/Faculty.model.js';
import { Student } from '../models/Student.model.js';
import { sendEmail } from '../config/nodemailer.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import { ExtensionRequest } from '../models/ExtensionRequest.model.js';

// ── getFacultyDashboard ───────────────────────────────────────────────────────
export const getFacultyDashboard = async (req, res) => {
  try {
    const activeProjects = await ProjectProposal.find({
      assignedFaculty: req.user._id,
      status: { $in: ['Faculty Accepted', 'Submitted'] }
    }).populate('studentId', 'name email branch course year section mobileNumber profilePhoto');

    const pendingProposals = await ProjectProposal.find({
      assignedFaculty: req.user._id, status: 'Faculty Assigned'
    }).populate('studentId', 'name email branch course year section mobileNumber');

    // For each active project, get its uploaded files
    const projectFiles = {};
    await Promise.all(activeProjects.map(async (p) => {
      const files = await FileSubmission.find({ projectId: p._id }).sort({ createdAt: -1 });
      projectFiles[p._id.toString()] = files;
    }));

    const recentSubmissions = await FileSubmission.find({
      projectId: { $in: activeProjects.map(p => p._id) }
    }).populate('studentId', 'name').sort({ createdAt: -1 }).limit(10);

    const deadlines = await Deadline.find({
      $or: [
        { isActive: true, $or: [{ targetRoles: 'all' }, { targetRoles: 'faculty' }] },
        { isActive: true, createdBy: req.user._id }
      ]
    }).sort({ dueDate: 1 }).limit(10);

    const notifs = await Notification.find({ userId: req.user._id, isRead: false }).sort({ createdAt: -1 }).limit(10);

    // Compute Graphical Analytics
    const totalStudents = activeProjects.reduce((sum, p) => sum + 1 + (p.teamMembers?.length || 0), 0);
    const completedProjects = activeProjects.filter(p => p.status === 'Submitted' || p.finalSubmission?.status === 'Accepted').length;
    const pendingReviewsCount = pendingProposals.length;
    
    const now = new Date();
    const upcomingDeadlinesCount = await Deadline.countDocuments({
      isActive: true,
      dueDate: { $gt: now },
      $or: [
        { targetRoles: 'all' },
        { targetRoles: 'faculty' },
        { createdBy: req.user._id }
      ]
    });

    // Compute Recharts Weekly Activity Chart Data
    const weeklyActivity = [
      { name: 'Wk 1', updates: 0 },
      { name: 'Wk 2', updates: 0 },
      { name: 'Wk 3', updates: 0 },
      { name: 'Wk 4', updates: 0 },
    ];
    activeProjects.forEach(p => {
      p.timeline?.forEach(t => {
        const diffTime = Math.abs(now - new Date(t.timestamp));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) weeklyActivity[3].updates++;
        else if (diffDays <= 14) weeklyActivity[2].updates++;
        else if (diffDays <= 21) weeklyActivity[1].updates++;
        else if (diffDays <= 28) weeklyActivity[0].updates++;
      });
    });

    // Compute Recharts Department Distribution Data
    const deptDistribution = {};
    activeProjects.forEach(p => {
      const dept = p.department || 'Other';
      deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
    });
    const deptData = Object.keys(deptDistribution).map(name => ({
      name,
      value: deptDistribution[name]
    }));

    // Compute Recharts Student Progress Analytics Data
    const progressData = activeProjects.map(p => ({
      name: p.studentId?.name ? p.studentId.name.split(' ')[0] : 'Unknown',
      progress: p.progress || 0
    }));

    // Fetch extension requests for their projects
    const projectIds = activeProjects.map(p => p._id);
    const extensionRequests = await ExtensionRequest.find({
      projectId: { $in: projectIds }
    }).populate('studentId', 'name email').populate('deadlineId', 'title dueDate').sort({ createdAt: -1 });

    const analytics = {
      totalStudents,
      completedProjects,
      pendingReviewsCount,
      upcomingDeadlinesCount,
      weeklyActivity,
      deptData,
      progressData
    };

    console.log(`\x1b[36m[FACULTY]\x1b[0m Dashboard: ${req.user.email} | Active: ${activeProjects.length} | Students: ${totalStudents}`);
    res.status(200).json({
      profile: req.user,
      activeProjects,
      pendingProposals,
      projectFiles,
      recentSubmissions,
      deadlines,
      notifications: notifs,
      analytics,
      extensionRequests
    });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getFacultyDashboard:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── acceptProposal ────────────────────────────────────────────────────────────
export const acceptProposal = async (req, res) => {
  try {
    const proposal = await ProjectProposal.findOneAndUpdate(
      { _id: req.params.id, assignedFaculty: req.user._id },
      { status: 'Faculty Accepted', facultyReview: { action: 'Accepted', reviewedAt: Date.now() } },
      { new: true }
    ).populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    await Notification.create({ userId: proposal.studentId._id, userModel: 'Student', message: `Faculty "${req.user.name}" has accepted your project "${proposal.title}". You may now upload files.`, type: 'approval' });

    // Send confirmation email
    const subject = `✅ Project Accepted by ${req.user.name} — "${proposal.title}"`;
    const html = emailTemplates.proposalApproved(proposal.studentId.name, proposal.title, req.user.name);
    sendEmail(proposal.studentId.email, subject, html);

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Faculty accepted proposal: ${proposal.title}`);
    res.status(200).json({ message: 'Proposal accepted', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m acceptProposal:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── rejectProposal ────────────────────────────────────────────────────────────
export const rejectProposal = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.length < 20) return res.status(400).json({ message: 'Reason must be at least 20 characters' });
    const proposal = await ProjectProposal.findOneAndUpdate(
      { _id: req.params.id, assignedFaculty: req.user._id },
      { status: 'Rejected (Faculty)', facultyReview: { action: 'Rejected', comment: reason, reviewedAt: Date.now() }, assignedFaculty: null },
      { new: true }
    ).populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    await Notification.create({ userId: proposal.studentId._id, userModel: 'Student', message: `Your project "${proposal.title}" was rejected by faculty. Reason: ${reason}. HOD will reassign.`, type: 'rejection' });

    // Send rejection email
    const subject = `❌ Project Rejected by ${req.user.name} — "${proposal.title}"`;
    const html = emailTemplates.proposalRejected(proposal.studentId.name, proposal.title, reason);
    sendEmail(proposal.studentId.email, subject, html);

    console.log(`\x1b[31m[INFO]\x1b[0m Faculty rejected proposal: ${proposal.title}`);
    res.status(200).json({ message: 'Proposal rejected', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m rejectProposal:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── rejectFinalSubmission ─────────────────────────────────────────────────────
export const rejectFinalSubmission = async (req, res) => {
  try {
    const { reason, requiredCorrections } = req.body;
    if (!reason || reason.trim().length < 20) {
      return res.status(400).json({ message: 'Rejection reason must be at least 20 characters.' });
    }
    if (!requiredCorrections || requiredCorrections.trim().length < 20) {
      return res.status(400).json({ message: 'Required corrections must be at least 20 characters.' });
    }
    const proposal = await ProjectProposal.findOne({ _id: req.params.id, assignedFaculty: req.user._id })
      .populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Project not found or not assigned to you.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    if (proposal.status !== 'Submitted') {
      return res.status(400).json({ message: 'Project is not in Submitted state.' });
    }

    // Record history
    proposal.submissionHistory.push({
      liveLink: proposal.finalSubmission.liveLink,
      githubLink: proposal.finalSubmission.githubLink,
      linkedinLink: proposal.finalSubmission.linkedinLink,
      submittedAt: proposal.finalSubmission.submittedAt,
      version: proposal.submissionHistory.length + 1,
      reviewerName: req.user.name,
      reviewerRole: 'Faculty',
      rejectionReason: reason.trim(),
      requiredCorrections: requiredCorrections.trim(),
      reviewedAt: new Date()
    });

    // Mark submission as rejected, reset status so student can re-upload
    proposal.finalSubmission.status = 'Rejected';
    proposal.finalSubmission.rejectionReason = reason.trim();
    proposal.status = 'Faculty Accepted'; // reset so student can re-submit
    await proposal.save();

    await Notification.create({
      userId: proposal.studentId._id, userModel: 'Student',
      message: `Your final submission for "${proposal.title}" was rejected by ${req.user.name}. Reason: ${reason.trim().substring(0, 80)}...`,
      type: 'rejection'
    });

    // Send rejection email
    const subject = `❌ Final Submission Rejected — "${proposal.title}"`;
    const html = emailTemplates.proposalRejected(proposal.studentId.name, proposal.title, `${reason.trim()}<br/><strong>Required Corrections:</strong> ${requiredCorrections.trim()}`);
    sendEmail(proposal.studentId.email, subject, html);

    console.log(`\x1b[31m[INFO]\x1b[0m Final submission rejected for: "${proposal.title}"`);
    res.status(200).json({ message: 'Submission rejected. Student can now re-submit.', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m rejectFinalSubmission:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── approveFinalSubmission ────────────────────────────────────────────────────
export const approveFinalSubmission = async (req, res) => {
  try {
    const proposal = await ProjectProposal.findOne({ _id: req.params.id, assignedFaculty: req.user._id })
      .populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Project not found or not assigned to you.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    if (proposal.status !== 'Submitted') {
      return res.status(400).json({ message: 'Project is not in Submitted state.' });
    }

    proposal.finalSubmission.status = 'Accepted';
    proposal.status = 'Submitted'; // Keeps Submitted (since it's finalized!)
    await proposal.save();

    // Create notifications
    await Notification.create({
      userId: proposal.studentId._id,
      userModel: 'Student',
      message: `🎉 Congratulations! Your final project submission for "${proposal.title}" has been accepted and approved by your Faculty supervisor.`,
      type: 'approval'
    });

    // Send completion email
    const subject = `🎉 Project Completion Approved — "${proposal.title}"`;
    const html = emailTemplates.projectCompletion(proposal.studentId.name, proposal.title, req.user.name);
    sendEmail(proposal.studentId.email, subject, html);

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Final submission approved by Faculty for ${proposal.title}`);
    res.status(200).json({ message: 'Final submission approved successfully.', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m approveFinalSubmission:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim().length < 5) return res.status(400).json({ message: 'Feedback message must be at least 5 characters' });
    const proposal = await ProjectProposal.findOne({ _id: req.params.id, assignedFaculty: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'Proposal not found or you are not the assigned faculty' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    proposal.facultyFeedback.push({ message: message.trim(), addedBy: req.user._id, addedAt: new Date() });
    await proposal.save();
    await Notification.create({ userId: proposal.studentId, userModel: 'Student', message: `New feedback from your supervisor on "${proposal.title}": "${message.substring(0, 60)}..."`, type: 'feedback' });
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Feedback added to: "${proposal.title}"`);
    res.status(200).json({ message: 'Feedback added', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m addFeedback:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── updateProgress (kept for backward compat but no longer used in UI) ────────
export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress < 0 || progress > 100) return res.status(400).json({ message: 'Progress must be 0–100' });
    const proposal = await ProjectProposal.findOneAndUpdate(
      { _id: req.params.id, assignedFaculty: req.user._id },
      { progress },
      { new: true }
    );
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.status(200).json({ message: 'Progress updated', proposal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── assignDeadline ────────────────────────────────────────────────────────────
export const assignDeadline = async (req, res) => {
  try {
    const { title, description, dueDate, targetProjects } = req.body;
    const validProjects = await ProjectProposal.find({
      _id: { $in: targetProjects },
      assignedFaculty: req.user._id
    });
    if (validProjects.length !== targetProjects.length) {
      return res.status(403).json({ message: 'You can only assign deadlines to projects you supervise.' });
    }
    const approvedProjects = validProjects.filter(p => p.finalSubmission?.status === 'Accepted');
    if (approvedProjects.length > 0) {
      return res.status(400).json({ message: `Cannot assign deadlines to approved/completed projects: "${approvedProjects.map(p => p.title).join(', ')}".` });
    }
    const deadline = await Deadline.create({
      title, description, dueDate,
      targetRoles: [],
      targetProjects,
      createdBy: req.user._id,
      createdModel: 'Faculty',
      isActive: true,
    });
    const studentIds = validProjects.map(p => p.studentId);
    const notifications = studentIds.map(userId => ({
      userId, userModel: 'Student',
      message: `New targeted deadline from your supervisor: "${title}" — Due ${new Date(dueDate).toLocaleDateString()}`,
      type: 'deadline'
    }));
    await Notification.insertMany(notifications);
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Faculty ${req.user.email} assigned deadline "${title}" to ${targetProjects.length} projects`);
    res.status(201).json({ message: 'Targeted deadline assigned successfully', deadline });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m assignDeadline:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const commentTimelineUpdate = async (req, res) => {
  try {
    const { comment } = req.body;
    const { proposalId, timelineId } = req.params;

    const proposal = await ProjectProposal.findOne({ _id: proposalId, assignedFaculty: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'Project not found or not assigned to you.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }

    const item = proposal.timeline.id(timelineId);
    if (!item) return res.status(404).json({ message: 'Timeline entry not found.' });

    item.facultyComment = comment || '';
    await proposal.save();

    await Notification.create({
      userId: proposal.studentId,
      userModel: 'Student',
      message: `Supervisor commented on your progress update: "${comment.substring(0, 40)}..."`,
      type: 'general'
    });

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Supervisor commented on timeline item: ${timelineId}`);
    res.status(200).json({ message: 'Comment added successfully.', proposal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveExtensionRequest = async (req, res) => {
  try {
    const { status, remarks } = req.body; // status: 'Approved' or 'Rejected'
    const { requestId } = req.params;

    const request = await ExtensionRequest.findById(requestId).populate('projectId');
    if (!request) return res.status(404).json({ message: 'Extension request not found.' });
    if (request.projectId?.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }

    // Validate supervisor authority (allow HOD/Admin as well)
    const isSupervisor = request.projectId.assignedFaculty.toString() === req.user._id.toString();
    const isHodOrAdmin = req.user.role === 'hod' || req.user.role === 'admin';

    if (!isSupervisor && !isHodOrAdmin) {
      return res.status(403).json({ message: 'You are not authorized to resolve this request.' });
    }

    request.status = status;
    request.remarks = remarks || '';
    request.reviewedBy = req.user._id;
    request.reviewedModel = req.user.role === 'hod' ? 'Hod' : 'Faculty';
    request.reviewedAt = new Date();
    await request.save();

    if (status === 'Approved') {
      const proposal = await ProjectProposal.findById(request.projectId._id);
      
      // Update extendedDeadlines array
      const existingIdx = proposal.extendedDeadlines.findIndex(
        ed => ed.deadlineId.toString() === request.deadlineId.toString()
      );

      if (existingIdx > -1) {
        proposal.extendedDeadlines[existingIdx].extendedDate = request.requestedDate;
      } else {
        proposal.extendedDeadlines.push({
          deadlineId: request.deadlineId,
          extendedDate: request.requestedDate
        });
      }
      await proposal.save();
    }

    // Send in-app notification to the student
    await Notification.create({
      userId: request.studentId,
      userModel: 'Student',
      message: `Your deadline extension request was ${status.toLowerCase()} by your supervisor.`,
      type: 'general'
    });

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Extension request ${requestId} marked as ${status}`);
    res.status(200).json({ message: `Extension request ${status.toLowerCase()} successfully.`, request });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m resolveExtensionRequest:', error.message);
    res.status(500).json({ message: error.message });
  }
};
