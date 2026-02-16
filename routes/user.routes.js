import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resendPasswordEmail,
} from '../controllers/user.controller.js';

import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ---------------------------
// User Management Routes
// ---------------------------

// Get all users - Admin + Manager
router.get('/', protect, authorize('admin', 'manager'), getAllUsers);

// Get single user by ID - Admin + Manager
router.get('/:id', protect, authorize('admin', 'manager'), getUserById);

// Update user - Admin only
router.put('/:id', protect, authorize('admin'), updateUser);

// Delete user - Admin only
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Resend password setup email - Admin only
router.post('/:id/send-password', protect, authorize('admin'), resendPasswordEmail);

export default router;