import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  getAdminDashboard,
  getAdminStats,
  getAllStudents,
  getAllFaculty,
  getAllProjectsFull,
  getSystemInfo,
  deleteUser,
  deactivateUser,
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

// Core dashboard (legacy)
router.get('/dashboard',          getAdminDashboard);

// New granular endpoints
router.get('/stats',              getAdminStats);
router.get('/students',           getAllStudents);
router.get('/faculty',            getAllFaculty);
router.get('/projects/full',      getAllProjectsFull);
router.get('/system',             getSystemInfo);

// User management
router.delete('/users/:id',             deleteUser);
router.put('/users/:id/deactivate',     deactivateUser);

export default router;
