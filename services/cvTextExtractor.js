import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';

const UPLOADS_DIR = path.resolve('uploads');
/** Keep Gemini prompt within reasonable size */
const MAX_CV_CHARS = 14_000;
/** First N pages is enough for résumés and keeps parsing fast */
const MAX_PDF_PAGES = 12;

/**
 * @param {string} cv Stored value: basename only (e.g. 123-resume.pdf)
 * @returns {string | null} basename or null if unsafe
 */
export function sanitizeCvFilename(cv) {
  if (!cv || typeof cv !== 'string') return null;
  const base = path.basename(cv.trim());
  if (!base || base !== cv.trim() || base.includes('..')) return null;
  return base;
}

function fallbackFromFilename(filename) {
  const noExt = filename.replace(/\.[^.]+$/i, '');
  const hint = noExt
    .replace(/\d+/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return `[No extractable résumé text. Filename keywords only: ${hint || noExt}. Upload a PDF CV for accurate job matching.]`;
}

/**
 * Reads the CV file from disk and returns plain text for AI matching.
 * PDF: full text extraction. Word (.doc/.docx): filename-based hint only (no extra parser dependency).
 *
 * @param {string} cvFilename
 * @returns {Promise<string>}
 */
export async function extractCvTextForSuggestions(cvFilename) {
  const safe = sanitizeCvFilename(cvFilename);
  if (!safe) {
    throw new Error('Invalid CV file reference');
  }

  const filePath = path.join(UPLOADS_DIR, safe);

  let buf;
  try {
    buf = await fs.readFile(filePath);
  } catch {
    throw new Error('CV file not found on server');
  }

  const lower = safe.toLowerCase();

  if (lower.endsWith('.pdf')) {
    let parser;
    try {
      parser = new PDFParse({ data: buf });
      const result = await parser.getText({ first: MAX_PDF_PAGES });
      const text = (result.text || '').replace(/\s+/g, ' ').trim();
      if (!text) {
        return fallbackFromFilename(safe);
      }
      if (text.length > MAX_CV_CHARS) {
        return `${text.slice(0, MAX_CV_CHARS)}\n[CV text truncated for processing]`;
      }
      return text;
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {});
      }
    }
  }

  if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
    return `${fallbackFromFilename(safe)} For best results, export your CV as PDF and upload again.`;
  }

  return fallbackFromFilename(safe);
}
