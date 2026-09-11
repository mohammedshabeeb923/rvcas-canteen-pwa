import assert from 'assert';

const BASE_URL = 'http://localhost:3005';

let passed = 0;
let failed = 0;

async function asyncIt(desc, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function runSuite() {
  console.log('====================================================');
  console.log('🔐 TESTING PERSISTENT AUTHENTICATION & LOGIN FLOW');
  console.log('====================================================\n');

  let sessionCookie = '';

  // Test 1: Student Login with Mobile Phone Number & Password
  console.log('Test 1: Student Login with Mobile Phone Number & Password...');
  await asyncIt('Authenticates student by phone number and issues signed session cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'student',
        phone: '9847123456',
        password: 'student_password_123',
        rememberMe: true,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.name, 'Shabeeb');
    assert.strictEqual(data.user.role, 'student');
    assert.strictEqual(data.user.studentIdCode, 'RVCAS/2024/BCA/042');
    assert(data.token, 'Should issue JWT/HMAC token');

    const rawCookie = res.headers.get('set-cookie');
    assert(rawCookie && rawCookie.includes('rvcas_session'), 'Must set rvcas_session cookie');
    sessionCookie = rawCookie.split(';')[0];
  });

  // Test 2: Persistent Session Verification
  console.log('\nTest 2: Verifying Persistent Session via Cookie...');
  await asyncIt('Retrieves authenticated student profile from cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.authenticated, true);
    assert.strictEqual(data.user.name, 'Shabeeb');
    assert.strictEqual(data.user.role, 'student');
    assert.strictEqual(data.user.studentIdCode, 'RVCAS/2024/BCA/042');
  });

  // Test 3: Staff Gmail Authentication
  console.log('\nTest 3: Staff Gmail Authentication Gate...');
  await asyncIt('Authorizes designated staff Gmail (shibinsha@gmail.com)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'staff',
        email: 'shibinsha@gmail.com',
        pin: '842601',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'staff');
  });

  // Test 4: Reject Unauthorized Gmail
  console.log('\nTest 4: Rejecting Unauthorized Staff/Admin Attempt...');
  await asyncIt('Strictly rejects unauthorized Gmail with HTTP 403', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'staff',
        email: 'unauthorized.intruder@gmail.com',
        pin: '842601',
      }),
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.error.includes('Access Denied'));
  });

  // Test 5: Logout Endpoint
  console.log('\nTest 5: Logout & Session Invalidation...');
  let clearedCookie = '';
  await asyncIt('Clears session cookie and invalidates authentication', async () => {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie },
    });

    assert.strictEqual(logoutRes.status, 200);
    const rawCookie = logoutRes.headers.get('set-cookie');
    assert(rawCookie, 'Must set empty cookie on logout');
    clearedCookie = rawCookie.split(';')[0];

    // Verify session is now unauthenticated
    const checkRes = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: { 'Cookie': clearedCookie },
    });

    assert.strictEqual(checkRes.status, 401);
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.authenticated, false);
  });

  console.log('\n====================================================');
  console.log(`🏁 PERSISTENT AUTH TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
