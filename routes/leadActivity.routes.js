import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { createActivity, getActivitiesByLead } from '../controllers/leadActivity.controller.js';

const router = express.Router();

// Create a new activity (Admin / Manager / Sales)
router.post(
  '/',
  protect,
  authorize('admin', 'manager', 'sales'),
  createActivity
);

// Get all activities for a lead
router.get(
  '/:leadId',
  protect,
  authorize('admin', 'manager', 'sales'),
  getActivitiesByLead
);

export default router;