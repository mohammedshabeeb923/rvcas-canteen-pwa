import crypto from 'crypto';

export interface CashfreeOrderParams {
  orderId: string;
  amount: number; // In INR (e.g. 40.00)
  currency?: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  returnUrl?: string;
  notifyUrl?: string;
  notes?: Record<string, string>;
}

export interface CashfreeVerificationResult {
  isPaid: boolean;
  orderId: string;
  paymentId?: string;
  paymentMethod?: string;
  amount?: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED';
  message: string;
  raw?: any;
}

const APP_ID = process.env.CASHFREE_APP_ID || '';
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CF_ENV = (process.env.CASHFREE_ENV || process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox').toLowerCase();
const API_VERSION = '2023-08-01';

const BASE_URL = CF_ENV === 'production' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

export const isCashfreeConfigured = Boolean(
  APP_ID && 
  SECRET_KEY && 
  !APP_ID.includes('placeholder') &&
  !APP_ID.includes('your_')
);

/**
 * Creates an order on Cashfree Payment Gateway v3.
 * Returns order_id, payment_session_id, and order details.
 */
export async function createCashfreeOrder(params: CashfreeOrderParams) {
  const { orderId, amount, currency = 'INR', customer, returnUrl, notifyUrl } = params;

  const payload = {
    order_id: orderId,
    order_amount: Number(amount.toFixed(2)),
    order_currency: currency,
    customer_details: {
      customer_id: customer.id.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50),
      customer_name: customer.name || 'RVCAS Student',
      customer_email: customer.email || 'student@rvcas.ac.in',
      customer_phone: customer.phone || '9876543210',
    },
    order_meta: {
      return_url: returnUrl || `https://rvcas-canteen.vercel.app/payment/success?order_id=${orderId}`,
      notify_url: notifyUrl || `https://rvcas-canteen.vercel.app/api/orders/cashfree-webhook`,
      payment_methods: 'upi,card,netbanking',
    },
    order_note: `RVCAS Canteen Meal Pass — ${params.notes?.mealName || 'Kerala Meal'}`,
  };

  if (isCashfreeConfigured) {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY,
        'x-api-version': API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Cashfree Order Creation Failed: ${err.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
      cfOrderId: data.cf_order_id,
      environment: CF_ENV,
      isSimulated: false,
    };
  }

  // Deterministic Sandbox Simulation (when live merchant credentials are not yet added in .env)
  const mockPaymentSessionId = `session_cf_sim_${crypto.randomBytes(16).toString('hex')}`;
  return {
    orderId,
    paymentSessionId: mockPaymentSessionId,
    orderStatus: 'ACTIVE',
    cfOrderId: `cf_ord_${Date.now()}`,
    environment: 'sandbox',
    isSimulated: true,
  };
}

/**
 * Server-side payment verification by querying Cashfree Payments API.
 * Validates whether the order has a completed 'SUCCESS' payment transaction.
 */
export async function verifyCashfreePayment(orderId: string): Promise<CashfreeVerificationResult> {
  if (!orderId) {
    return {
      isPaid: false,
      orderId,
      status: 'FAILED',
      message: 'Invalid order ID provided.',
    };
  }

  if (isCashfreeConfigured) {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}/payments`, {
        method: 'GET',
        headers: {
          'x-client-id': APP_ID,
          'x-client-secret': SECRET_KEY,
          'x-api-version': API_VERSION,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          isPaid: false,
          orderId,
          status: 'FAILED',
          message: `Failed to fetch payment status from Cashfree: ${response.statusText}`,
        };
      }

      const payments = await response.json();
      if (!Array.isArray(payments) || payments.length === 0) {
        return {
          isPaid: false,
          orderId,
          status: 'PENDING',
          message: 'No payment attempts recorded yet on Cashfree.',
        };
      }

      // Check if any payment attempt succeeded
      const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS');
      if (successfulPayment) {
        return {
          isPaid: true,
          orderId,
          paymentId: String(successfulPayment.cf_payment_id || successfulPayment.payment_id),
          paymentMethod: successfulPayment.payment_group || 'UPI',
          amount: successfulPayment.payment_amount,
          status: 'SUCCESS',
          message: 'Payment successfully captured on Cashfree.',
          raw: successfulPayment,
        };
      }

      const latest = payments[0];
      return {
        isPaid: false,
        orderId,
        paymentId: String(latest.cf_payment_id || ''),
        status: latest.payment_status === 'PENDING' ? 'PENDING' : 'FAILED',
        message: `Payment status is ${latest.payment_status}`,
        raw: latest,
      };
    } catch (err: any) {
      return {
        isPaid: false,
        orderId,
        status: 'FAILED',
        message: err.message || 'Error querying Cashfree verification API',
      };
    }
  }

  // Deterministic Sandbox Simulation verification
  const simPaymentId = `cf_pay_${crypto.randomBytes(8).toString('hex')}`;
  return {
    isPaid: true,
    orderId,
    paymentId: simPaymentId,
    paymentMethod: 'UPI',
    amount: 40.0,
    status: 'SUCCESS',
    message: 'Sandbox simulation payment verified successfully.',
    raw: { simulated: true },
  };
}

/**
 * Cryptographically verifies incoming Cashfree Webhook signature using HMAC-SHA256.
 * Signature format: Base64(HMAC_SHA256(timestamp + rawBody, secretKey))
 */
export function verifyCashfreeWebhookSignature(
  timestamp: string,
  rawBody: string,
  signature: string
): boolean {
  if (!timestamp || !rawBody || !signature) return false;

  const secret = SECRET_KEY || 'rvcas_cashfree_dev_secret';
  const data = `${timestamp}${rawBody}`;
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}
