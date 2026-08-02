import { Announcement } from '../models/Announcement.model.js';
import { Hod } from '../models/Hod.model.js';
import { Faculty } from '../models/Faculty.model.js';
import { Student } from '../models/Student.model.js';
import { Notification } from '../models/Notification.model.js';
import { ProjectProposal } from '../models/Proposal.model.js';

// GET /api/announcements — all authenticated users
export const getAnnouncements = async (req, res) => {
  try {
    const { audience } = req.query;
    let filter = {};

    // Students only see 'all' and 'student' targeted announcements from their branch/department HOD/Faculty, or Admin
    if (req.user.role === 'student') {
      const studentBranch = req.user.branch;
      const [hods, faculty] = await Promise.all([
        Hod.find({ department: studentBranch }).distinct('_id'),
        Faculty.find({ department: studentBranch }).distinct('_id')
      ]);
      const deptCreatorIds = [...hods, ...faculty];

      const proposal = await ProjectProposal.findOne({ studentId: req.user._id });

      filter = {
        targetAudience: { $in: ['all', 'student'] },
        $or: [
          { createdByRole: 'admin' },
          {
            createdBy: { $in: deptCreatorIds },
            $or: [
              { createdModel: { $ne: 'Faculty' } },
              proposal && proposal.assignedFaculty ? { createdBy: proposal.assignedFaculty } : { _id: null }
            ]
          }
        ]
      };
    }
    // Faculty only see 'all' and 'faculty' from their department HOD/Faculty, or Admin
    else if (req.user.role === 'faculty') {
      const facultyDept = req.user.department;
      const [hods, faculty] = await Promise.all([
        Hod.find({ department: facultyDept }).distinct('_id'),
        Faculty.find({ department: facultyDept }).distinct('_id')
      ]);
      const deptCreatorIds = [...hods, ...faculty];

      filter = {
        targetAudience: { $in: ['all', 'faculty'] },
        $or: [
          { createdByRole: 'admin' },
          { createdBy: { $in: deptCreatorIds } }
        ]
      };
    }

    if (audience && audience !== 'all') filter.targetAudience = audience;

    const announcements = await Announcement.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(50);

    res.status(200).json({ announcements });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m getAnnouncements:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/announcements — admin, hod, faculty
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetAudience, pinned } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' });

    const pRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      targetAudience: targetAudience || 'all',
      pinned: pinned || false,
      createdBy: req.user._id,
      createdModel: pRole,
      createdByName: req.user.name,
      createdByRole: req.user.role,
    });

    // Send notifications to students in the department
    if (['all', 'student'].includes(targetAudience)) {
      let studentFilter = {};
      if (req.user.role === 'hod' || req.user.role === 'faculty') {
        studentFilter.branch = req.user.department;
      }
      
      const students = await Student.find(studentFilter);
      const notifications = students.map(student => ({
        userId: student._id,
        userModel: 'Student',
        message: `New Announcement from ${req.user.name} (${pRole}): "${title.trim()}"`,
        type: 'general'
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Announcement created by ${req.user.email}: "${title}"`);
    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m createAnnouncement:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/announcements/:id — admin deletes any; others only their own
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    // Only admin or the original creator can delete
    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement.' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Announcement deleted by ${req.user.email}`);
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m deleteAnnouncement:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/announcements/:id/pin — admin or creator can toggle pin
export const togglePin = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    announcement.pinned = !announcement.pinned;
    await announcement.save();
    res.status(200).json({ message: `Announcement ${announcement.pinned ? 'pinned' : 'unpinned'}`, announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
