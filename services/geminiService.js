import { GoogleGenerativeAI } from "@google/generative-ai";

// ------------------------
// SAFE JSON PARSER
// ------------------------
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Invalid JSON from Gemini");
  }
}

// ------------------------
// JOB RECOMMENDATIONS
// ------------------------
export async function getJobRecommendations(cvText, jobs) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.warn("Missing GEMINI_API_KEY → fallback jobs");
      return jobs.slice(0, 3);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const cleanJobs = jobs.map((j) => ({
      id: j._id,
      title: j.title,
      company: j.companyId?.name ?? j.company?.name ?? j.company,
      location: j.location ?? j.companyId?.location,
      type: j.type,
      skills: j.skills,
      description: j.description?.slice(0, 400),
    }));

    const prompt = `
You are a job matching AI.

CV:
${cvText}

Jobs:
${JSON.stringify(cleanJobs)}

Return ONLY a JSON array of top 5 jobs.
No explanation. No markdown.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return safeParseJSON(text);
  } catch (err) {
    console.error("Job Recommendation Error:", err);
    return [];
  }
}

// ------------------------
// CANDIDATE RECOMMENDATIONS
// ------------------------
export async function getCandidateRecommendations(job, candidates) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return candidates.slice(0, 2).map((c) => ({
        candidateId: c._id || c.id,
        fullName: c.fullName,
        email: c.email,
        reason: "Mock recommendation (no API key)",
      }));
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const candidateData = candidates.map((c) => ({
      id: c._id || c.id,
      fullName: c.fullName,
      email: c.email,
      cv: c.cv?.slice(0, 1000),
    }));

    const prompt = `
You are a recruiter AI.

Job:
${JSON.stringify(job)}

Candidates:
${JSON.stringify(candidateData)}

Return ONLY JSON array of top 3 candidates:
[
  {
    "candidateId": "",
    "fullName": "",
    "email": "",
    "reason": ""
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return safeParseJSON(text);
  } catch (err) {
    console.error("Candidate Recommendation Error:", err);
    return [];
  }
}