// backend/controllers/authController.js
import User from '../models/User.js';
import Profile from '../models/profile.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const resolvedRole = (role || 'seeker').toLowerCase();

    // Let User schema pre-save hash the password (do not hash here).
    const user = await User.create({
      email,
      password,
      fullName,
      role: resolvedRole === 'recruiter' ? 'recruiter' : 'seeker',
    });

    if (resolvedRole === 'seeker') {
      try {
        await Profile.create({ userId: user._id, fullName, email });
      } catch (profileErr) {
        // Unique race or duplicate profile — non-fatal for registration
        console.error('Profile create on register:', profileErr.message);
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};
