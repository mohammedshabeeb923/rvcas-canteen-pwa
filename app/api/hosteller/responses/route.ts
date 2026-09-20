import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MealType, HostellerResponseState } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const date = searchParams.get('date') || undefined;

    const responses = db.getHostellerResponses(date, userId);

    return NextResponse.json({
      success: true,
      responses,
    });
  } catch (error: any) {
    console.error('Error in GET /api/hosteller/responses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hosteller responses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, date, responses } = body;

    if (!userId || !date || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, date, responses array' },
        { status: 400 }
      );
    }

    // Validate responses payload
    const validMealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'];
    const validStates: HostellerResponseState[] = ['NEED_MEAL', 'DONT_NEED_MEAL'];

    for (const item of responses) {
      if (!validMealTypes.includes(item.mealType)) {
        return NextResponse.json(
          { success: false, error: `Invalid mealType: ${item.mealType}` },
          { status: 400 }
        );
      }
      if (!validStates.includes(item.response)) {
        return NextResponse.json(
          { success: false, error: `Invalid response: ${item.response}. Must be NEED_MEAL or DONT_NEED_MEAL` },
          { status: 400 }
        );
      }
    }

    const result = db.saveHostellerMealResponses(userId, date, responses);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      responses: result.responses,
    });
  } catch (error: any) {
    console.error('Error in POST /api/hosteller/responses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save hosteller responses' },
      { status: 500 }
    );
  }
}
