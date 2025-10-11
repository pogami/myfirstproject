// Shared username validation utilities

export type UsernameValidationResult = {
  isValid: boolean;
  error: string;
};

// Reserved usernames and patterns
const RESERVED_USERNAMES = new Set([
  'admin','administrator','moderator','mod','staff','support',
  'system','bot','ai','courseconnect','guest','anonymous',
  'user','test','demo','example','null','undefined','official'
]);

const RESERVED_PATTERNS: RegExp[] = [
  /^(admin|mod|staff|support)[_-]?/i,
  /(official|team|owner)$/i
];

// Profanity patterns with simple normalization
const PROFANITY_PATTERNS: RegExp[] = [
  /\bfuck\b/i,
  /\bshit\b/i,
  /\bbitch(es)?\b/i,
  /\basshole\b/i,
  /\bdamn\b/i,
  /\bhell\b/i,
  /\bcrap\b/i,
  /\bpiss\b/i,
  /\bnigg(er|a)\b/i,
  /\bfaggot\b/i,
  /\bretard(ed)?\b/i,
  /\bwhore\b/i,
  /\bslut\b/i
];

export function normalizeForProfanity(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '') // zero-width
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z0-9_-]+/g, ' ');
}

export function validateUsernameLocal(value: string, existingLower?: Set<string>): UsernameValidationResult {
  const trimmed = (value || '').trim();

  if (trimmed.length < 2) return { isValid: false, error: 'Username must be at least 2 characters long' };
  if (trimmed.length > 20) return { isValid: false, error: 'Username must be 20 characters or less' };
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed))
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };

  const normalized = normalizeForProfanity(trimmed);
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isValid: false, error: 'Username contains inappropriate content' };
    }
  }

  const lower = trimmed.toLowerCase();
  if (RESERVED_USERNAMES.has(lower)) return { isValid: false, error: 'This username is reserved' };
  for (const pat of RESERVED_PATTERNS) if (pat.test(trimmed)) return { isValid: false, error: 'This username is reserved' };

  if (existingLower && existingLower.has(lower)) return { isValid: false, error: 'This username is already taken' };

  return { isValid: true, error: '' };
}





