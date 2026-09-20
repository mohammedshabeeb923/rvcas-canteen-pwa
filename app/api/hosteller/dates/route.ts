import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const dates = db.getSpecialMealDates().filter(d => d.isActive);
    let userResponses: any[] = [];

    if (userId) {
      userResponses = db.getHostellerResponses(undefined, userId);
    }

    return NextResponse.json({
      success: true,
      dates,
      userResponses,
    });
  } catch (error: any) {
    console.error('Error in /api/hosteller/dates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load special dates' },
      { status: 500 }
    );
  }
}
