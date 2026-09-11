import crypto from 'crypto';

/**
 * Generates a clean human-readable pass ID.
 * Format: RVCAS-YYYYMMDD-XXXXX (e.g. RVCAS-20260909-A82K7)
 */
export function generatePassId(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  // Readable charset excluding confusing characters (0, O, 1, I, L)
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let randStr = '';
  const randomBytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    randStr += chars[randomBytes[i] % chars.length];
  }

  return `RVCAS-${yyyy}${mm}${dd}-${randStr}`;
}

/**
 * Generates a high-entropy, cryptographically secure URL token for the verification link.
 * Used for /verify-pass/[secureToken]
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(24).toString('hex');
}
