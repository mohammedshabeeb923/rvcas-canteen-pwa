import { NextResponse } from 'next/server';
import {
  generateAuthToken,
  isAuthorizedStaffEmail,
  isAuthorizedAdminEmail,
  AuthSession,
} from '@/lib/auth';
import { db } from '@/lib/db';
import { Student } from '@/lib/types';

export const dynamic = 'force-dynamic';

function decodeGoogleCredential(credential: string): { email?: string; name?: string; picture?: string; sub?: string } | null {
  try {
    const parts = credential.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (e) {
    console.error('Failed to decode Google credential:', e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { credential, email: directEmail, name: directName, picture: directPicture, role = 'student', selectedRole, phone } = body;

    let email = directEmail;
    let name = directName;
    let picture = directPicture;

    // Decode Google JWT credential if supplied via Google Identity Services
    if (credential) {
      const decoded = decodeGoogleCredential(credential);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || name;
        picture = decoded.picture || picture;
      }
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid Google email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    // Determine authorization and role
    const isAdmin = isAuthorizedAdminEmail(cleanEmail);
    const isStaff = isAuthorizedStaffEmail(cleanEmail);

    let effectiveRole: 'student' | 'hosteller' | 'faculty' | 'staff' | 'admin' = 'student';
    let effectiveType: 'day_scholar' | 'hosteller' | 'faculty' = 'day_scholar';

    if (isAdmin && (selectedRole === 'admin' || role === 'admin')) {
      effectiveRole = 'admin';
    } else if ((isStaff || isAdmin) && (selectedRole === 'staff' || role === 'staff')) {
      effectiveRole = 'staff';
    } else if (selectedRole === 'hosteller' || role === 'hosteller') {
      effectiveRole = 'hosteller';
      effectiveType = 'hosteller';
    } else if (selectedRole === 'faculty' || role === 'faculty') {
      effectiveRole = 'faculty';
      effectiveType = 'faculty';
    } else {
      effectiveRole = 'student';
      effectiveType = 'day_scholar';
    }

    // Look up or upsert student in database
    let student = db.getStudentByEmail(cleanEmail);
    if (!student) {
      // Check if student with matching phone exists
      if (phone) {
        student = db.getStudentByPhone(phone);
      }
    }

    const durationDays = 30; // 30-day persistent session
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    const cookieMaxAge = durationDays * 24 * 60 * 60;

    let finalUserId: string;
    let finalPhone: string = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    let finalCourseSem: string = 'BCA • Semester 3';
    let finalIdCode: string = `RVCAS/${new Date().getFullYear()}/BCA/${Math.floor(100 + Math.random() * 900)}`;

    if (effectiveRole === 'admin' || effectiveRole === 'staff') {
      finalUserId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    } else {
      if (student) {
        finalUserId = student.id;
        finalPhone = finalPhone || (student.phone || '');
        finalCourseSem = `${student.course} • ${student.semester}`;
        finalIdCode = student.studentIdCode;
        // Update profile picture and email if needed
        if (picture && !student.profilePhoto) {
          student.profilePhoto = picture;
          db.upsertStudent(student);
        }
      } else {
        finalUserId = `student_${cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')}`;
        const newStudent: Student = {
          id: finalUserId,
          name: cleanName,
          email: cleanEmail,
          phone: finalPhone || undefined,
          course: effectiveType === 'faculty' ? 'Faculty Member' : 'BCA',
          semester: effectiveType === 'faculty' ? 'Faculty' : 'Semester 3',
          studentIdCode: finalIdCode,
          profilePhoto: picture,
          studentType: effectiveType,
          hostelRoom: effectiveType === 'hosteller' ? 'Room 204' : undefined,
        };
        db.upsertStudent(newStudent);
        finalCourseSem = `${newStudent.course} • ${newStudent.semester}`;
      }
    }

    const sessionData: AuthSession = {
      userId: finalUserId,
      email: cleanEmail,
      phone: finalPhone || undefined,
      avatar: picture,
      name: cleanName,
      role: effectiveRole,
      studentType: effectiveType,
      studentIdCode: finalIdCode,
      courseSem: finalCourseSem,
      hostelRoom: effectiveType === 'hosteller' ? (student?.hostelRoom || 'Room 204') : undefined,
      expiresAt,
    };

    const token = generateAuthToken(sessionData);

    const userResponse = {
      id: sessionData.userId,
      name: sessionData.name,
      email: sessionData.email,
      phone: sessionData.phone,
      avatar: sessionData.avatar,
      role: sessionData.role,
      studentType: sessionData.studentType,
      studentIdCode: sessionData.studentIdCode,
      courseSem: sessionData.courseSem,
      hostelRoom: sessionData.hostelRoom,
    };

    const response = NextResponse.json({
      success: true,
      message: `Successfully authenticated with Google as ${cleanName}`,
      user: userResponse,
      token,
      needsPhone: !finalPhone || finalPhone.length < 10,
    });

    // Set persistent 30-day HTTP-only cookie
    response.cookies.set('rvcas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    return response;
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}
