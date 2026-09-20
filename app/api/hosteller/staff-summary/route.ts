import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MealType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let date = searchParams.get('date');
    const mealType = searchParams.get('mealType') as MealType | null;
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // If no date provided, default to today's date formatted as YYYY-MM-DD
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    const summary = db.getHostellerMealSummary(date);
    let details = undefined;

    if (includeDetails) {
      details = db.getHostellerMealDetails(date, mealType || undefined);
    }

    return NextResponse.json({
      success: true,
      summary,
      details,
    });
  } catch (error: any) {
    console.error('Error in GET /api/hosteller/staff-summary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load staff summary' },
      { status: 500 }
    );
  }
}
