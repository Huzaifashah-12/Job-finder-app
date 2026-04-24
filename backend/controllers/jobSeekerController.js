import Application from '../models/Application.js';
import Job from '../models/Job.js';

// GET /api/jobseeker/dashboard
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await Application.find({ userId })
      .populate({
        path: 'jobId',
        select: 'title status companyId',
        populate: { path: 'companyId', select: 'name' },
      })
      .sort({ createdAt: -1 });

    const appliedJobs = applications
      .filter((app) => app.jobId)
      .map((app) => ({
        title: app.jobId.title || 'Untitled role',
        companyName: app.jobId.companyId?.name || 'N/A',
        status: app.status,
        appliedAt: app.createdAt,
      }));

    const totalApplications = applications.length;
    const activeJobs = applications.filter((a) => a.status === 'Applied').length;

    // Sortable month keys (YYYY-MM) → display labels
    const countsByMonthKey = {};
    const labelByMonthKey = {};

    applications.forEach((app) => {
      const created = app.createdAt;
      if (!created) return;
      const d = new Date(created);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      labelByMonthKey[key] = label;
      countsByMonthKey[key] = (countsByMonthKey[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(countsByMonthKey).sort();
    const monthlyLabels = sortedKeys.map((k) => labelByMonthKey[k]);
    const monthlyApplications = sortedKeys.map((k) => countsByMonthKey[k]);

    const savedJobs = [];

    res.json({
      appliedJobs,
      savedJobs,
      totalApplications,
      activeJobs,
      monthlyApplications,
      monthlyLabels,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};
