import { Student } from '../models/Student.model.js';
import { Faculty } from '../models/Faculty.model.js';
import { Hod } from '../models/Hod.model.js';
import { Admin } from '../models/Admin.model.js';
import { ProjectProposal } from '../models/Proposal.model.js';
import { FileSubmission } from '../models/File.model.js';
import { Announcement } from '../models/Announcement.model.js';

// ─── GET /admin/dashboard (legacy — kept for compatibility) ───────────────────
export const getAdminDashboard = async (req, res) => {
  try {
    const stats = await buildStats();
    const recentLogins  = await Student.find().sort({ updatedAt: -1 }).limit(5).select('name role email updatedAt');
    const recentUploads = await FileSubmission.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'name');
    const usersList     = await Student.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ stats, recentLogins, recentUploads, usersList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /admin/stats ─────────────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
  try {
    res.status(200).json(await buildStats());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function buildStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    totalFaculty,
    totalProposals,
    totalFiles,
    pendingHOD,
    hodApproved,
    facultyAssigned,
    active,
    submitted,
    rejectedHOD,
    rejectedFaculty,
    newRequests,
    totalAnnouncements,
    branchStats,
  ] = await Promise.all([
    Student.countDocuments(),
    Faculty.countDocuments(),
    ProjectProposal.countDocuments(),
    FileSubmission.countDocuments(),
    ProjectProposal.countDocuments({ status: 'Pending HOD Review' }),
    ProjectProposal.countDocuments({ status: 'HOD Approved' }),
    ProjectProposal.countDocuments({ status: 'Faculty Assigned' }),
    ProjectProposal.countDocuments({ status: 'Faculty Accepted' }),
    ProjectProposal.countDocuments({ status: 'Submitted' }),
    ProjectProposal.countDocuments({ status: 'Rejected (HOD)' }),
    ProjectProposal.countDocuments({ status: 'Rejected (Faculty)' }),
    ProjectProposal.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Announcement.countDocuments(),
    Student.aggregate([{ $group: { _id: '$branch', count: { $sum: 1 } } }]),
  ]);

  return {
    totalStudents,
    totalFaculty,
    totalProposals,
    totalFiles,
    pendingHOD,
    hodApproved,
    facultyAssigned,
    active,
    submitted,
    rejectedHOD,
    rejectedFaculty,
    newRequests,
    totalAnnouncements,
    branchStats,
  };
}

// ─── GET /admin/students ──────────────────────────────────────────────────────
export const getAllStudents = async (req, res) => {
  try {
    const { branch, year, section, search } = req.query;
    const filter = {};
    if (branch)  filter.branch  = branch;
    if (year)    filter.year    = year;
    if (section) filter.section = section;
    if (search)  filter.name    = { $regex: search, $options: 'i' };

    const students = await Student.find(filter)
      .select('-otpHash -refreshToken')
      .sort({ name: 1 });

    // For each student, fetch their proposal + files
    const enriched = await Promise.all(
      students.map(async (s) => {
        const proposal = await ProjectProposal.findOne({ studentId: s._id })
          .populate('assignedFaculty', 'name email department');
        let files = [];
        if (proposal) {
          files = await FileSubmission.find({ projectId: proposal._id })
            .sort({ createdAt: -1 });
        }
        return { ...s.toObject(), proposal: proposal || null, files };
      })
    );

    console.log(`\x1b[36m[ADMIN]\x1b[0m getAllStudents → ${students.length} results`);
    res.status(200).json({ students: enriched });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getAllStudents:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /admin/faculty ───────────────────────────────────────────────────────
export const getAllFaculty = async (req, res) => {
  try {
    const { department, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (search)     filter.name       = { $regex: search, $options: 'i' };

    const faculty = await Faculty.find(filter)
      .select('-otpHash -refreshToken')
      .sort({ name: 1 });

    const enriched = await Promise.all(
      faculty.map(async (f) => {
        const projects = await ProjectProposal.find({ assignedFaculty: f._id })
          .populate('studentId', 'name email branch course year section')
          .sort({ updatedAt: -1 });
        return { ...f.toObject(), projects };
      })
    );

    console.log(`\x1b[36m[ADMIN]\x1b[0m getAllFaculty → ${faculty.length} results`);
    res.status(200).json({ faculty: enriched });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getAllFaculty:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /admin/projects/full ─────────────────────────────────────────────────
export const getAllProjectsFull = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};

    const projects = await ProjectProposal.find(filter)
      .populate('studentId',      'name email branch course year section mobileNumber profilePhoto')
      .populate('assignedFaculty', 'name email department designation')
      .sort({ updatedAt: -1 });

    // Attach files for each project
    const enriched = await Promise.all(
      projects.map(async (p) => {
        const files = await FileSubmission.find({ projectId: p._id }).sort({ createdAt: -1 });
        return { ...p.toObject(), files };
      })
    );

    res.status(200).json({ projects: enriched });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getAllProjectsFull:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /admin/system ──────────────────────────────────────────────────────
export const getSystemInfo = async (req, res) => {
  try {
    const [recentLogins, recentUploads, allUsers] = await Promise.all([
      Student.find().sort({ updatedAt: -1 }).limit(10).select('name role email updatedAt isEmailVerified isApproved'),
      FileSubmission.find().sort({ createdAt: -1 }).limit(10)
        .populate('studentId', 'name email')
        .populate('projectId', 'title'),
      Student.find().sort({ createdAt: -1 })
        .select('name role email isEmailVerified isApproved createdAt isBanned'),
    ]);
    res.status(200).json({ recentLogins, recentUploads, allUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE /admin/users/:id ──────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    let user = await Student.findById(req.params.id) || await Faculty.findById(req.params.id) || await Hod.findById(req.params.id) || await Admin.findById(req.params.id);
    if (!user)               return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete other admins.' });
    if (user.role === 'student') await Student.findByIdAndDelete(req.params.id);
    else if (user.role === 'faculty') await Faculty.findByIdAndDelete(req.params.id);
    else if (user.role === 'hod') await Hod.findByIdAndDelete(req.params.id);
    console.log(`\x1b[31m[ADMIN]\x1b[0m User deleted: ${user.email}`);
    res.status(200).json({ message: 'User permanently deleted from system.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PUT /admin/users/:id/deactivate ─────────────────────────────────────────
export const deactivateUser = async (req, res) => {
  try {
    let user = await Student.findById(req.params.id) || await Faculty.findById(req.params.id) || await Hod.findById(req.params.id) || await Admin.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'faculty') {
      user.isApproved = !user.isApproved;
    } else {
      user.isEmailVerified = !user.isEmailVerified;
    }
    await user.save();
    console.log(`\x1b[33m[ADMIN]\x1b[0m Toggled access for: ${user.email}`);
    res.status(200).json({ message: `User ${user.isEmailVerified || user.isApproved ? 'Activated' : 'Deactivated'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
