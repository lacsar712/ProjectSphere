import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getProjectMessages, sendProjectMessage, updatePrivateNotes } from '../controllers/project.controller.js';

const router = express.Router();

router.use(protect);

router.get('/:projectId/messages', getProjectMessages);
router.post('/:projectId/messages', sendProjectMessage);
router.put('/:projectId/private-notes', updatePrivateNotes);

export default router;
