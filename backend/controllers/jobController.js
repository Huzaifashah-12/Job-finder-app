import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import Profile from '../models/profile.js';
import { categorizeJob } from '../services/groqService.js';
import { sendJobNotification } from '../services/emailService.js';

// Create job
export const createJob = async (req, res) => {
  const { title, type, description, location } = req.body;
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) return res.status(400).json({ message: 'Register company first' });

    // Categorize job
    const category = await categorizeJob(title, description);

    const job = await Job.create({
      companyId: company._id,
      title,
      type,
      description,
      location,
      category
    });

    // Notify users
    try {
      const matchingProfiles = await Profile.find({ category: category });
      for (const profile of matchingProfiles) {
        if (profile.email) {
          sendJobNotification(profile.email, job.title, company.name);
        }
      }
    } catch (notifyErr) {
      console.error("Notification failed:", notifyErr.message);
    }

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get jobs for employer
export const getMyJobs = async (req, res) => {
  const company = await Company.findOne({ userId: req.user._id });
  if (!company) return res.status(400).json({ message: 'Company not found' });

  const jobs = await Job.find({ companyId: company._id });
  res.json(jobs);
};

// Update job
export const updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  job.title = req.body.title || job.title;
  job.type = req.body.type || job.type;
  job.description = req.body.description || job.description;
  job.status = req.body.status || job.status;
  job.location = req.body.location || job.location;

  const updated = await job.save();
  res.json(updated);
};

// Delete job
export const deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  await job.deleteOne();
  res.json({ message: 'Job deleted successfully' });
};

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) return res.status(400).json({ message: 'Company not found' });

    const jobs = await Job.find({ companyId: company._id });
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    const jobIds = jobs.map(j => j._id);
    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });

    res.json({
      companyName: company.name,
      totalJobs,
      activeJobs,
      totalApplications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

// Get all jobs (for job seeker) populated with company
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('companyId', 'name location');
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};