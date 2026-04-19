import express from "express";
import { getJobRecommendations } from "../services/geminiService.js";
import Job from "../models/Job.js";
import Profile from "../models/profile.js";
import { protect } from "../middleware/authMiddleware.js";
import { extractCvTextForSuggestions } from "../services/cvTextExtractor.js";

const router = express.Router();

// JOB RECOMMENDATIONS
router.post("/recommend-jobs", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId });

    if (!profile || !profile.cv) {
      return res.status(400).json({
        error: "Upload a CV on your profile to get job suggestions.",
      });
    }

    const jobs = await Job.find({}).populate("companyId", "name location");

    let cvText;
    try {
      cvText = await extractCvTextForSuggestions(profile.cv);
    } catch (extractErr) {
      console.error("CV text extraction:", extractErr.message);
      return res.status(400).json({
        error:
          extractErr.message === "CV file not found on server"
            ? "Your profile points to a missing CV file. Please upload your CV again."
            : "Could not read your CV file. Try uploading a PDF.",
      });
    }

    const recommendations = await getJobRecommendations(cvText, jobs);

    res.json(recommendations);
  } catch (err) {
    console.error("Recommendation Route Error:", err);
    res.status(500).json({ error: "Failed to get job recommendations" });
  }
});

export default router;