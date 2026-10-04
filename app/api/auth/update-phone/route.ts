import { NextResponse } from 'next/server';
import { verifyAuthToken, generateAuthToken, AuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, studentId } = body;

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'A valid 10-digit Indian mobile number is required.' },
        { status: 400 }
      );
    }

    // Check token from cookie or header
    let token = '';
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/rvcas_session=([^;]+)/);
      if (match) token = match[1];
    }

    let session: AuthSession | null = token ? verifyAuthToken(token) : null;
    const targetId = session?.userId || studentId;

    if (targetId) {
      db.updateStudentPhone(targetId, cleanPhone);
    }

    if (session) {
      session.phone = cleanPhone;
      const newToken = generateAuthToken(session);

      const response = NextResponse.json({
        success: true,
        message: 'Phone number updated successfully',
        phone: cleanPhone,
        token: newToken,
        user: {
          id: session.userId,
          name: session.name,
          email: session.email,
          phone: cleanPhone,
          avatar: session.avatar,
          role: session.role,
          studentType: session.studentType,
          studentIdCode: session.studentIdCode,
          courseSem: session.courseSem,
        },
      });

      response.cookies.set('rvcas_session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number updated',
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error('Error updating phone:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update phone' },
      { status: 500 }
    );
  }
}
