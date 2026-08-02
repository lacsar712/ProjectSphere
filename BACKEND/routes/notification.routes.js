import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getMyNotifications, markAsRead, markAllRead } from '../controllers/notification.controller.js';

const router = express.Router();
router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllRead);     // ⚠ Must be BEFORE /:id/read
router.put('/:id/read', markAsRead);

export default router;
