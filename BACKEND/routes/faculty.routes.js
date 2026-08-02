import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  getFacultyDashboard, acceptProposal, rejectProposal, addFeedback,
  updateProgress, assignDeadline, rejectFinalSubmission, approveFinalSubmission,
  commentTimelineUpdate, resolveExtensionRequest
} from '../controllers/faculty.controller.js';

const router = express.Router();
router.use(protect);
router.use(authorizeRoles('faculty', 'hod'));

router.get('/dashboard', getFacultyDashboard);
router.put('/proposals/:id/accept', acceptProposal);
router.put('/proposals/:id/reject', rejectProposal);
router.post('/proposals/:id/feedback', addFeedback);
router.put('/proposals/:id/progress', updateProgress);
router.put('/proposals/:id/reject-submission', rejectFinalSubmission);
router.put('/proposals/:id/approve-submission', approveFinalSubmission);
router.post('/deadlines', assignDeadline);

// Timeline Commenting & Extension Request Resolution
router.post('/proposals/:proposalId/timeline/:timelineId/comment', commentTimelineUpdate);
router.put('/extensions/:requestId/resolve', resolveExtensionRequest);

export default router;
