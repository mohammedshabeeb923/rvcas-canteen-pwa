import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, reason: 'NOT_FOUND', message: 'Pass token is required' },
        { status: 400 }
      );
    }

    const pass = db.getPassByToken(token);

    if (!pass) {
      return NextResponse.json(
        {
          success: false,
          reason: 'NOT_FOUND',
          message: 'This meal pass could not be verified or does not exist.',
        },
        { status: 404 }
      );
    }

    if (pass.status === 'SERVED') {
      const servedTime = pass.servedAt
        ? new Date(pass.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'earlier today';

      return NextResponse.json({
        success: false,
        reason: 'ALREADY_SERVED',
        message: `This meal was already collected at ${servedTime}.`,
        pass,
      });
    }

    if (pass.status === 'EXPIRED') {
      return NextResponse.json({
        success: false,
        reason: 'EXPIRED',
        message: 'This meal pass has expired.',
        pass,
      });
    }

    if (pass.status === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        reason: 'CANCELLED',
        message: 'This meal pass was cancelled.',
        pass,
      });
    }

    return NextResponse.json({
      success: true,
      reason: 'VALID',
      message: 'Meal pass is valid and ready for collection.',
      pass,
    });
  } catch (error: any) {
    console.error('Error in /api/passes/verify:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
