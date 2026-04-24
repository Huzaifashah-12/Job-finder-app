import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboard } from '../controllers/jobSeekerController.js';

const router = express.Router();

// Job seeker dashboard
router.get('/dashboard', protect, getDashboard);

export default router;