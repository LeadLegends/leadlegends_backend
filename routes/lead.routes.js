import express from 'express';
import {
  createLeadInternal,
  createLeadPublic,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from '../controllers/lead.controller.js';

import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create lead - allowed roles: sales, manager, admin
router.post('/', protect, authorize('sales', 'manager', 'admin'), createLeadInternal);

// Create lead - public route (for lead capture forms)
router.post('/public', createLeadPublic);

// Get all leads - allowed roles: all active users
router.get('/', protect, getAllLeads);

// Get single lead - all active users
router.get('/:id', protect, getLeadById);

// Update lead - allowed roles: sales (assigned), manager, admin
router.put('/:id', protect, authorize('sales', 'manager', 'admin'), updateLead);

// Delete lead - only admin
router.delete('/:id', protect, authorize('admin'), deleteLead);

export default router;