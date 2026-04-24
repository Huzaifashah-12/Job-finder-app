import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: String,
  email: String,
  cv: String,
  category: String, // e.g. "Frontend", "Backend", "Full Stack"
  skills: [String]
}, { timestamps: true });

// ✅ Avoid OverwriteModelError
const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;