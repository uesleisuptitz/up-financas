/**
 * E-mails autorizados a entrar. Mantenha a mesma lista em firestore.rules.
 */
export const ALLOWED_EMAILS: string[] = [
  "uesleisuptitz@gmail.com",
  "britopaola216@gmail.com",
];

export const hasAllowedUsers = ALLOWED_EMAILS.length > 0;

export const isAllowedEmail = (email?: string | null) => {
  if (!email || !hasAllowedUsers) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_EMAILS.some(
    (allowed) => allowed.trim().toLowerCase() === normalized,
  );
};
