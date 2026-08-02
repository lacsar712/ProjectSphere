import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { createDeadline, getAllDeadlines, deleteDeadline, getDeadlinesForUser, updateDeadline } from '../controllers/deadline.controller.js';

const router = express.Router();
router.use(protect);

// HOD / Faculty / Admin
router.post('/', authorizeRoles('hod', 'admin'), createDeadline);
router.get('/', authorizeRoles('hod', 'admin'), getAllDeadlines);
router.delete('/:id', authorizeRoles('hod', 'admin'), deleteDeadline);
router.put('/:id', authorizeRoles('hod', 'admin', 'faculty'), updateDeadline);

// All authenticated users
router.get('/my', getDeadlinesForUser);

export default router;
