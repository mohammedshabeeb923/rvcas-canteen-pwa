import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCashfreeOrder } from '@/lib/cashfree';
import { verifyAuthToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId: reqStudentId,
      mealId = 'meal_today',
      quantity = 1,
      phone: reqPhone,
      customerPhone,
      customerName,
      customerEmail,
    } = body;

    // Check token from cookie or header to identify authentic student
    let sessionUser: any = null;
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/rvcas_session=([^;]+)/);
      const authHeader = req.headers.get('authorization');
      const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : match ? match[1] : '';
      if (token) {
        sessionUser = verifyAuthToken(token);
      }
    } catch (e) {}

    const resolvedStudentId = sessionUser?.userId || reqStudentId || 'student_shabeeb';

    // Strict validation
    const meal = db.getMeals().find(m => m.id === mealId) || db.getTodayMeal();
    if (!meal || !meal.available) {
      return NextResponse.json({ error: 'Meal is currently unavailable.' }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(10, parseInt(String(quantity), 10) || 1));
    const serverValidatedAmount = meal.price * qty; // Strictly calculated server-side

    const student = db.getStudentById(resolvedStudentId) || db.getStudents()[0];
    const orderId = `ord_cf_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const idempotencyKey = `idemp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Resolve customer phone
    const rawPhone = customerPhone || reqPhone || sessionUser?.phone || student.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);

    if (cleanPhone && cleanPhone.length === 10 && student.id) {
      db.updateStudentPhone(student.id, cleanPhone);
    }

    const finalPhone = cleanPhone.length === 10 ? cleanPhone : (student.phone || '9876543210');
    const finalName = customerName || sessionUser?.name || student.name || 'RVCAS Student';
    const finalEmail = customerEmail || sessionUser?.email || student.email || `${student.id}@rvcas.ac.in`;

    // Create Cashfree Order
    const cfOrder = await createCashfreeOrder({
      orderId,
      amount: serverValidatedAmount,
      currency: 'INR',
      customer: {
        id: student.id,
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
      },
      notes: {
        orderId,
        studentId: student.id,
        mealName: meal.name,
        quantity: String(qty),
        customerPhone: finalPhone,
      },
    });

    // Save pending order to database
    db.createOrder({
      id: orderId,
      studentId: student.id,
      mealId: meal.id,
      quantity: qty,
      amount: serverValidatedAmount,
      paymentProvider: 'cashfree',
      cashfreeOrderId: cfOrder.orderId,
      paymentSessionId: cfOrder.paymentSessionId,
      paymentStatus: 'PENDING',
      idempotencyKey,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderId,
      paymentSessionId: cfOrder.paymentSessionId,
      cashfreeOrderId: cfOrder.orderId,
      // Backward-compatible field
      razorpayOrderId: cfOrder.orderId,
      amount: serverValidatedAmount,
      currency: 'INR',
      mealName: meal.name,
      quantity: qty,
      isSimulated: cfOrder.isSimulated,
      environment: cfOrder.environment,
      student: {
        id: student.id,
        name: student.name,
        courseSem: `${student.course} • ${student.semester}`,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/orders/create:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
