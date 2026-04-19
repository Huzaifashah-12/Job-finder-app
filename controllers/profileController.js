import Profile from '../models/profile.js';

// GET profile
export const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
      });
    }

    const profileData = profile.toObject();

    if (profileData.cv) {
      profileData.cvUrl = `${req.protocol}://${req.get('host')}/uploads/${profileData.cv}`;
    }

    res.json(profileData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE profile (multipart or JSON)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new Profile({
        userId: req.user.id,
        fullName: req.user.fullName || '',
        email: req.user.email || '',
      });
    }

    if (fullName !== undefined && fullName !== null) profile.fullName = fullName;
    if (email !== undefined && email !== null) profile.email = email;
    if (req.file) profile.cv = req.file.filename;

    await profile.save();

    const profileData = profile.toObject();

    if (profileData.cv) {
      profileData.cvUrl = `${req.protocol}://${req.get('host')}/uploads/${profileData.cv}`;
    }

    res.json(profileData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};
