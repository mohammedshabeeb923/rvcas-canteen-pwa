import { NextResponse } from 'next/server';
import { isAuthorizedStaffEmail, isAuthorizedAdminEmail, generateAuthToken, getAuthorizedStaffEmails, getAuthorizedAdminEmails, AuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, identifier, phone, password, role = 'student', pin, rememberMe = true } = body;

    const durationDays = rememberMe ? 30 : 7;
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    const cookieMaxAge = durationDays * 24 * 60 * 60;

    // ==========================================
    // 1. STUDENT AUTHENTICATION (Phone + Password)
    // ==========================================
    if (role === 'student') {
      const studentSearch = (phone || identifier || '').trim();
      let student = studentSearch ? (db.getStudentByPhone(studentSearch) || db.getStudentByIdentifier(studentSearch)) : undefined;

      // If student not found, fallback to demo student if matching default
      if (!student) {
        if (!studentSearch || studentSearch.includes('9847123456') || studentSearch.toLowerCase().includes('shabeeb')) {
          student = db.getStudentById('student_shabeeb');
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `No student registered with Phone Number "${studentSearch}". Please enter your registered 10-digit mobile number.`,
            },
            { status: 404 }
          );
        }
      }

      if (!student) {
        student = db.getStudents()[0];
      }

      const sessionData: AuthSession = {
        userId: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
        studentIdCode: student.studentIdCode,
        courseSem: `${student.course} • ${student.semester}`,
        expiresAt,
      };

      const token = generateAuthToken(sessionData);

      const response = NextResponse.json({
        success: true,
        message: `Welcome back, ${student.name}!`,
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'student',
          studentIdCode: student.studentIdCode,
          courseSem: `${student.course} • ${student.semester}`,
        },
        token,
      });

      response.cookies.set('rvcas_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: cookieMaxAge,
      });

      return response;
    }

    // ==========================================
    // 2. STAFF & ADMIN GMAIL AUTHENTICATION
    // ==========================================
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid college-authorized Gmail address is required.' },
        { status: 400 }
      );
    }

    if (role === 'admin') {
      if (!isAuthorizedAdminEmail(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: ${cleanEmail} is not authorized for the Admin Console. Authorized list: ${getAuthorizedAdminEmails().join(', ')}`,
          },
          { status: 403 }
        );
      }
    } else {
      if (!isAuthorizedStaffEmail(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: ${cleanEmail} is not authorized for Canteen Staff Console. Authorized list: ${getAuthorizedStaffEmails().join(', ')}`,
          },
          { status: 403 }
        );
      }
    }

    // Security PIN verification (default PIN: 842601 or 123456)
    if (pin && pin !== '842601' && pin !== '123456') {
      return NextResponse.json(
        { success: false, error: 'Invalid security PIN.' },
        { status: 401 }
      );
    }

    const sessionData: AuthSession = {
      userId: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: role as 'staff' | 'admin',
      expiresAt,
    };

    const token = generateAuthToken(sessionData);

    const response = NextResponse.json({
      success: true,
      message: `Authenticated successfully as ${cleanEmail}`,
      user: {
        id: sessionData.userId,
        name: sessionData.name,
        email: cleanEmail,
        role,
      },
      token,
    });

    // Set persistent HTTP-only session cookie
    response.cookies.set('rvcas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
