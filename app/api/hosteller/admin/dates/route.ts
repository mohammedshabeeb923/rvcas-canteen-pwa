import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dates = db.getSpecialMealDates();
    return NextResponse.json({
      success: true,
      dates,
    });
  } catch (error: any) {
    console.error('Error in GET /api/hosteller/admin/dates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.date) {
      return NextResponse.json(
        { success: false, error: 'Date is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const specialDate = db.createOrUpdateSpecialMealDate(body);
    return NextResponse.json({
      success: true,
      message: 'Special meal date saved successfully.',
      specialDate,
    });
  } catch (error: any) {
    console.error('Error in POST /api/hosteller/admin/dates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save special date' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, date, finalizedBy } = body;

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    if (action === 'finalize') {
      const result = db.finalizeMealCount(date, finalizedBy || 'Staff');
      return NextResponse.json(result);
    } else if (action === 'reopen') {
      const result = db.reopenMealCount(date);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "finalize" or "reopen"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error in PUT /api/hosteller/admin/dates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update meal status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const date = searchParams.get('date');
    const target = id || date;

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'id or date is required' },
        { status: 400 }
      );
    }

    const deleted = db.deleteSpecialMealDate(target);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Special meal date removed.' : 'Special meal date not found.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/hosteller/admin/dates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete special date' },
      { status: 500 }
    );
  }
}
