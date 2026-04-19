import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  fullName: String,
  email: String,
  cv: String,
  status: { type: String, default: 'Applied' },
}, { timestamps: true });

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default Application;