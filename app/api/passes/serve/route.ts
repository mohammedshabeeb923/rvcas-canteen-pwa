import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuthToken, isAuthorizedStaffEmail } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, servedBy } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, reason: 'NOT_FOUND', message: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify staff identity: Check Authorization header, cookie, or provided staff email
    let staffIdentifier = servedBy || 'Staff Counter 1';

    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie') || '';
    let sessionToken = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    } else {
      const match = cookieHeader.match(/rvcas_session=([^;]+)/);
      if (match) sessionToken = match[1];
    }

    if (sessionToken) {
      const session = verifyAuthToken(sessionToken);
      if (session && session.email && isAuthorizedStaffEmail(session.email)) {
        staffIdentifier = `${session.email} (Counter)`;
      }
    }

    // Atomic execution with single-use guarantee
    const result = db.markPassAsServed(token, staffIdentifier);

    if (!result.success) {
      return NextResponse.json(result, { status: 409 }); // 409 Conflict if already served/invalid
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/passes/serve:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
