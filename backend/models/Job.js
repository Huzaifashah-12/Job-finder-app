import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: { type: String, required: true },
  type: { type: String, enum: ['Full Time', 'Part Time', 'Remote', 'Internship'], required: true },
  description: { type: String, required: true },
  location: { type: String }, // optional
  category: { type: String }, // e.g. "Frontend", "Backend"
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }
}, { timestamps: true });

// Avoid OverwriteModelError
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;