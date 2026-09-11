import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCashfreePayment } from '@/lib/cashfree';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { generatePassId, generateSecureToken } from '@/lib/pass-generator';
import { sendWhatsAppMealNotification } from '@/lib/whatsapp';
import { MealPass } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      cashfreeOrderId,
      paymentId: clientPaymentId,
      // Razorpay backward-compatibility fields
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      recipients = [], // Array of students if multi-booking: [{ name, courseSem, studentId }]
    } = body;

    const targetOrderId = orderId || cashfreeOrderId || razorpayOrderId;

    // 1. Validate mandatory payment parameters
    if (!targetOrderId) {
      return NextResponse.json(
        { error: 'Missing mandatory orderId field for payment verification.' },
        { status: 400 }
      );
    }

    // 2. Fetch existing order from DB
    let order = db.getOrderById(targetOrderId);
    if (!order) {
      // In serverless environments (e.g. Vercel), the order creation lambda and verification lambda
      // might be different containers before Supabase is connected. Auto-reconstruct order safely:
      const qty = recipients.length > 0 ? recipients.length : 1;
      const meal = db.getTodayMeal();
      order = db.createOrder({
        id: targetOrderId,
        studentId: recipients[0]?.studentId || 'student_shabeeb',
        mealId: meal.id,
        quantity: qty,
        amount: meal.price * qty,
        paymentProvider: 'cashfree',
        cashfreeOrderId: targetOrderId,
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Check Idempotency: If already marked PAID, return existing passes safely
    if (order.paymentStatus === 'PAID') {
      const existingPasses = db.getAllPasses().filter(p => p.orderId === order.id);
      return NextResponse.json({
        success: true,
        message: 'Order was already verified and paid.',
        order,
        passes: existingPasses,
      });
    }

    let recordedPaymentId = clientPaymentId || razorpayPaymentId || `cf_pay_${Date.now()}`;

    // 4. Verification based on payment provider
    if (order.paymentProvider === 'cashfree' || !razorpaySignature) {
      const cfResult = await verifyCashfreePayment(order.id);
      if (!cfResult.isPaid) {
        console.warn(`[Security Alert] ❌ Cashfree verification failed for Order ${order.id}: ${cfResult.message}`);
        db.updateOrderStatus(order.id, 'FAILED');
        return NextResponse.json(
          { error: `Cashfree payment verification failed: ${cfResult.message}` },
          { status: 400 }
        );
      }
      recordedPaymentId = cfResult.paymentId || recordedPaymentId;
    } else {
      // Razorpay fallback verification
      const isValidSignature = verifyRazorpaySignature({
        razorpayOrderId: razorpayOrderId || order.razorpayOrderId || '',
        razorpayPaymentId: razorpayPaymentId || '',
        razorpaySignature: razorpaySignature || '',
      });

      if (!isValidSignature) {
        console.warn(`[Security Alert] ❌ Invalid Razorpay signature for Order ${order.id}`);
        db.updateOrderStatus(order.id, 'FAILED');
        return NextResponse.json(
          { error: 'Payment signature verification failed. Untrusted payment.' },
          { status: 400 }
        );
      }
    }

    // 5. Atomic Update Order Status to PAID
    db.updateOrderStatus(order.id, 'PAID', recordedPaymentId);

    // 6. Fetch Meal details
    const meal = db.getMeals().find(m => m.id === order.mealId) || db.getTodayMeal();
    const primaryStudent = db.getStudentById(order.studentId) || db.getStudents()[0];

    const count = order.quantity || 1;
    const createdPasses: MealPass[] = [];
    const whatsAppResults = [];

    // Date formatting (e.g., "9 September 2026")
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // 7. Generate Independent Meal Pass(es)
    for (let i = 0; i < count; i++) {
      const recipient = recipients[i] || {};
      const studentName = recipient.name || primaryStudent.name;
      const studentCourseSem = recipient.courseSem || `${primaryStudent.course} • ${primaryStudent.semester}`;
      const studentId = recipient.studentId || primaryStudent.id;

      const passId = generatePassId();
      const secureToken = generateSecureToken();

      const newPass: MealPass = {
        id: `pass_${Date.now()}_${i}`,
        passId,
        secureToken,
        orderId: order.id,
        studentId,
        studentName,
        studentCourseSem,
        mealId: meal.id,
        mealName: meal.name,
        mealDate: todayFormatted,
        amount: 40,
        status: 'VALID',
        createdAt: new Date().toISOString(),
      };

      const savedPass = db.createPass(newPass);
      createdPasses.push(savedPass);

      // 8. Dispatch WhatsApp Notification with Secure Verification Link
      const waResult = await sendWhatsAppMealNotification({
        studentName,
        courseSem: studentCourseSem,
        mealName: meal.name,
        amount: 40,
        dateStr: todayFormatted,
        passId,
        secureToken,
      });

      whatsAppResults.push({
        passId,
        ...waResult,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and meal passes issued successfully.',
      order: {
        ...order,
        paymentStatus: 'PAID',
        razorpayPaymentId,
      },
      passes: createdPasses,
      whatsAppResults,
    });
  } catch (error: any) {
    console.error('Error in /api/orders/verify:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
