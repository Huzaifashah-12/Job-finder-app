import fs from "fs/promises";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const UPLOADS_DIR = path.resolve("uploads");
const MAX_CV_CHARS = 14000;

export function sanitizeCvFilename(cv) {
  if (!cv || typeof cv !== "string") return null;

  const base = path.basename(cv.trim());
  if (!base || base !== cv.trim() || base.includes("..")) return null;

  return base;
}

function fallback(filename) {
  const name = filename.replace(/\.[^.]+$/, "");
  return `Invalid CV. Upload proper TEXT PDF. File: ${name}`;
}

async function extractTextFromPDF(buffer) {
  const uint8Array = new Uint8Array(buffer);

  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  let fullText = "";
  const maxPages = Math.min(pdf.numPages, 10);

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map((item) => item.str);
    fullText += strings.join(" ") + " ";
  }

  return fullText;
}

export async function extractCvTextForSuggestions(cvFilename) {
  if (!cvFilename) throw new Error("Invalid CV");

  let buf;
  let isPdf = false;
  let filenameToLog = cvFilename;

  try {
    if (cvFilename.startsWith('http')) {
      // It's an S3 URL or public URL
      const response = await fetch(cvFilename);
      if (!response.ok) throw new Error(`Failed to fetch CV from URL: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      buf = Buffer.from(arrayBuffer);
      isPdf = cvFilename.toLowerCase().includes(".pdf");
    } else {
      // Local file fallback
      const safe = sanitizeCvFilename(cvFilename);
      if (!safe) throw new Error("Invalid CV");
      filenameToLog = safe;
      const filePath = path.join(UPLOADS_DIR, safe);
      buf = await fs.readFile(filePath);
      isPdf = safe.toLowerCase().endsWith(".pdf");
    }
  } catch (err) {
    console.error("Error reading CV:", err.message);
    throw new Error("CV not found");
  }

  if (!isPdf) {
    return fallback(filenameToLog);
  }

  try {
    let text = await extractTextFromPDF(buf);

    text = text.replace(/\s+/g, " ").trim();

    if (!text || text.length < 30) return fallback(filenameToLog);

    if (text.length > MAX_CV_CHARS) {
      text = text.slice(0, MAX_CV_CHARS);
    }

    return text;
  } catch (err) {
    console.error("PDF ERROR:", err.message);
    return fallback(filenameToLog);
  }
}