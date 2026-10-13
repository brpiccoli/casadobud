export function parseEmailList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isEmailAllowed(email: string | undefined, allowedEmails: string[]): boolean {
  if (allowedEmails.length === 0) return true;
  if (!email) return false;
  return allowedEmails.includes(email.trim().toLowerCase());
}
