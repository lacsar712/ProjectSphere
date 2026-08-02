import { ProjectProposal } from '../models/Proposal.model.js';
import { Student } from '../models/Student.model.js';
import { Faculty } from '../models/Faculty.model.js';
import { FileSubmission } from '../models/File.model.js';
import { Deadline } from '../models/Deadline.model.js';
import { Notification } from '../models/Notification.model.js';
import { ExtensionRequest } from '../models/ExtensionRequest.model.js';
import { Hod } from '../models/Hod.model.js';
import { Announcement } from '../models/Announcement.model.js';
import path from 'path';
import { toPublicUrl, deleteLocalFile, UPLOAD_ROOT } from '../utils/localFiles.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id })
      .populate('assignedFaculty', 'name email department designation');

    // Merge: global role-based deadlines + faculty-targeted project deadlines
    const globalDeadlines = await Deadline.find({
      isActive: true,
      $or: [{ targetRoles: 'all' }, { targetRoles: 'student' }]
    }).sort({ dueDate: 1 });

    let projectDeadlines = [];
    if (proposal) {
      projectDeadlines = await Deadline.find({
        isActive: true,
        targetProjects: proposal._id
      }).sort({ dueDate: 1 });
    }

    // Merge and deduplicate deadlines by _id
    const seen = new Set();
    const deadlines = [...globalDeadlines, ...projectDeadlines]
      .filter(d => {
        // Enforce faculty-created deadline visibility restriction
        if (d.createdModel === 'Faculty') {
          if (!proposal || !proposal.assignedFaculty) return false;
          return d.createdBy.toString() === proposal.assignedFaculty._id.toString();
        }
        return true;
      })
      .filter(d => { const key = d._id.toString(); if (seen.has(key)) return false; seen.add(key); return true; })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 10);

    let submissions = [];
    if (proposal) {
      submissions = await FileSubmission.find({ projectId: proposal._id }).sort({ createdAt: -1 });
    }
    const { notifications, unreadCount } = await getNotificationsForUser(req.user._id);

    // Fetch announcements from creator belonging to same department or creator is admin
    const studentBranch = req.user.branch;
    const [hods, faculty] = await Promise.all([
      Hod.find({ department: studentBranch }).distinct('_id'),
      Faculty.find({ department: studentBranch }).distinct('_id')
    ]);
    const deptCreatorIds = [...hods, ...faculty];
    const announcementsList = await Announcement.find({
      targetAudience: { $in: ['all', 'student'] },
      $or: [
        { createdByRole: 'admin' },
        { createdBy: { $in: deptCreatorIds } }
      ]
    }).sort({ pinned: -1, createdAt: -1 });

    const announcements = announcementsList
      .filter(a => {
        if (a.createdModel === 'Faculty') {
          if (!proposal || !proposal.assignedFaculty) return false;
          return a.createdBy.toString() === proposal.assignedFaculty._id.toString();
        }
        return true;
      })
      .slice(0, 10);

    console.log(`\x1b[36m[STUDENT]\x1b[0m Dashboard loaded for: ${req.user.email}`);
    res.status(200).json({ profile: req.user, proposal, submissions, deadlines, notifications, unreadCount, announcements });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getStudentDashboard:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getNotificationsForUser = async (userId) => {
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(10);
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return { notifications, unreadCount };
};

export const submitProposal = async (req, res) => {
  try {
    const { title, description, domain, teamSize, teamMembers, referenceLinks, projectType } = req.body;
    const existingProposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (existingProposal) return res.status(400).json({ message: 'Proposal already exists. You can only update it.' });

    // Validate team size (max 4 members total including the leader)
    const membersList = teamMembers || [];
    const totalTeamSize = 1 + membersList.length;
    if (totalTeamSize > 4) {
      return res.status(400).json({ message: 'A team can have a maximum of 4 members including the leader.' });
    }
    if (totalTeamSize < 1) {
      return res.status(400).json({ message: 'A team must have at least 1 member.' });
    }

    // Check if leader is already a member of another active proposal
    const leaderActiveMember = await ProjectProposal.findOne({
      'teamMembers.email': req.user.email,
      status: { $nin: ['Rejected (HOD)', 'Rejected (Faculty)'] }
    });
    if (leaderActiveMember) {
      return res.status(400).json({ message: `You are already a team member of another active project: "${leaderActiveMember.title}".` });
    }

    // Check team members uniqueness
    const emails = membersList.map(m => m.email.toLowerCase().trim());
    if (emails.includes(req.user.email.toLowerCase().trim())) {
      return res.status(400).json({ message: 'You cannot add yourself (the leader) as a team member.' });
    }
    const uniqueEmails = [...new Set(emails)];
    if (uniqueEmails.length !== emails.length) {
      return res.status(400).json({ message: 'Duplicate team members are not allowed.' });
    }

    for (const email of emails) {
      const studentUser = await Student.findOne({ email });
      if (studentUser) {
        const activeLeader = await ProjectProposal.findOne({
          studentId: studentUser._id,
          status: { $nin: ['Rejected (HOD)', 'Rejected (Faculty)'] }
        });
        if (activeLeader) {
          return res.status(400).json({ message: `Student with email ${email} is already the leader of another active project: "${activeLeader.title}".` });
        }
      }
      const activeMember = await ProjectProposal.findOne({
        'teamMembers.email': email,
        status: { $nin: ['Rejected (HOD)', 'Rejected (Faculty)'] }
      });
      if (activeMember) {
        return res.status(400).json({ message: `Student with email ${email} is already a team member of another active project: "${activeMember.title}".` });
      }
    }

    const proposal = await ProjectProposal.create({
      studentId: req.user._id, title, description, domain: domain || '',
      department: req.user.branch,
      teamSize: totalTeamSize, teamMembers: membersList,
      referenceLinks: referenceLinks || [],
      projectType: projectType || 'Application'
    });
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Proposal submitted: "${title}" by ${req.user.email}`);
    res.status(201).json({ message: 'Project proposal submitted successfully', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m submitProposal:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateProposal = async (req, res) => {
  try {
    const { title, description, domain, teamSize, teamMembers, referenceLinks, projectType } = req.body;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'No proposal found' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    if (!['Rejected (HOD)', 'Rejected (Faculty)'].includes(proposal.status)) {
      return res.status(400).json({ message: 'You can only update a rejected proposal' });
    }

    // Validate team size (max 4 members total including the leader)
    const membersList = teamMembers || proposal.teamMembers;
    const totalTeamSize = 1 + membersList.length;
    if (totalTeamSize > 4) {
      return res.status(400).json({ message: 'A team can have a maximum of 4 members including the leader.' });
    }
    if (totalTeamSize < 1) {
      return res.status(400).json({ message: 'A team must have at least 1 member.' });
    }

    // Check if leader is already a member of another active proposal (excluding current proposal)
    const leaderActiveMember = await ProjectProposal.findOne({
      _id: { $ne: proposal._id },
      'teamMembers.email': req.user.email,
      status: { $nin: ['Rejected (HOD)', 'Rejected (Faculty)'] }
    });
    if (leaderActiveMember) {
      return res.status(400).json({ message: `You are already a team member of another active project: "${leaderActiveMember.title}".` });
    }

    // Check team members uniqueness
    const emails = membersList.map(m => m.email.toLowerCase().trim());
    if (emails.includes(req.user.email.toLowerCase().trim())) {
      return res.status(400).json({ message: 'You cannot add yourself (the leader) as a team member.' });
    }
    const uniqueEmails = [...new Set(emails)];
    if (uniqueEmails.length !== emails.length) {
      return res.status(400).json({ message: 'Duplicate team members are not allowed.' });
    }

    for (const email of emails) {
      const studentUser = await Student.findOne({ email });
      if (studentUser) {
        const activeLeader = await ProjectProposal.findOne({
          _id: { $ne: proposal._id },
          studentId: studentUser._id,
          status: { $nin: ['Rejected (HOD)', 'Rejected (Faculty)'] }
        });
        if (activeLeader) {
          return res.status(400).json({ message: `Student with email ${email} is already the leader of another active project: "${activeLeader.title}".` });
        }
      }
      const activeMember = await ProjectProposal.findOne({
        _id: { $ne: proposal._id },
        'teamMembers.email': email,
        status: { $nin: ['Rejected (HOD)', 'Rejected (Faculty)'] }
      });
      if (activeMember) {
        return res.status(400).json({ message: `Student with email ${email} is already a team member of another active project: "${activeMember.title}".` });
      }
    }

    proposal.title = title || proposal.title;
    proposal.description = description || proposal.description;
    if (domain !== undefined) proposal.domain = domain;
    proposal.department = req.user.branch; // always enforce strict department
    proposal.teamSize = totalTeamSize;
    if (teamMembers) proposal.teamMembers = teamMembers;
    proposal.referenceLinks = referenceLinks || proposal.referenceLinks;
    if (projectType !== undefined) proposal.projectType = projectType;
    proposal.status = 'Pending HOD Review';
    await proposal.save();
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Proposal resubmitted: "${proposal.title}"`);
    res.status(200).json({ message: 'Proposal updated and resubmitted for review', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m updateProposal:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const { fileType } = req.body;
    if (fileType === 'code') {
      return res.status(400).json({ message: 'ZIP file uploads are no longer supported.' });
    }
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(400).json({ message: 'Submit a proposal first before uploading.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    if (['Rejected (HOD)', 'Rejected (Faculty)'].includes(proposal.status)) {
      return res.status(400).json({ message: 'Cannot upload files for a rejected proposal.' });
    }
    if (proposal.progress < 100) {
      return res.status(400).json({ message: 'File submission portal is locked. Project progress must be 100% to upload files.' });
    }
    
    const submissions = [];
    for (const file of req.files) {
      const lastFile = await FileSubmission.findOne({ projectId: proposal._id, fileType }).sort({ version: -1 });
      const version = lastFile ? lastFile.version + 1 : 1;
      const fileSubmission = await FileSubmission.create({
        studentId: req.user._id, projectId: proposal._id, fileType,
        fileName: file.originalname,
        cloudinaryUrl: toPublicUrl(file),
        publicId: path.relative(UPLOAD_ROOT, file.path).replace(/\\/g, '/'),
        version
      });
      submissions.push(fileSubmission);
      console.log(`\x1b[32m[SUCCESS]\x1b[0m File uploaded: ${file.originalname} (${fileType}) v${version}`);
    }
    
    res.status(201).json({ message: 'Files uploaded successfully', files: submissions });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m uploadFile:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const submissions = await FileSubmission.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ files: submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({ isApproved: true, isEmailVerified: true, department: req.user.branch })
      .select('name email department designation specialization maxStudents');
    
    const facultyWithCounts = await Promise.all(faculty.map(async (f) => {
      const activeProjects = await ProjectProposal.find({
        assignedFaculty: f._id,
        status: { $in: ['Faculty Assigned', 'Faculty Accepted', 'Submitted'] }
      });
      const projectCount = activeProjects.length;
      const studentCount = activeProjects.reduce((sum, p) => sum + 1 + (p.teamMembers?.length || 0), 0);
      const capacity = f.maxStudents || 60;
      const availableSlots = capacity - studentCount;
      return {
        ...f.toObject(),
        activeProjectsCount: projectCount, // keep for backward compatibility
        projectCount,
        studentCount,
        capacity,
        availableSlots,
        isAvailable: studentCount < capacity
      };
    }));

    res.status(200).json({ faculty: facultyWithCounts });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getAvailableFaculty:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const requestSupervisor = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(400).json({ message: 'No proposal found.' });
    if (proposal.assignedFaculty) return res.status(400).json({ message: 'Supervisor already assigned.' });
    if (proposal.supervisorRequested) return res.status(400).json({ message: 'Supervisor request already pending.' });

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found.' });

    proposal.supervisorRequested = true;
    proposal.assignedFaculty = facultyId; // requested supervisor
    await proposal.save();

    await Notification.create({
      userId: facultyId,
      userModel: 'Faculty',
      message: `Student ${req.user.name} has requested you as a supervisor for "${proposal.title}".`,
      type: 'general'
    });

    res.status(200).json({ message: 'Supervisor requested successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectTargets = async (req, res) => {
  try {
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'No proposal found.' });
    res.status(200).json({ targets: proposal.targets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProjectTarget = async (req, res) => {
  try {
    const { title, description } = req.body;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'No proposal found.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    
    proposal.targets.push({ title, description });
    await proposal.save();
    res.status(201).json({ message: 'Target added successfully', targets: proposal.targets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectTarget = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { status } = req.body;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'No proposal found.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    
    const target = proposal.targets.id(targetId);
    if (!target) return res.status(404).json({ message: 'Target not found.' });

    target.status = status;
    await proposal.save();
    res.status(200).json({ message: 'Target updated', targets: proposal.targets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitFinalProject = async (req, res) => {
  try {
    const { liveLink, githubLink, linkedinLink } = req.body;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    
    if (!proposal) return res.status(404).json({ message: 'No proposal found.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    if (proposal.status !== 'Faculty Accepted') {
      return res.status(400).json({ message: 'Project must be active/accepted before final submission.' });
    }
    if (proposal.progress < 100) {
      return res.status(400).json({ message: 'Project progress must be 100% before final submission.' });
    }

    if (!liveLink || !githubLink || !linkedinLink) {
      return res.status(400).json({ message: 'All required links (Live Project Link, GitHub Repository Link, and LinkedIn Post Link) must be provided.' });
    }

    const files = await FileSubmission.find({ projectId: proposal._id });
    const hasReport = files.some(f => f.fileType === 'document');
    const hasPPT = files.some(f => f.fileType === 'presentation');

    if (!hasReport) return res.status(400).json({ message: 'Project Report File is missing. Please upload it first.' });
    if (!hasPPT) return res.status(400).json({ message: 'Project PPT File is missing. Please upload it first.' });

    if (proposal.projectType === 'Research Paper') {
      const hasPaper = files.some(f => f.fileType === 'paper');
      if (!hasPaper) return res.status(400).json({ message: 'Research Paper PDF is missing. Please upload it first.' });
    }

    proposal.finalSubmission = {
      liveLink,
      githubLink,
      linkedinLink,
      submittedAt: new Date(),
      status: 'Under HOD Review'
    };
    proposal.status = 'Submitted';
    await proposal.save();

    // Notify HOD
    const hod = await Hod.findOne({ department: proposal.department });
    if (hod) {
      await Notification.create({
        userId: hod._id,
        userModel: 'Hod',
        message: `Final project submission uploaded for "${proposal.title}" by ${req.user.name}. Awaiting HOD review.`,
        type: 'submission'
      });
    }

    res.status(200).json({ message: 'Final project submitted successfully', proposal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { githubId, linkedinId, portfolioLink } = req.body;
    let updateFields = { githubId, linkedinId, portfolioLink };

    if (req.file) {
      if (req.user.resume && req.user.resume.publicId) {
        deleteLocalFile(req.user.resume.publicId);
      }
      updateFields.resume = {
        url: toPublicUrl(req.file),
        publicId: path.relative(UPLOAD_ROOT, req.file.path).replace(/\\/g, '/'),
      };
    }

    const student = await Student.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ message: 'Profile updated successfully', profile: student });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m updateStudentProfile:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const addTimelineUpdate = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'No proposal found.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }

    // Enforce timeline push
    proposal.timeline.push({
      status,
      remarks: remarks || '',
      timestamp: new Date()
    });

    // Update progress percentage
    const progressMap = {
      'PROJECT STARTED': 20,
      'PROTOTYPE CREATED': 50,
      'REPORT PREPARED': 80,
      'PROJECT COMPLETE': 100,
      'PROJECT SUBMITTED': 100
    };
    if (progressMap[status]) {
      proposal.progress = progressMap[status];
    }

    await proposal.save();

    // In-app notifications for Faculty & HOD
    if (proposal.assignedFaculty) {
      await Notification.create({
        userId: proposal.assignedFaculty,
        userModel: 'Faculty',
        message: `Student "${req.user.name}" updated project progress timeline status to: "${status}".`,
        type: 'general'
      });
    }

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Timeline update logged: "${status}" for project: "${proposal.title}"`);
    res.status(200).json({ message: 'Timeline progress updated successfully.', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m addTimelineUpdate:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const requestDeadlineExtension = async (req, res) => {
  try {
    const { deadlineId, requestedDate, reason } = req.body;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'No proposal found.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }

    if (!reason || reason.trim().length < 20) {
      return res.status(400).json({ message: 'Reason must be at least 20 characters.' });
    }

    const documentUrl = req.file ? toPublicUrl(req.file) : '';

    const request = await ExtensionRequest.create({
      projectId: proposal._id,
      studentId: req.user._id,
      deadlineId,
      requestedDate,
      reason: reason.trim(),
      documentUrl
    });

    if (proposal.assignedFaculty) {
      await Notification.create({
        userId: proposal.assignedFaculty,
        userModel: 'Faculty',
        message: `Student "${req.user.name}" requested deadline extension for milestone.`,
        type: 'general'
      });
    }

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Extension request created by student: ${req.user.email}`);
    res.status(201).json({ message: 'Extension request submitted successfully.', request });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m requestDeadlineExtension:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getStudentExtensions = async (req, res) => {
  try {
    const requests = await ExtensionRequest.find({ studentId: req.user._id })
      .populate('deadlineId', 'title dueDate')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markDeadlineSubmitted = async (req, res) => {
  try {
    const { deadlineId } = req.params;
    const proposal = await ProjectProposal.findOne({ studentId: req.user._id });
    if (!proposal) return res.status(404).json({ message: 'No proposal found.' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }

    const deadline = await Deadline.findById(deadlineId);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found.' });

    // Determine final due date (with extensions)
    const extMatch = proposal.extendedDeadlines?.find(ed => ed.deadlineId.toString() === deadlineId);
    const finalDueDate = extMatch ? new Date(extMatch.extendedDate) : new Date(deadline.dueDate);
    const now = new Date();

    const status = now <= finalDueDate ? 'Submitted' : 'Late Submission';

    const existingIdx = proposal.deadlineSubmissions.findIndex(ds => ds.deadlineId.toString() === deadlineId);
    if (existingIdx > -1) {
      proposal.deadlineSubmissions[existingIdx].status = status;
      proposal.deadlineSubmissions[existingIdx].submittedAt = now;
    } else {
      proposal.deadlineSubmissions.push({
        deadlineId,
        status,
        submittedAt: now
      });
    }

    await proposal.save();
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Student ${req.user.email} marked deadline ${deadlineId} as ${status}`);
    res.status(200).json({ message: `Deadline marked as ${status.toLowerCase()} successfully.`, proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m markDeadlineSubmitted:', error.message);
    res.status(500).json({ message: error.message });
  }
};
