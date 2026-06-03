const VALID_CATEGORIES = [
  "Full Stack",
  "Frontend",
  "Backend",
  "DevOps",
  "Mobile",
  "Data Science",
  "UI/UX"
];

export function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return "Other";
  
  const trimmed = cat.trim().toLowerCase();
  
  // Find case-insensitive match
  for (const validCat of VALID_CATEGORIES) {
    if (validCat.toLowerCase() === trimmed) {
      return validCat;
    }
  }
  
  // Fuzzy match common synonyms
  if (trimmed.includes("fullstack") || trimmed.includes("full-stack") || trimmed.includes("full stack")) {
    return "Full Stack";
  }
  if (trimmed.includes("front") || trimmed.includes("react") || trimmed.includes("angular")) {
    return "Frontend";
  }
  if (trimmed.includes("back") || trimmed.includes("node") || trimmed.includes("django")) {
    return "Backend";
  }
  if (trimmed.includes("devops") || trimmed.includes("cloud") || trimmed.includes("aws") || trimmed.includes("sysadmin")) {
    return "DevOps";
  }
  if (trimmed.includes("mobile") || trimmed.includes("flutter") || trimmed.includes("android") || trimmed.includes("ios")) {
    return "Mobile";
  }
  if (trimmed.includes("data") || trimmed.includes("python") || trimmed.includes("machine learning") || trimmed.includes("ai")) {
    return "Data Science";
  }
  if (trimmed.includes("ui") || trimmed.includes("ux") || trimmed.includes("designer") || trimmed.includes("design")) {
    return "UI/UX";
  }
  
  return "Other";
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return [];
  }
}

/* ---------------- CLEAN JOBS ---------------- */
function cleanAndFilterJobs(jobs) {
  const cleaned = jobs
    .filter((job) => {
      const title = job.title?.trim();

      // remove empty or too short
      if (!title || title.length < 3) return false;

      // remove junk (no spaces = likely spam like "cehwefuuef")
      if (!title.includes(" ")) return false;

      // remove numeric/random strings
      if (/^[a-zA-Z]{1,10}$/.test(title) && title.length < 5) return false;

      return true;
    })
    .map((job) => ({
      _id: job._id,
      title: job.title,
      company: job.companyId?.name,
      location: job.location,
      skills: job.skills || [],
      description: job.description?.slice(0, 150) || "",
    }));

  // remove duplicates
  const unique = Array.from(
    new Map(cleaned.map((j) => [j.title.toLowerCase(), j])).values()
  );

  return unique;
}

/* ---------------- FALLBACK CLASSIFIER ---------------- */
function classifyJobs(jobs) {
  return jobs.map((job) => {
    const text =
      (job.title + " " + (job.skills || []).join(" ")).toLowerCase();

    let type = "Other";

    if (text.includes("full stack")) type = "Full Stack";
    else if (text.includes("frontend") || text.includes("react"))
      type = "Frontend";
    else if (text.includes("backend") || text.includes("node"))
      type = "Backend";
    else if (text.includes("devops") || text.includes("aws"))
      type = "DevOps";
    else if (text.includes("mobile") || text.includes("flutter"))
      type = "Mobile";

    return {
      _id: job._id || job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type,
    };
  });
}

/* ---------------- MAIN FUNCTION ---------------- */
export async function getJobRecommendations(cvText, jobs) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return classifyJobs(jobs).slice(0, 5);
    }

    if (!cvText || cvText.length < 30) {
      return classifyJobs(jobs).slice(0, 5);
    }

    const cleanJobs = cleanAndFilterJobs(jobs).slice(0, 40);

    const prompt = `
You are a professional job recommendation AI.

TASK:
- Analyze the candidate's CV text.
- From the provided list of jobs, select up to 5 jobs that match the candidate's skills, experience, and career profile.
- Order the matching jobs starting with the best match.
- If no jobs match the CV, return an empty array [].

RULES:
- Do not recommend jobs that are unrelated to the candidate's field.
- Ignore spam or meaningless titles.
- Return ONLY valid JSON array of objects. Do not include any explanations.

FORMAT:
[
  {
    "_id": "",
    "title": "",
    "company": "",
    "location": "",
    "type": ""
  }
]

CV:
${cvText}

Jobs:
${JSON.stringify(cleanJobs)}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      }
    );

    const data = await response.json();

    let text = data?.choices?.[0]?.message?.content || "";
    text = text.replace(/```json/g, "").replace(/```/g, "");

    const result = safeParse(text);

    return result;
  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    return classifyJobs(jobs).slice(0, 5);
  }
}

export async function extractProfileFromCv(cvText) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || !cvText || cvText.length < 30) {
      return { category: "Other", skills: [] };
    }

    const prompt = `
You are a career expert.
TASK: Extract the most suitable job category and top 5 technical skills from the CV text.

CATEGORIES: Full Stack, Frontend, Backend, DevOps, Mobile, Data Science, UI/UX, Other

RULES:
- Return ONLY JSON
- No extra text

FORMAT:
{
  "category": "Frontend",
  "skills": ["React", "JavaScript", "CSS", "HTML", "TypeScript"]
}

CV:
${cvText}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", 
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      }
    );

    const data = await response.json();
    let text = data?.choices?.[0]?.message?.content || "";
    text = text.replace(/```json/g, "").replace(/```/g, "");

    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.category) {
        parsed.category = normalizeCategory(parsed.category);
      }
      return parsed;
    } catch {
      return { category: "Other", skills: [] };
    }
  } catch (err) {
    console.error("GROQ PROFILE EXTRACTION ERROR:", err.message);
    return { category: "Other", skills: [] };
  }
}

export async function categorizeJob(title, description) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return "Other";

    const prompt = `
You are a job classifier.
TASK: Categorize the following job into one of these categories: Full Stack, Frontend, Backend, DevOps, Mobile, Data Science, UI/UX, Other

RULES:
- Return ONLY the category name.
- No extra text.

Job Title: ${title}
Job Description: ${description}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      }
    );

    const data = await response.json();
    const category = data?.choices?.[0]?.message?.content?.trim();
    
    return normalizeCategory(category);
  } catch (err) {
    console.error("GROQ JOB CATEGORIZATION ERROR:", err.message);
    return "Other";
  }
}