import express from "express";
import Job from "../models/Job.js";
import Profile from "../models/profile.js";
import { protect } from "../middleware/authMiddleware.js";
import { extractCvTextForSuggestions } from "../services/cvTextExtractor.js";
import { getJobRecommendations } from "../services/groqService.js";

const router = express.Router();

router.post("/recommend-jobs", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile?.cv) {
      return res.status(400).json({ error: "Upload CV first" });
    }

    const jobs = await Job.find({}).populate("companyId");

    const cvText = await extractCvTextForSuggestions(profile.cv);

    console.log("CV LENGTH:", cvText.length);

    const result = await getJobRecommendations(cvText, jobs);

    return res.json(result);

  } catch (err) {
    console.error("ROUTE ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
});

export default router;