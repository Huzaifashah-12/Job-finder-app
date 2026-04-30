// controllers/applicationsController.js
import Application from '../models/Application.js';
import Profile from '../models/profile.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';

/**
 * Helper: add full CV URL to an application object
 */
const addCvUrl = (app, req) => {
  const appObj = app.toObject();
  if (appObj.cv) {
    if (appObj.cv.startsWith('http')) {
      appObj.cvUrl = appObj.cv;
    } else {
      appObj.cvUrl = `${req.protocol}://${req.get('host')}/api/uploads/${appObj.cv}`;
    }
  }
  return appObj;
};

/**
 * Jobseeker applies for a job
 */
export const createApplication = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Ensure profile exists (legacy users or failed register side-effect)
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        $setOnInsert: {
          userId: req.user.id,
          fullName: req.user.fullName || '',
          email: req.user.email || '',
        },
      },
      { returnDocument: 'after', upsert: true }
    );

    // Check if already applied
    const existing = await Application.findOne({ userId: req.user.id, jobId });
    if (existing) return res.status(400).json({ message: 'You already applied to this job' });

    // CV file: uploaded or profile CV
    const cvFile = req.file ? (req.file.location || req.file.filename) : profile.cv;

    const application = new Application({
      userId: req.user.id,
      jobId,
      fullName: profile.fullName,
      email: profile.email,
      cv: cvFile,
      status: 'Applied',
    });

    await application.save();

    return res.status(201).json({
      message: 'Application submitted successfully',
      application: addCvUrl(application, req),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
};

/**
 * Jobseeker: get all applications submitted by logged-in user
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title companyId',
        populate: { path: 'companyId', select: 'name' }
      })
      .populate('userId', 'fullName email');

    const result = applications.map(app => addCvUrl(app, req));
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch your applications', error: err.message });
  }
};

/**
 * Recruiter: get all applications for jobs posted by logged-in employer
 */
export const getApplicationsForRecruiter = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) return res.status(400).json({ message: 'Company not found' });

    const jobs = await Job.find({ companyId: company._id });
    if (!jobs.length) return res.status(200).json([]);

    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title companyId')
      .populate('userId', 'fullName email');

    const result = applications.map(app => addCvUrl(app, req));
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch applications for recruiter', error: err.message });
  }
};

/**
 * Get applications for a specific job (recruiter only)
 */
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const company = await Company.findOne({ userId: req.user.id });
    if (!company || job.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view applications for this job' });
    }

    const applications = await Application.find({ jobId })
      .populate('jobId', 'title companyId')
      .populate('userId', 'fullName email');

    const result = applications.map(app => addCvUrl(app, req));
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch applications for this job', error: err.message });
  }
};

/**
 * Update application status (recruiter only)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const company = await Company.findOne({ userId: req.user.id });
    if (!company || application.jobId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({ message: 'Application status updated', application: addCvUrl(application, req) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update application', error: err.message });
  }
};