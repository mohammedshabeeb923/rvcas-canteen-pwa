export interface WhatsAppNotificationPayload {
  studentName: string;
  courseSem: string;
  mealName: string;
  amount: number;
  dateStr: string;
  passId: string;
  secureToken: string;
  baseUrl?: string;
  staffPhoneNumber?: string; // e.g. "919876543210"
}

export interface WhatsAppNotificationResult {
  mode: 'cloud_api' | 'click_to_chat';
  success: boolean;
  message: string;
  clickToChatUrl: string;
  rawText: string;
  apiResponse?: any;
}

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const CANTEEN_STAFF_PHONE = process.env.CANTEEN_STAFF_PHONE || '919876543210';

export const isWhatsAppCloudConfigured = Boolean(
  WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID
);

/**
 * Builds the canonical WhatsApp notification message text
 */
export function buildWhatsAppMessageText(payload: WhatsAppNotificationPayload): string {
  const origin = payload.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${origin}/verify-pass/${payload.secureToken}`;

  return `🍱 *RVCAS CANTEEN*
NEW MEAL BOOKING

*Student:* ${payload.studentName}
*Course:* ${payload.courseSem}
*Meal:* ${payload.mealName}
*Amount:* ₹${payload.amount}
*Date:* ${payload.dateStr}
*Pass ID:* ${payload.passId}

Payment verified ✓

*Verify Meal Pass:*
${verifyUrl}`;
}

/**
 * Generates a direct WhatsApp click-to-chat URL with prefilled verification message.
 * Fallback entry point when Cloud API is in sandbox/development mode.
 */
export function buildWhatsAppClickToChatUrl(
  phone: string,
  messageText: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Production-ready WhatsApp Notification Service
 * Sends via WhatsApp Cloud API if credentials exist, otherwise falls back
 * to prefilled Click-to-chat URL with full logging.
 */
export async function sendWhatsAppMealNotification(
  payload: WhatsAppNotificationPayload
): Promise<WhatsAppNotificationResult> {
  const targetPhone = payload.staffPhoneNumber || CANTEEN_STAFF_PHONE;
  const messageText = buildWhatsAppMessageText(payload);
  const clickToChatUrl = buildWhatsAppClickToChatUrl(targetPhone, messageText);

  if (isWhatsAppCloudConfigured) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: targetPhone,
            type: 'text',
            text: {
              preview_url: true,
              body: messageText,
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`[WhatsApp Cloud API] ✅ Notification sent to ${targetPhone} for Pass ${payload.passId}`);
        return {
          mode: 'cloud_api',
          success: true,
          message: 'WhatsApp notification sent via Cloud API',
          clickToChatUrl,
          rawText: messageText,
          apiResponse: data,
        };
      } else {
        console.warn(`[WhatsApp Cloud API] ⚠️ Delivery failed, falling back:`, data);
      }
    } catch (error) {
      console.error(`[WhatsApp Cloud API] Error contacting Meta Graph API:`, error);
    }
  }

  // Development Fallback: Click-to-chat
  console.log(`[WhatsApp Service] 📲 Click-to-chat entry point generated for Pass ${payload.passId}`);
  return {
    mode: 'click_to_chat',
    success: true,
    message: 'WhatsApp notification ready via secure Click-to-Chat',
    clickToChatUrl,
    rawText: messageText,
  };
}
