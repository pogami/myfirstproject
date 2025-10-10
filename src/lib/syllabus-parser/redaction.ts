// Simple redaction utilities for syllabus text and fields

export function redactPII(text: string): string {
  if (!text) return text;
  let redacted = text;
  // Emails
  redacted = redacted.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]');
  // Phone numbers (various formats)
  redacted = redacted.replace(/\+?\d?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[REDACTED_PHONE]');
  // Addresses (very rough heuristic: number + street)
  redacted = redacted.replace(/\b\d{1,5}\s+[A-Za-z0-9\.\-\s]{3,}\b/g, '[REDACTED_ADDRESS]');
  // IDs (student id like patterns)
  redacted = redacted.replace(/\b(id|student\s*id|sid)[:#\s]*[A-Za-z0-9\-]{4,}\b/gi, '[REDACTED_ID]');
  // URLs
  redacted = redacted.replace(/https?:\/\/[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?/gi, '[REDACTED_URL]');
  return redacted;
}

export function buildTrainingSample(rawText: string, parsed: any) {
  const sample = {
    version: 1,
    createdAt: Date.now(),
    fields: {
      courseInfo: parsed?.courseInfo ?? null,
      schedule: parsed?.schedule ?? [],
      assignments: parsed?.assignments ?? [],
      gradingPolicy: parsed?.gradingPolicy ?? {},
      readings: parsed?.readings ?? [],
      policies: parsed?.policies ?? {},
      contacts: parsed?.contacts ?? {},
      tags: parsed?.tags ?? undefined,
    },
    snippets: extractSourceSnippets(rawText),
  };
  // Redact fields where necessary (emails/phones inside strings)
  return JSON.parse(redactPII(JSON.stringify(sample)));
}

function extractSourceSnippets(text: string) {
  // Keep compact by returning first N lines and any lines with key words
  const lines = (text || '').split(/\r?\n/);
  const keywords = ['assignment', 'exam', 'grade', 'policy', 'office', 'hours', 'reading', 'week', 'schedule'];
  const hits: string[] = [];
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (hits.length < 15 && keywords.some(k => l.toLowerCase().includes(k))) {
      hits.push(l.slice(0, 300));
    }
    if (hits.length >= 15) break;
  }
  return {
    preview: lines.slice(0, 10).map(s => s.slice(0, 300)),
    keywordSamples: hits,
  };
}



