import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, upload.single('cv'), updateProfile);
router.patch('/', protect, upload.single('cv'), updateProfile);

export default router;
