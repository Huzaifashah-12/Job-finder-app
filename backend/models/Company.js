// models/company.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { type: String },
  website: { type: String },
  description: { type: String }
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;