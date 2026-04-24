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

    const cleanJobs = cleanAndFilterJobs(jobs).slice(0, 10);

    const prompt = `
You are a professional job filtering AI.

TASK:
- Remove invalid or garbage jobs
- Classify valid jobs into:
  Full Stack, Frontend, Backend, DevOps, Mobile

RULES:
- Ignore spam or meaningless titles
- No empty response
- No hallucination
- Return ONLY JSON

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
          temperature: 0.2,
        }),
      }
    );

    const data = await response.json();

    let text = data?.choices?.[0]?.message?.content || "";
    text = text.replace(/```json/g, "").replace(/```/g, "");

    const result = safeParse(text);

    if (!result || result.length === 0) {
      return classifyJobs(cleanJobs);
    }

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
      return JSON.parse(text);
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
    
    const validCategories = ["Full Stack", "Frontend", "Backend", "DevOps", "Mobile", "Data Science", "UI/UX"];
    return validCategories.includes(category) ? category : "Other";
  } catch (err) {
    console.error("GROQ JOB CATEGORIZATION ERROR:", err.message);
    return "Other";
  }
}