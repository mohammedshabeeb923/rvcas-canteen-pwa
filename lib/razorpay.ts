import crypto from 'crypto';

export interface RazorpayOrderParams {
  amount: number; // in INR
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

const KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RVCASCanteen2026';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rvcas_canteen_mock_secret_test_key_9999';

export const isRazorpayLive = Boolean(
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET && 
  !process.env.RAZORPAY_KEY_ID.includes('test_RVCAS')
);

/**
 * Creates a Razorpay Order server-side.
 * Amount in paise (1 INR = 100 paise)
 */
export async function createRazorpayOrder(params: RazorpayOrderParams) {
  const amountInPaise = Math.round(params.amount * 100);

  if (isRazorpayLive) {
    const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Razorpay Order creation failed: ${err.error?.description || response.statusText}`);
    }

    return await response.json();
  }

  // Deterministic sandbox simulated order
  const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  return {
    id: mockOrderId,
    entity: 'order',
    amount: amountInPaise,
    amount_paid: 0,
    amount_due: amountInPaise,
    currency: 'INR',
    receipt: params.receipt,
    status: 'created',
    attempts: 0,
    notes: params.notes,
    created_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * Cryptographically verifies the Razorpay payment signature server-side.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyRazorpaySignature(params: RazorpayVerificationParams): boolean {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  // In sandbox simulation, allow valid simulated signature or genuine match
  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(text)
    .digest('hex');

  // Strict constant-time comparison
  try {
    const match = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'hex'),
      Buffer.from(razorpaySignature, 'hex')
    );
    if (match) return true;
  } catch {
    // If length mismatch or malformed hex
  }

  // If running in development sandbox simulator with simulated test signature
  if (!isRazorpayLive && razorpaySignature.startsWith('sig_rvcas_sandbox_')) {
    return true;
  }

  return false;
}

/**
 * Generates client sandbox payment details for testing without live keys.
 */
export function generateSandboxPayment(orderId: string) {
  const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
  const text = `${orderId}|${paymentId}`;
  const signature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(text)
    .digest('hex');

  return {
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature,
  };
}
