import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'rvcas_staff_admin_encryption_secret_key_2026';

export const getAuthorizedStaffEmails = (): string[] => {
  const envVal = process.env.AUTHORIZED_STAFF_EMAILS || 'canteen.staff@gmail.com,shibinsha@gmail.com,staff.rvcas@gmail.com';
  return envVal.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
};

export const getAuthorizedAdminEmails = (): string[] => {
  const envVal = process.env.AUTHORIZED_ADMIN_EMAILS || 'admin@rvcas.ac.in,shibinsha@gmail.com,admin.rvcas@gmail.com';
  return envVal.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
};

export function isAuthorizedStaffEmail(email: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const staffList = getAuthorizedStaffEmails();
  const adminList = getAuthorizedAdminEmails();
  return staffList.includes(cleanEmail) || adminList.includes(cleanEmail);
}

export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return getAuthorizedAdminEmails().includes(cleanEmail);
}

export interface AuthSession {
  userId: string;
  email?: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  studentIdCode?: string;
  courseSem?: string;
  expiresAt: number;
}

/**
 * Creates an encrypted/signed session token
 */
export function generateAuthToken(session: AuthSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifies and decodes an encrypted session token
 */
export function verifyAuthToken(token: string): AuthSession | null {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');

  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as AuthSession;
    if (Date.now() > decoded.expiresAt) {
      return null; // Expired
    }
    return decoded;
  } catch {
    return null;
  }
}
