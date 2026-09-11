import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = db.getDashboardStats();
    const passes = db.getAllPasses();

    // Map recent transactions
    const recentTransactions = passes.slice(0, 15).map(p => {
      const timeStr = p.createdAt
        ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '12:30 PM';

      return {
        id: p.id,
        time: timeStr,
        student: p.studentName,
        courseSem: p.studentCourseSem,
        passId: p.passId,
        amount: p.amount,
        status: p.status === 'SERVED' ? 'Served' : 'Purchased',
        servedAt: p.servedAt,
        servedBy: p.servedBy,
        secureToken: p.secureToken,
      };
    });

    return NextResponse.json({
      success: true,
      stats,
      recentTransactions,
      passes,
    });
  } catch (error: any) {
    console.error('Error in /api/dashboard/stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load dashboard stats' },
      { status: 500 }
    );
  }
}
