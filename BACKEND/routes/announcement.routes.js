import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  togglePin,
} from '../controllers/announcement.controller.js';

const router = express.Router();

router.use(protect); // All announcement routes require login

router.get('/', getAnnouncements);                                                        // All roles
router.post('/', authorizeRoles('admin', 'hod', 'faculty'), createAnnouncement);          // Admin, HOD, Faculty
router.delete('/:id', authorizeRoles('admin', 'hod', 'faculty'), deleteAnnouncement);     // Admin or creator
router.patch('/:id/pin', authorizeRoles('admin', 'hod', 'faculty'), togglePin);           // Admin or creator

export default router;
