import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { generatePassId, generateSecureToken } from '@/lib/pass-generator';
import { sendWhatsAppMealNotification } from '@/lib/whatsapp';
import { MealPass } from '@/lib/types';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rvcas_webhook_secret_999';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      const rzpOrderId = payment?.order_id;
      const rzpPaymentId = payment?.id;

      if (rzpOrderId) {
        const order = db.getOrderById(rzpOrderId);
        if (order && order.paymentStatus !== 'PAID') {
          db.updateOrderStatus(order.id, 'PAID', rzpPaymentId);

          // Generate pass if not yet created by client verification
          const existingPasses = db.getAllPasses().filter(p => p.orderId === order.id);
          if (existingPasses.length === 0) {
            const student = db.getStudentById(order.studentId) || db.getStudents()[0];
            const meal = db.getMeals().find(m => m.id === order.mealId) || db.getTodayMeal();
            const todayFormatted = new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            for (let i = 0; i < (order.quantity || 1); i++) {
              const passId = generatePassId();
              const secureToken = generateSecureToken();
              const newPass: MealPass = {
                id: `pass_wh_${Date.now()}_${i}`,
                passId,
                secureToken,
                orderId: order.id,
                studentId: student.id,
                studentName: student.name,
                studentCourseSem: `${student.course} • ${student.semester}`,
                mealId: meal.id,
                mealName: meal.name,
                mealDate: todayFormatted,
                amount: 40,
                status: 'VALID',
                createdAt: new Date().toISOString(),
              };
              db.createPass(newPass);

              await sendWhatsAppMealNotification({
                studentName: student.name,
                courseSem: `${student.course} • ${student.semester}`,
                mealName: meal.name,
                amount: 40,
                dateStr: todayFormatted,
                passId,
                secureToken,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
