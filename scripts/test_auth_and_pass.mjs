const BASE_URL = 'http://localhost:3005';

async function runTests() {
  console.log('====================================================');
  console.log('🔒 TESTING GMAIL AUTH GATE & MARK AS SERVED WORKFLOW');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, description) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  try {
    // 1. Unauthorized Gmail attempting Staff Access
    console.log('Test 1: Rejecting Unauthorized Gmail for Staff Console...');
    const unauthStaffRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'random.student.attacker@gmail.com',
        role: 'staff',
      }),
    });
    const unauthStaffData = await unauthStaffRes.json();
    assert(unauthStaffRes.status === 403, 'Unauthorized email correctly rejected with HTTP 403');
    assert(unauthStaffData.error.includes('Access Denied'), 'Error message states Access Denied');

    // 2. Authorized Gmail Staff Login
    console.log('\nTest 2: Authorizing Designated Staff Gmail...');
    const authStaffRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'shibinsha@gmail.com',
        role: 'staff',
      }),
    });
    const authStaffData = await authStaffRes.json();
    assert(authStaffRes.status === 200, 'Authorized staff Gmail logs in with HTTP 200');
    assert(Boolean(authStaffData.token), 'Encrypted session token issued');
    const staffToken = authStaffData.token;

    // 3. Unauthorized Gmail attempting Admin Access
    console.log('\nTest 3: Rejecting Unauthorized Gmail for Admin Console...');
    const unauthAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'impostor@gmail.com',
        role: 'admin',
      }),
    });
    assert(unauthAdminRes.status === 403, 'Unauthorized admin email strictly rejected with HTTP 403');

    // 4. Authorized Admin Gmail Login
    console.log('\nTest 4: Authorizing Designated Admin Gmail...');
    const authAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@rvcas.ac.in',
        role: 'admin',
      }),
    });
    const authAdminData = await authAdminRes.json();
    assert(authAdminRes.status === 200, 'Authorized admin Gmail logs in with HTTP 200');

    // 5. Check Session Endpoint with Bearer Token
    console.log('\nTest 5: Verifying Authenticated Session Endpoint...');
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${staffToken}` },
    });
    const sessionData = await sessionRes.json();
    assert(sessionRes.status === 200, 'Session endpoint returns HTTP 200');
    assert(sessionData.authenticated === true, 'Session confirmed authenticated');
    assert(sessionData.user.email === 'shibinsha@gmail.com', 'User email verified as shibinsha@gmail.com');

    // 6. Test Direct "Mark as Served" on a valid meal pass
    console.log('\nTest 6: Executing Direct Mark as Served Action...');
    // Create a new pass for testing
    const createOrderRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'student_shabeeb', quantity: 1 }),
    });
    const order = await createOrderRes.json();
    const verifyRes = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.orderId,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpaySignature: 'sig_rvcas_sandbox_valid',
      }),
    });
    const verifyData = await verifyRes.json();
    const testPass = verifyData.passes[0];

    // Mark as served using authenticated staff session
    const serveRes = await fetch(`${BASE_URL}/api/passes/serve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`,
      },
      body: JSON.stringify({ token: testPass.secureToken }),
    });
    const serveData = await serveRes.json();
    assert(serveRes.status === 200, 'Pass marked as served with HTTP 200');
    assert(serveData.pass.status === 'SERVED', 'Pass status changed to SERVED');
    assert(serveData.pass.servedBy.includes('shibinsha@gmail.com'), `Recorded authenticated staff in DB: ${serveData.pass.servedBy}`);

    // 7. Double Redemption Prevention
    console.log('\nTest 7: Double Redemption Prevention...');
    const doubleServeRes = await fetch(`${BASE_URL}/api/passes/serve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`,
      },
      body: JSON.stringify({ token: testPass.secureToken }),
    });
    const doubleServeData = await doubleServeRes.json();
    assert(doubleServeRes.status === 409, 'Duplicate mark as served rejected with HTTP 409');
    assert(doubleServeData.reason === 'ALREADY_SERVED', 'Reason confirmed ALREADY_SERVED');

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 AUTH & WORKFLOW RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
