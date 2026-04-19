import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  createApplication,
  getMyApplications,
  getApplicationsForRecruiter
} from '../controllers/applicationsController.js';

const router = express.Router();

// Jobseeker applies
router.post('/', protect, upload.single('cv'), createApplication);
router.get('/me', protect, getMyApplications);
router.get('/recruiter', protect, getApplicationsForRecruiter);

export default router;