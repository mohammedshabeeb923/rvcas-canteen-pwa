import assert from 'assert';
import crypto from 'crypto';
import { createCashfreeOrder, verifyCashfreePayment, verifyCashfreeWebhookSignature } from '../lib/cashfree.ts';

const BASE_URL = 'http://localhost:3005';

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

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
  console.log('💳 TESTING CASHFREE PAYMENT GATEWAY INTEGRATION');
  console.log('====================================================\n');

  // Test 1: Direct library createCashfreeOrder
  console.log('Test 1: Cashfree Library Order Generation...');
  await asyncIt('Generates Cashfree Order with paymentSessionId', async () => {
    const order = await createCashfreeOrder({
      orderId: `test_cf_${Date.now()}`,
      amount: 40,
      customer: {
        id: 'student_shabeeb',
        name: 'Shabeeb',
        phone: '9876543210',
      },
    });

    assert(order.orderId, 'Should have orderId');
    assert(order.paymentSessionId, 'Should have paymentSessionId');
    assert.strictEqual(order.orderStatus, 'ACTIVE');
  });

  // Test 2: Webhook signature verification
  console.log('\nTest 2: Cashfree Webhook Signature Verification...');
  it('Validates authentic webhook HMAC signature', () => {
    const timestamp = String(Date.now());
    const rawBody = JSON.stringify({ event: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'ord_123' } } });
    const secret = process.env.CASHFREE_SECRET_KEY || 'rvcas_cashfree_dev_secret';
    const validSig = crypto.createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('base64');

    const isValid = verifyCashfreeWebhookSignature(timestamp, rawBody, validSig);
    assert.strictEqual(isValid, true, 'Authentic signature must be valid');
  });

  it('Rejects forged or tampered webhook signature', () => {
    const timestamp = String(Date.now());
    const rawBody = JSON.stringify({ event: 'PAYMENT_SUCCESS_WEBHOOK' });
    const forgedSig = 'invalid_forged_base64_signature==';

    const isValid = verifyCashfreeWebhookSignature(timestamp, rawBody, forgedSig);
    assert.strictEqual(isValid, false, 'Tampered signature must be rejected');
  });

  // Test 3: API Endpoint /api/orders/create
  console.log('\nTest 3: POST /api/orders/create (Cashfree Provider)...');
  let createdOrderId = null;
  let paymentSessionId = null;

  await asyncIt('Creates order with Cashfree session ID', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student_shabeeb',
        mealId: 'meal_today',
        quantity: 1,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.orderId, 'Should have orderId');
    assert(data.paymentSessionId, 'Should have Cashfree paymentSessionId');
    assert.strictEqual(data.amount, 40);

    createdOrderId = data.orderId;
    paymentSessionId = data.paymentSessionId;
  });

  // Test 4: API Endpoint /api/orders/verify
  console.log('\nTest 4: POST /api/orders/verify (Cashfree Verification)...');
  await asyncIt('Verifies Cashfree payment and issues digital meal pass', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: createdOrderId,
        cashfreeOrderId: createdOrderId,
        recipients: [
          {
            studentId: 'student_shabeeb',
            name: 'Shabeeb',
            courseSem: 'BCA • Semester 3',
          },
        ],
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.order.paymentStatus, 'PAID');
    assert(data.passes.length === 1, 'Should create exactly 1 pass');
    assert.strictEqual(data.passes[0].status, 'VALID');
    assert(data.passes[0].passId.startsWith('RVCAS-'), 'Pass ID must follow RVCAS format');
    assert(data.passes[0].secureToken, 'Pass must have secure token');
  });

  // Test 5: Idempotent duplicate verification
  console.log('\nTest 5: Idempotency on Repeated Verification...');
  await asyncIt('Returns original pass without re-issuing duplicate on replay', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: createdOrderId,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'Order was already verified and paid.');
    assert(data.passes.length === 1, 'Pass count must remain unchanged');
  });

  // Test 6: Multi-meal booking via Cashfree
  console.log('\nTest 6: Multi-Student Meal Booking (2 Meals = ₹80)...');
  await asyncIt('Creates and verifies multi-student Cashfree booking', async () => {
    const createRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student_shabeeb',
        mealId: 'meal_today',
        quantity: 2,
      }),
    });

    assert.strictEqual(createRes.status, 200);
    const createData = await createRes.json();
    assert.strictEqual(createData.amount, 80);

    const verifyRes = await fetch(`${BASE_URL}/api/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: createData.orderId,
        recipients: [
          { studentId: 'student_shabeeb', name: 'Shabeeb', courseSem: 'BCA • Sem 3' },
          { studentId: 'student_albin', name: 'Albin John', courseSem: 'B.Com • Sem 5' },
        ],
      }),
    });

    assert.strictEqual(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.passes.length, 2);
    assert.notStrictEqual(verifyData.passes[0].passId, verifyData.passes[1].passId);
  });

  console.log('\n====================================================');
  console.log(`🏁 CASHFREE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
