import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree';
import { generatePassId, generateSecureToken } from '@/lib/pass-generator';
import { sendWhatsAppMealNotification } from '@/lib/whatsapp';
import { MealPass } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get('x-webhook-timestamp') || '';
    const signature = req.headers.get('x-webhook-signature') || '';

    // Verify webhook signature
    const isValid = verifyCashfreeWebhookSignature(timestamp, rawBody, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.warn('[Security Alert] ❌ Invalid Cashfree Webhook Signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const orderData = event.data?.order || event.data;
    const paymentData = event.data?.payment;
    const orderId = orderData?.order_id;

    if (!orderId) {
      return NextResponse.json({ message: 'No order_id in webhook payload' }, { status: 200 });
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ message: `Order ${orderId} not found` }, { status: 200 });
    }

    // If payment succeeded on Cashfree
    const paymentStatus = paymentData?.payment_status || orderData?.order_status;
    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
      if (order.paymentStatus !== 'PAID') {
        const paymentId = String(paymentData?.cf_payment_id || `cf_wh_${Date.now()}`);
        db.updateOrderStatus(orderId, 'PAID', paymentId);

        // Generate passes if not already generated
        const existingPasses = db.getAllPasses().filter(p => p.orderId === order.id);
        if (existingPasses.length === 0) {
          const meal = db.getMeals().find(m => m.id === order.mealId) || db.getTodayMeal();
          const primaryStudent = db.getStudentById(order.studentId) || db.getStudents()[0];
          const count = order.quantity || 1;

          const todayFormatted = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          for (let i = 0; i < count; i++) {
            const passId = generatePassId();
            const secureToken = generateSecureToken();

            const newPass: MealPass = {
              id: `pass_cf_${Date.now()}_${i}`,
              passId,
              secureToken,
              orderId: order.id,
              studentId: primaryStudent.id,
              studentName: primaryStudent.name,
              studentCourseSem: `${primaryStudent.course} • ${primaryStudent.semester}`,
              mealId: meal.id,
              mealName: meal.name,
              mealDate: todayFormatted,
              amount: 40,
              status: 'VALID',
              createdAt: new Date().toISOString(),
            };

            db.createPass(newPass);

            // WhatsApp Dispatch
            await sendWhatsAppMealNotification({
              studentName: primaryStudent.name,
              courseSem: `${primaryStudent.course} • ${primaryStudent.semester}`,
              mealName: meal.name,
              amount: 40,
              dateStr: todayFormatted,
              passId,
              secureToken,
            }).catch(e => console.error('Webhook WhatsApp dispatch failed:', e));
          }
        }
      }
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED') {
      if (order.paymentStatus === 'PENDING') {
        db.updateOrderStatus(orderId, 'FAILED');
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err: any) {
    console.error('Error processing Cashfree webhook:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
