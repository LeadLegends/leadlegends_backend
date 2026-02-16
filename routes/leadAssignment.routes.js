import express from 'express';
import {
  assignLead,
  getAllAssignments,
  deactivateAssignment
} from '../controllers/leadAssignment.controller.js';

import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ---------------------------
// Create a new assignment
// Admin → Manager
// Manager → Sales
// ---------------------------
router.post(
  '/',
  protect,
  authorize('admin', 'manager'), // only Admin and Manager can assign
  assignLead
);

// ---------------------------
// Get all assignments
// Admin → all
// Manager → assignments they made or assigned to themselves
// Sales → only assigned to them
// ---------------------------
router.get(
  '/',
  protect, // all roles can access
  authorize('admin', 'manager', 'sales'),
  getAllAssignments
);

// ---------------------------
// Deactivate an assignment (soft delete)
// Admin → any
// Manager → only assignments they created
// ---------------------------
router.put(
  '/:id/deactivate',
  protect,
  authorize('admin', 'manager'),
  deactivateAssignment
);

export default router;