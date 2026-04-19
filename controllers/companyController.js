import Company from '../models/Company.js';

export const registerCompany = async (req, res) => {
  const { name, industry, description } = req.body;

  try {
    const existing = await Company.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Company already registered' });
    }

    const company = await Company.create({
      userId: req.user._id,
      name,
      industry,
      description
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCompany = async (req, res) => {
  const company = await Company.findOne({ userId: req.user._id });
  res.json(company);
};