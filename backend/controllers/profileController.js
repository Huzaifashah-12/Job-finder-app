import Profile from '../models/profile.js';
import { extractCvTextForSuggestions } from '../services/cvTextExtractor.js';
import { extractProfileFromCv } from '../services/groqService.js';

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
      if (profileData.cv.startsWith('http')) {
        profileData.cvUrl = profileData.cv;
      } else {
        profileData.cvUrl = `${req.protocol}://${req.get('host')}/uploads/${profileData.cv}`;
      }
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
    
    if (req.file) {
      const cvIdentifier = req.file.location || req.file.filename;
      profile.cv = cvIdentifier;
      
      // Extract text and analyze CV
      try {
        const cvText = await extractCvTextForSuggestions(cvIdentifier);
        if (cvText && cvText.length > 30) {
          const { category, skills } = await extractProfileFromCv(cvText);
          if (category) profile.category = category;
          if (skills) profile.skills = skills;
        }
      } catch (extractErr) {
        console.error("Profile processing failed:", extractErr.message);
      }
    }

    await profile.save();

    const profileData = profile.toObject();

    if (profileData.cv) {
      if (profileData.cv.startsWith('http')) {
        profileData.cvUrl = profileData.cv;
      } else {
        profileData.cvUrl = `${req.protocol}://${req.get('host')}/uploads/${profileData.cv}`;
      }
    }

    res.json(profileData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};
