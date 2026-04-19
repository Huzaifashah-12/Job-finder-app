import express from 'express';
import cors from 'cors';
import multer from 'multer';
import authRoutes from './routes/authRoutes.js';
import jobSeekerRoutes from './routes/jobSeekerRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationsRoutes from './routes/applicationsRoutes.js'; // ✅ import it
import recommendRoutes from './routes/recommendation.js';
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobseeker', jobSeekerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/uploads', express.static('uploads')); // to access uploaded files
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationsRoutes);
app.use("/api", recommendRoutes);
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB).' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err && err.message === 'Only PDF and Word files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Catch-all error handler (prevents hanging / unhandled rejections surfacing as blank 500s)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = Number(err.status) || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
});

export default app;