import express from 'express';
import {
  createUser,
  setPassword,
  login
} from '../controllers/auth.controller.js';

import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin-only route: create user
// Requires admin JWT token

router.post('/create', protect, authorize("admin"), createUser);

// User sets password after receiving email
// Public endpoint (token in query params for verification)

router.post('/set-password/', setPassword);


// Login for allowed roles (admin, manager, sales)
// Public endpoint

router.post('/login', login);

export default router;