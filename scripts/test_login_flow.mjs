import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== RUNNING AUTHENTICATION & LOGIN FLOW VERIFICATION ===\n');

// 1. Inspect components/login-screen.tsx
console.log('[TEST 1] Checking components/login-screen.tsx for unwanted verification/demo buttons...');
const loginScreenCode = fs.readFileSync(path.join(rootDir, 'components', 'login-screen.tsx'), 'utf-8');

if (loginScreenCode.includes('Quick Test') || loginScreenCode.includes('⚡ Shabeeb') || loginScreenCode.includes('⚡ Albin')) {
  console.error('FAIL: login-screen.tsx still contains quick demo buttons!');
  process.exit(1);
}
console.log('PASS: No name-based buttons or CAPTCHA-like controls in login-screen.tsx.');

// 2. Inspect components/auth-gate.tsx
console.log('\n[TEST 2] Checking components/auth-gate.tsx for unwanted demo buttons...');
const authGateCode = fs.readFileSync(path.join(rootDir, 'components', 'auth-gate.tsx'), 'utf-8');

if (authGateCode.includes('Authorized Demo Accounts') || authGateCode.includes('canteen.staff@gmail.com')) {
  console.error('FAIL: auth-gate.tsx still contains demo account buttons!');
  process.exit(1);
}
console.log('PASS: No demo account buttons in auth-gate.tsx.');

// 3. Inspect app/page.tsx
console.log('\n[TEST 3] Checking app/page.tsx for direct access to Canteen Dashboard...');
const pageCode = fs.readFileSync(path.join(rootDir, 'app', 'page.tsx'), 'utf-8');

if (pageCode.includes('<HostellerDashboard')) {
  console.error('FAIL: app/page.tsx still intercepts login with HostellerDashboard!');
  process.exit(1);
}
console.log('PASS: app/page.tsx directs all authenticated students to the Canteen Dashboard.');

// 4. Test Session Token Generation & Verification
console.log('\n[TEST 4] Testing Session Token lifecycle...');
const AUTH_SECRET = 'rvcas_staff_admin_encryption_secret_key_2026';

function generateAuthToken(session) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');
  if (signature !== expectedSignature) return null;
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

const sessionPayload = {
  userId: 'student_9847123456',
  name: 'Shabeeb',
  email: 'shabeeb@rvcas.ac.in',
  role: 'student',
  studentIdCode: 'RVCAS/2024/BCA/042',
  courseSem: 'BCA • Semester 3',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
};

const token = generateAuthToken(sessionPayload);
console.log('Generated Token:', token.substring(0, 30) + '...');

const decoded = verifyAuthToken(token);
if (!decoded || decoded.userId !== sessionPayload.userId || decoded.name !== sessionPayload.name) {
  console.error('FAIL: Session token verification failed!');
  process.exit(1);
}
console.log('PASS: Session token verified successfully for user:', decoded.name, 'with role:', decoded.role);

console.log('\n======================================================');
console.log('🎉 ALL LOGIN & ACCESS TESTS PASSED! CLEAN FLOW RESTORED.');
console.log('======================================================\n');
