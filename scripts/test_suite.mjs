// Automated End-to-End Test Suite for RVCAS Canteen Digital Meal-Pass PWA
import { generateSandboxPayment } from '../lib/razorpay.ts';

const BASE_URL = 'http://localhost:3005';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING RVCAS CANTEEN WORKFLOW VERIFICATION SUITE');
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
    // -------------------------------------------------------------
    // Test 1: Fetch Dashboard Stats
    // -------------------------------------------------------------
    console.log('Test 1: Querying Dashboard Realtime Stats...');
    const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, 'Stats endpoint responds with HTTP 200');
    assert(statsData.stats.mealsPurchased >= 486, `Meals purchased count verified: ${statsData.stats.mealsPurchased}`);
    assert(statsData.stats.mealsServed >= 421, `Meals served count verified: ${statsData.stats.mealsServed}`);
    assert(statsData.stats.todayRevenue >= 19440, `Today collection verified: ₹${statsData.stats.todayRevenue}`);

    // -------------------------------------------------------------
    // Test 2: Server-Side Order Creation (₹40 strict validation)
    // -------------------------------------------------------------
    console.log('\nTest 2: Creating Meal Order Server-Side...');
    const createOrderRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student_shabeeb',
        mealId: 'meal_today',
        quantity: 1,
      }),
    });
    const orderData = await createOrderRes.json();
    assert(createOrderRes.status === 200, 'Order creation responds with HTTP 200');
    assert(orderData.amount === 40, 'Amount strictly calculated as ₹40 server-side');
    assert(orderData.razorpayOrderId.startsWith('order_'), 'Razorpay order ID generated');

    // -------------------------------------------------------------
    // Test 3: Cryptographic Payment Verification & Pass Generation
    // -------------------------------------------------------------
    console.log('\nTest 3: Cryptographic Signature Verification & Pass Issuance...');
    const sandboxPayment = generateSandboxPayment(orderData.razorpayOrderId);
    const verifyRes = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderData.orderId,
        razorpayOrderId: sandboxPayment.razorpayOrderId,
        razorpayPaymentId: sandboxPayment.razorpayPaymentId,
        razorpaySignature: sandboxPayment.razorpaySignature,
        recipients: [
          { studentId: 'student_shabeeb', name: 'Shabeeb', courseSem: 'BCA • Semester 3' },
        ],
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200, 'Verification responds with HTTP 200');
    assert(verifyData.passes.length === 1, 'Exactly 1 meal pass generated');
    const createdPass = verifyData.passes[0];
    assert(createdPass.passId.startsWith('RVCAS-'), `Human readable pass ID created: ${createdPass.passId}`);
    assert(createdPass.status === 'VALID', 'Pass status initialized to VALID');
    assert(createdPass.secureToken.length >= 32, 'Cryptographically secure verification token generated');

    // -------------------------------------------------------------
    // Test 4: Idempotency & Duplicate Replay Protection
    // -------------------------------------------------------------
    console.log('\nTest 4: Idempotency - Submitting Identical Payment Again...');
    const duplicateRes = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderData.orderId,
        razorpayOrderId: sandboxPayment.razorpayOrderId,
        razorpayPaymentId: sandboxPayment.razorpayPaymentId,
        razorpaySignature: sandboxPayment.razorpaySignature,
      }),
    });
    const duplicateData = await duplicateRes.json();
    assert(duplicateRes.status === 200, 'Duplicate payment returns idempotently');
    assert(duplicateData.passes.length === 1, 'No duplicate passes created on replay');
    assert(duplicateData.passes[0].id === createdPass.id, 'Returns original pass without re-issuing');

    // -------------------------------------------------------------
    // Test 5: Client-Side Tampering & Invalid Signature Rejection
    // -------------------------------------------------------------
    console.log('\nTest 5: Tampered Signature Protection...');
    const fakeOrderRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 }),
    });
    const fakeOrder = await fakeOrderRes.json();
    const tamperedRes = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: fakeOrder.orderId,
        razorpayOrderId: fakeOrder.razorpayOrderId,
        razorpayPaymentId: 'pay_fake_attacker_attempt',
        razorpaySignature: 'invalid_malicious_forged_signature_hash',
      }),
    });
    assert(tamperedRes.status === 400, 'Server correctly rejects tampered payment signature with HTTP 400');

    // -------------------------------------------------------------
    // Test 6: Multi-Student Meal Booking (1 order, multiple passes)
    // -------------------------------------------------------------
    console.log('\nTest 6: Multi-Student Meal Booking (3 meals = ₹120)...');
    const multiOrderRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 3 }),
    });
    const multiOrder = await multiOrderRes.json();
    assert(multiOrder.amount === 120, 'Server calculates 3 meals × ₹40 = ₹120');

    const multiPayment = generateSandboxPayment(multiOrder.razorpayOrderId);
    const multiVerifyRes = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: multiOrder.orderId,
        razorpayOrderId: multiPayment.razorpayOrderId,
        razorpayPaymentId: multiPayment.razorpayPaymentId,
        razorpaySignature: multiPayment.razorpaySignature,
        recipients: [
          { name: 'Shabeeb', courseSem: 'BCA • Semester 3' },
          { name: 'Albin John', courseSem: 'B.Com • Semester 5' },
          { name: 'Jithin Salim', courseSem: 'BCA • Semester 3' },
        ],
      }),
    });
    const multiVerifyData = await multiVerifyRes.json();
    assert(multiVerifyData.passes.length === 3, 'Created 3 independent meal passes');
    const pass1 = multiVerifyData.passes[0];
    const pass2 = multiVerifyData.passes[1];
    const pass3 = multiVerifyData.passes[2];
    assert(pass1.passId !== pass2.passId && pass2.passId !== pass3.passId, 'Pass IDs are all unique');
    assert(pass1.secureToken !== pass2.secureToken, 'Verification tokens are independent');

    // -------------------------------------------------------------
    // Test 7: Staff Verification Endpoint (Querying Pass)
    // -------------------------------------------------------------
    console.log('\nTest 7: Staff Verification Endpoint Query...');
    const passCheckRes = await fetch(`${BASE_URL}/api/passes/verify?token=${createdPass.secureToken}`);
    const passCheckData = await passCheckRes.json();
    assert(passCheckRes.status === 200, 'Pass verification query returns HTTP 200');
    assert(passCheckData.success === true, 'Pass confirmed VALID');
    assert(passCheckData.pass.studentName === 'Shabeeb', 'Student details match pass record');

    // -------------------------------------------------------------
    // Test 8: Staff Redemption ("Mark as Served")
    // -------------------------------------------------------------
    console.log('\nTest 8: Atomic Staff Redemption ("Mark as Served")...');
    const serveRes = await fetch(`${BASE_URL}/api/passes/serve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: createdPass.secureToken,
        servedBy: 'Staff Counter 1',
      }),
    });
    const serveData = await serveRes.json();
    assert(serveRes.status === 200, 'Redemption responds with HTTP 200');
    assert(serveData.success === true, 'Redemption success confirmed');
    assert(serveData.pass.status === 'SERVED', 'Pass status atomically transitioned to SERVED');
    assert(Boolean(serveData.servedAt), 'Server recorded servedAt timestamp');

    // -------------------------------------------------------------
    // Test 9: Strict Duplicate Redemption Prevention
    // -------------------------------------------------------------
    console.log('\nTest 9: Duplicate Redemption Prevention (Attempting second redemption)...');
    const doubleServeRes = await fetch(`${BASE_URL}/api/passes/serve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: createdPass.secureToken,
        servedBy: 'Staff Counter 2',
      }),
    });
    const doubleServeData = await doubleServeRes.json();
    assert(doubleServeRes.status === 409, 'Double redemption strictly rejected with HTTP 409 Conflict');
    assert(doubleServeData.reason === 'ALREADY_SERVED', 'Reason is ALREADY_SERVED');
    assert(doubleServeData.message.includes('already collected'), 'Message indicates meal already collected');

    // -------------------------------------------------------------
    // Test 10: WhatsApp Notification Integration
    // -------------------------------------------------------------
    console.log('\nTest 10: WhatsApp Notification Format & Link Generation...');
    assert(verifyData.whatsAppResults.length > 0, 'WhatsApp result generated');
    const waResult = verifyData.whatsAppResults[0];
    assert(waResult.clickToChatUrl.includes('wa.me'), 'Click-to-chat fallback URL generated correctly');
    assert(waResult.rawText.includes('🍱 *RVCAS CANTEEN*'), 'Message includes college brand emoji & title');
    assert(waResult.rawText.includes(createdPass.passId), 'Message includes unique Pass ID');
    assert(waResult.rawText.includes(createdPass.secureToken), 'Message includes secure verification token');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
