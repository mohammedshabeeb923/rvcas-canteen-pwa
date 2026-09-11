import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCashfreeOrder } from '@/lib/cashfree';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId = 'student_shabeeb', mealId = 'meal_today', quantity = 1 } = body;

    // Strict validation
    const meal = db.getMeals().find(m => m.id === mealId) || db.getTodayMeal();
    if (!meal || !meal.available) {
      return NextResponse.json({ error: 'Meal is currently unavailable.' }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(10, parseInt(String(quantity), 10) || 1));
    const serverValidatedAmount = meal.price * qty; // Strictly calculated server-side

    const student = db.getStudentById(studentId) || db.getStudents()[0];
    const orderId = `ord_cf_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const idempotencyKey = `idemp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Create Cashfree Order
    const cfOrder = await createCashfreeOrder({
      orderId,
      amount: serverValidatedAmount,
      currency: 'INR',
      customer: {
        id: student.id,
        name: student.name,
        email: student.email || `${student.id}@rvcas.ac.in`,
        phone: student.phone || '9876543210',
      },
      notes: {
        orderId,
        studentId: student.id,
        mealName: meal.name,
        quantity: String(qty),
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
