import express from 'express';
import { registerCompany, getMyCompany } from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, registerCompany);
router.get('/', protect, getMyCompany);

export default router;