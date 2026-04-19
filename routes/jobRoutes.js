import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createJob,
  getMyJobs,
  getAllJobs,
  updateJob,
  deleteJob,
  getDashboardStats,
} from '../controllers/jobController.js';

const router = express.Router();

// Static paths before any "/:id" routes to avoid collisions.
router.get('/all', protect, getAllJobs);
router.get('/stats', protect, getDashboardStats);

router.post('/', protect, createJob);
router.get('/', protect, getMyJobs);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

export default router;
