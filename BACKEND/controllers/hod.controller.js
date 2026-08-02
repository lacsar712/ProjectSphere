import { ProjectProposal } from '../models/Proposal.model.js';
import { Faculty } from '../models/Faculty.model.js';
import { Student } from '../models/Student.model.js';
import { Hod } from '../models/Hod.model.js';
import { Notification } from '../models/Notification.model.js';
import { Deadline } from '../models/Deadline.model.js';
import { FileSubmission } from '../models/File.model.js';
import { sendEmail } from '../config/nodemailer.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import { toPublicUrl, UPLOAD_ROOT } from '../utils/localFiles.js';
import path from 'path';
import bcrypt from 'bcrypt';
import ExcelJS from 'exceljs';


export const getHodDashboard = async (req, res) => {
  try {
    if (!req.user.department) {
      console.error('\x1b[31m[ERROR]\x1b[0m getHodDashboard: HOD has no department configured:', req.user.email);
      return res.status(400).json({ message: 'HOD department is not configured. Please contact the administrator.' });
    }

    const dept = req.user.department;
    console.log(`\x1b[36m[HOD]\x1b[0m Dashboard fetch for department: "${dept}"`);

    const unapprovedFaculty = await Faculty.find({ isApproved: false, isEmailVerified: true, department: dept });
    const pendingProposals = await ProjectProposal.find({ status: 'Pending HOD Review', department: dept })
      .populate('studentId', 'name email branch course year section');
    
    const approvedNeedingAssignment = await ProjectProposal.find({
      status: { $in: ['HOD Approved', 'Rejected (Faculty)', 'Pending Faculty Assignment'] },
      department: dept
    }).populate('studentId', 'name email branch course year section');

    // Class-wise breakdown
    const students = await Student.find({ branch: dept }).select('name branch year section course email mobileNumber createdAt');
    const branchStats = students.reduce((acc, s) => {
      acc[s.branch] = (acc[s.branch] || 0) + 1; return acc;
    }, {});

    const stats = {
      totalStudents: students.length,
      totalFaculty: await Faculty.countDocuments({ isApproved: true, department: dept }),
      activeProjects: await ProjectProposal.countDocuments({ status: { $in: ['Faculty Accepted', 'Submitted'] }, department: dept }),
      pendingReview: pendingProposals.length,
      branchStats,
    };

    // Recent activity — last 10 proposals sorted by updatedAt
    const recentActivity = await ProjectProposal.find({ department: dept })
      .sort({ updatedAt: -1 }).limit(10)
      .populate('studentId', 'name branch');

    console.log(`\x1b[36m[HOD]\x1b[0m Dashboard | Dept: ${dept} | Pending Faculty: ${unapprovedFaculty.length} | Pending Props: ${pendingProposals.length} | Assign Needed: ${approvedNeedingAssignment.length} | Students: ${students.length}`);
    res.status(200).json({ profile: req.user, unapprovedFaculty, pendingProposals, approvedNeedingAssignment, stats, recentActivity });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getHodDashboard:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { department: req.user.department };

    if (status && status !== 'all') {
      if (status === 'pending') {
        filter.status = 'Pending HOD Review';
      } else if (status === 'approved') {
        filter.status = { $in: ['HOD Approved', 'Faculty Assigned', 'Faculty Accepted', 'Submitted'] };
      } else if (status === 'rejected') {
        filter.status = { $in: ['Rejected (HOD)', 'Rejected (Faculty)'] };
      } else if (status === 'faculty_assigned') {
        filter.status = { $in: ['Faculty Assigned', 'Faculty Accepted'] };
      } else if (status === 'deadline_near') {
        const now = new Date();
        const tenDaysFromNow = new Date();
        tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

        // Find active deadlines that are due in the next 10 days
        const nearDeadlines = await Deadline.find({
          isActive: true,
          dueDate: { $gte: now, $lte: tenDaysFromNow }
        });

        const globalDeadlines = nearDeadlines.filter(d => d.targetRoles.includes('student') || d.targetRoles.includes('all'));
        const targetedProjectIds = nearDeadlines.flatMap(d => d.targetProjects || []);

        if (globalDeadlines.length > 0) {
          filter.status = { $in: ['Faculty Assigned', 'Faculty Accepted', 'Submitted'] };
        } else {
          filter._id = { $in: targetedProjectIds };
        }
      } else {
        filter.status = status;
      }
    }

    const projects = await ProjectProposal.find(filter)
      .populate('studentId', 'name email branch course year section')
      .populate('assignedFaculty', 'name email department designation')
      .sort({ updatedAt: -1 });

    const projectsWithFiles = await Promise.all(projects.map(async (p) => {
      const files = await FileSubmission.find({ projectId: p._id }).sort({ createdAt: -1 });
      return {
        ...p.toObject(),
        uploadedFiles: files
      };
    }));

    res.status(200).json(projectsWithFiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { year, section, search } = req.query;
    let filter = { branch: req.user.department };
    if (year) filter.year = year;
    if (section) filter.section = section;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const students = await Student.find(filter).select('-password -otpHash -refreshToken').sort({ name: 1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFacultyWorkload = async (req, res) => {
  try {
    const faculty = await Faculty.find({ isApproved: true, department: req.user.department }).select('name email department designation maxStudents');
    const workload = await Promise.all(faculty.map(async (f) => {
      const activeProjects = await ProjectProposal.find({ assignedFaculty: f._id, status: { $in: ['Faculty Assigned', 'Faculty Accepted', 'Submitted'] } });
      const projectCount = activeProjects.length;
      const studentCount = activeProjects.reduce((sum, p) => sum + 1 + (p.teamMembers?.length || 0), 0);
      const capacity = f.maxStudents || 60;
      return {
        ...f.toObject(),
        projectCount,
        studentCount,
        capacity,
        availableSlots: capacity - studentCount
      };
    }));
    res.status(200).json(workload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    await Notification.create({ userId: faculty._id, userModel: 'Faculty', message: 'Your faculty account has been approved by HOD. You can now log in.', type: 'approval' });
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Faculty approved: ${faculty.email}`);
    res.status(200).json({ message: 'Faculty approved successfully', faculty });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m approveFaculty:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const rejectFaculty = async (req, res) => {
  try {
    const { reason } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, { isApproved: false, rejectionReason: reason }, { new: true });
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    console.log(`\x1b[33m[WARN]\x1b[0m Faculty rejected: ${faculty.email}`);
    res.status(200).json({ message: 'Faculty rejected', faculty });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m rejectFaculty:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getApprovedFacultyList = async (req, res) => {
  try {
    const faculty = await Faculty.find({ isApproved: true, department: req.user.department }).select('name email department designation maxStudents');
    const workload = await Promise.all(faculty.map(async (f) => {
      const activeProjects = await ProjectProposal.find({ assignedFaculty: f._id, status: { $in: ['Faculty Assigned', 'Faculty Accepted', 'Submitted'] } });
      const studentCount = activeProjects.reduce((sum, p) => sum + 1 + (p.teamMembers?.length || 0), 0);
      const capacity = f.maxStudents || 60;
      return {
        ...f.toObject(),
        projectCount: activeProjects.length,
        studentCount,
        capacity,
        availableSlots: capacity - studentCount
      };
    }));
    res.status(200).json(workload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveProposal = async (req, res) => {
  try {
    const { facultyId } = req.body;
    const proposal = await ProjectProposal.findById(req.params.id).populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    let updatedStatus = 'Pending Faculty Assignment';
    let assignedFaculty = undefined;

    if (facultyId) {
      const faculty = await Faculty.findById(facultyId);
      if (!faculty || !faculty.isApproved) return res.status(400).json({ message: 'Invalid or unapproved faculty selected.' });

      // Capacity Check
      const activeProps = await ProjectProposal.find({ assignedFaculty: facultyId, status: { $in: ['Faculty Assigned', 'Faculty Accepted', 'Submitted'] } });
      const currentStudentCount = activeProps.reduce((sum, p) => sum + 1 + (p.teamMembers?.length || 0), 0);
      const incomingStudentCount = 1 + (proposal.teamMembers?.length || 0);

      if (currentStudentCount + incomingStudentCount > 60) {
        return res.status(400).json({ message: `Cannot assign: Faculty member has reached the limit of 60 students. Current: ${currentStudentCount}, Available: ${60 - currentStudentCount}, This project requires: ${incomingStudentCount} slots.` });
      }

      updatedStatus = 'Faculty Assigned';
      assignedFaculty = facultyId;
    }

    proposal.status = updatedStatus;
    if (assignedFaculty) proposal.assignedFaculty = assignedFaculty;
    proposal.hodReview = { action: 'Approved', reviewedAt: Date.now(), reviewedBy: req.user._id };
    await proposal.save();

    if (assignedFaculty) {
      const faculty = await Faculty.findById(facultyId);
      await Notification.create({ userId: proposal.studentId._id, userModel: 'Student', message: `Your project "${proposal.title}" has been approved by HOD and Faculty supervisor "${faculty.name}" has been assigned.`, type: 'approval' });
      await Notification.create({ userId: facultyId, userModel: 'Faculty', message: `You have been assigned to supervise "${proposal.title}".`, type: 'assignment' });

      // Send email to Faculty (Faculty Assigned)
      sendEmail(faculty.email, `👨‍🏫 New Supervised Project Assigned — "${proposal.title}"`, emailTemplates.facultyAssigned(faculty.name, proposal.title, proposal.studentId.name));
    } else {
      await Notification.create({ userId: proposal.studentId._id, userModel: 'Student', message: `Your project "${proposal.title}" has been approved by HOD. Faculty supervisor will be assigned shortly.`, type: 'approval' });
    }

    // Send email to Student (Proposal Approved)
    sendEmail(proposal.studentId.email, `✅ Proposal Approved — "${proposal.title}"`, emailTemplates.proposalApproved(proposal.studentId.name, proposal.title));

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Proposal approved by HOD: ${proposal.title}`);
    res.status(200).json({ message: assignedFaculty ? 'Proposal approved & Faculty assigned.' : 'Proposal approved by HOD. Now assign a faculty member.', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m approveProposal:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const rejectProposal = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.length < 20) return res.status(400).json({ message: 'Reason must be at least 20 chars' });
    const proposal = await ProjectProposal.findByIdAndUpdate(req.params.id, {
      status: 'Rejected (HOD)',
      hodReview: { action: 'Rejected', comment: reason, reviewedAt: Date.now(), reviewedBy: req.user._id }
    }, { new: true }).populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    
    await Notification.create({ userId: proposal.studentId._id, userModel: 'Student', message: `Your project "${proposal.title}" was rejected by HOD. Reason: ${reason}`, type: 'rejection' });
    
    // Send email to Student (Proposal Rejected)
    sendEmail(proposal.studentId.email, `❌ Proposal Revision Required — "${proposal.title}"`, emailTemplates.proposalRejected(proposal.studentId.name, proposal.title, reason));

    console.log(`\x1b[31m[INFO]\x1b[0m Proposal rejected: ${proposal.title}`);
    res.status(200).json({ message: 'Proposal rejected by HOD', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m rejectProposal:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const assignFacultyToProposal = async (req, res) => {
  try {
    const { facultyId } = req.body;
    const proposal = await ProjectProposal.findById(req.params.id).populate('studentId', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }

    if (proposal.status !== 'HOD Approved' && proposal.status !== 'Rejected (Faculty)' && proposal.status !== 'Pending Faculty Assignment') {
      return res.status(400).json({ message: 'Proposal must be approved by HOD before assigning faculty.' });
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty || !faculty.isApproved) return res.status(400).json({ message: 'Invalid or unapproved faculty selected.' });

    // Capacity Check
    const activeProps = await ProjectProposal.find({ assignedFaculty: facultyId, status: { $in: ['Faculty Assigned', 'Faculty Accepted', 'Submitted'] } });
    const currentStudentCount = activeProps.reduce((sum, p) => sum + 1 + (p.teamMembers?.length || 0), 0);
    const incomingStudentCount = 1 + (proposal.teamMembers?.length || 0);

    if (currentStudentCount + incomingStudentCount > 60) {
      return res.status(400).json({ message: `Cannot assign: Faculty member has reached the limit of 60 students. Current: ${currentStudentCount}, Available: ${60 - currentStudentCount}, This project requires: ${incomingStudentCount} slots.` });
    }

    proposal.assignedFaculty = facultyId;
    proposal.status = 'Faculty Assigned';
    await proposal.save();

    await Notification.create({ userId: proposal.studentId._id, userModel: 'Student', message: `Faculty "${faculty.name}" has been assigned to your project "${proposal.title}".`, type: 'assignment' });
    await Notification.create({ userId: facultyId, userModel: 'Faculty', message: `You have been assigned to supervise "${proposal.title}".`, type: 'assignment' });

    // Send email to Faculty (Faculty Assigned)
    sendEmail(faculty.email, `👨‍🏫 New Supervised Project Assigned — "${proposal.title}"`, emailTemplates.facultyAssigned(faculty.name, proposal.title, proposal.studentId.name));

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Faculty assigned: ${faculty.name} → "${proposal.title}"`);
    res.status(200).json({ message: 'Faculty assigned successfully', proposal });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m assignFacultyToProposal:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const { name, email, password, mobileNumber, course, branch, year, section } = req.body;
    const userExists = await Student.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePhoto = {};
    if (req.file) {
      profilePhoto = {
        url: toPublicUrl(req.file),
        publicId: path.relative(UPLOAD_ROOT, req.file.path).replace(/\\/g, '/'),
      };
    }

    const student = await Student.create({
      name, email, password: hashedPassword,
      mobileNumber, course, branch, year, section,
      role: 'student', isEmailVerified: true, profilePhoto
    });
    
    console.log(`\x1b[32m[SUCCESS]\x1b[0m HOD added Student: ${email}`);
    res.status(201).json({ message: 'Student created verified successfully.', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFaculty = async (req, res) => {
  try {
    const { name, email, password, mobileNumber, department, designation, employeeId } = req.body;
    const userExists = await Faculty.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePhoto = {};
    if (req.file) {
      profilePhoto = {
        url: toPublicUrl(req.file),
        publicId: path.relative(UPLOAD_ROOT, req.file.path).replace(/\\/g, '/'),
      };
    }

    const faculty = await Faculty.create({
      name, email, password: hashedPassword,
      mobileNumber, department, designation, employeeId,
      role: 'faculty', isEmailVerified: true, isApproved: true, profilePhoto
    });
    
    console.log(`\x1b[32m[SUCCESS]\x1b[0m HOD added Faculty: ${email}`);
    res.status(201).json({ message: 'Faculty created verified successfully.', faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleStudentBan = async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isBanned, banReason: isBanned ? banReason : '' },
      { new: true }
    ).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    console.log(`\x1b[33m[WARN]\x1b[0m Student Ban toggled to ${isBanned} for ${student.email}`);
    res.status(200).json({ message: `Student access ${isBanned ? 'revoked' : 'restored'}.`, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportProjectsExcel = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { department: req.user.department };
    if (status && status !== 'all') filter.status = status;
    const projects = await ProjectProposal.find(filter)
      .populate('studentId', 'name email branch course year section mobileNumber')
      .sort({ updatedAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projects');

    // Define columns
    worksheet.columns = [
      { header: 'Project Title', key: 'title', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Leader Name', key: 'leaderName', width: 20 },
      { header: 'Mobile', key: 'mobileNumber', width: 15 },
      { header: 'Course', key: 'course', width: 10 },
      { header: 'Branch', key: 'branch', width: 10 },
      { header: 'Section', key: 'section', width: 10 },
      { header: "Members' Name", key: 'members', width: 30 },
      { header: 'Project Submitted', key: 'submitted', width: 20 }
    ];

    projects.forEach((p) => {
      worksheet.addRow({
        title: p.title,
        department: p.department,
        status: p.status,
        leaderName: p.studentId?.name || 'N/A',
        mobileNumber: p.studentId?.mobileNumber || 'N/A',
        course: p.studentId?.course || 'N/A',
        branch: p.studentId?.branch || 'N/A',
        section: p.studentId?.section || 'N/A',
        members: p.teamMembers?.map(m => m.name).join(', ') || 'None',
        submitted: p.finalSubmission?.status || 'Not Submitted'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=projects-export-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m exportProjectsExcel:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectSubmission = async (req, res) => {
  try {
    const { status, rejectionReason, reason, requiredCorrections } = req.body;
    const rejectReason = rejectionReason || reason;
    const proposal = await ProjectProposal.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('assignedFaculty', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Project not found' });
    if (proposal.finalSubmission?.status === 'Accepted') {
      return res.status(400).json({ message: 'Project is already approved and completed. No further updates are allowed.' });
    }
    
    // Safety check: ensure it has finalSubmission initialized
    if (!proposal.finalSubmission) {
      proposal.finalSubmission = { status: 'Not Submitted' };
    }

    if (status === 'Under Faculty Review') {
      proposal.finalSubmission.status = 'Under Faculty Review';
      await proposal.save();

      if (proposal.assignedFaculty) {
        await Notification.create({
          userId: proposal.assignedFaculty._id,
          userModel: 'Faculty',
          message: `Project final submission for "${proposal.title}" has been approved by HOD and is now awaiting your Faculty Review.`,
          type: 'submission'
        });
      }

      await Notification.create({
        userId: proposal.studentId._id,
        userModel: 'Student',
        message: `Your project final submission has passed HOD review and is now under Faculty Review.`,
        type: 'general'
      });

      console.log(`\x1b[32m[SUCCESS]\x1b[0m HOD approved final submission for ${proposal.title}, forwarded to Faculty.`);
      return res.status(200).json({ message: 'Submission approved by HOD and forwarded to Faculty review.', proposal });
    } else if (status === 'Rejected') {
      if (!rejectReason || rejectReason.trim().length < 20) {
        return res.status(400).json({ message: 'Rejection reason must be at least 20 characters.' });
      }
      if (!requiredCorrections || requiredCorrections.trim().length < 20) {
        return res.status(400).json({ message: 'Required corrections must be at least 20 characters.' });
      }

      // Record history
      proposal.submissionHistory.push({
        liveLink: proposal.finalSubmission.liveLink,
        githubLink: proposal.finalSubmission.githubLink,
        linkedinLink: proposal.finalSubmission.linkedinLink,
        submittedAt: proposal.finalSubmission.submittedAt,
        version: proposal.submissionHistory.length + 1,
        reviewerName: req.user.name,
        reviewerRole: 'HOD',
        rejectionReason: rejectReason.trim(),
        requiredCorrections: requiredCorrections.trim(),
        reviewedAt: new Date()
      });

      proposal.finalSubmission.status = 'Rejected';
      proposal.finalSubmission.rejectionReason = rejectReason.trim();
      proposal.status = 'Faculty Accepted'; // Reopens upload section
      await proposal.save();

      await Notification.create({
        userId: proposal.studentId._id,
        userModel: 'Student',
        message: `Your final submission was rejected by HOD. Reason: ${rejectReason.trim().substring(0, 60)}...`,
        type: 'rejection'
      });

      // Send rejection email to student
      const subject = `❌ Project Final Submission Rejected by HOD — "${proposal.title}"`;
      const html = emailTemplates.proposalRejected(proposal.studentId.name, proposal.title, `${rejectReason.trim()}<br/><strong>Required Corrections:</strong> ${requiredCorrections.trim()}`);
      sendEmail(proposal.studentId.email, subject, html);

      console.log(`\x1b[31m[INFO]\x1b[0m Final submission rejected by HOD for ${proposal.title}`);
      return res.status(200).json({ message: 'Submission rejected by HOD. Student notified to re-submit.', proposal });
    } else {
      return res.status(400).json({ message: 'Invalid final submission status change.' });
    }
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m updateProjectSubmission:', error.message);
    res.status(500).json({ message: error.message });
  }
};
