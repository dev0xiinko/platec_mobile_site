import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get admin ID from token
    const token = request.cookies.get('token')?.value;
    const decoded = token ? verifyToken(token) : null;

    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const today = new Date().toISOString().split('T')[0];

    // Get total students count (filtered by class if provided, and by admin)
    let studentCountQuery = supabase.from('students').select('*', { count: 'exact', head: true })
      .eq('admin_id', decoded.id);
    if (classId) {
      const { data: enrolledStudents } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .eq('class_id', classId);
      const enrolledIds = enrolledStudents?.map(e => e.student_id) || [];
      if (enrolledIds.length > 0) {
        studentCountQuery = studentCountQuery.in('id', enrolledIds);
      }
    }
    const { count: totalStudents } = await studentCountQuery;

    // Get today's attendance (filtered by class if provided)
    let todayQuery = supabase.from('attendance').select('status, student_id').eq('date', today);
    if (classId) {
      todayQuery = todayQuery.eq('class_id', classId);
    }
    const { data: todayAttendance } = await todayQuery;

    // Filter attendance by admin's students
    const { data: adminStudents } = await supabase
      .from('students')
      .select('id')
      .eq('admin_id', decoded.id);
    const adminStudentIds = new Set(adminStudents?.map(s => s.id) || []);
    const filteredTodayAttendance = todayAttendance?.filter(a => adminStudentIds.has(a.student_id)) || [];

    const todayStats = {
      present: filteredTodayAttendance?.filter((a) => a.status === 'present').length || 0,
      absent: filteredTodayAttendance?.filter((a) => a.status === 'absent').length || 0,
      late: filteredTodayAttendance?.filter((a) => a.status === 'late').length || 0,
      notMarked: (totalStudents || 0) - (filteredTodayAttendance?.length || 0),
    };

    // Get this week's attendance for trend
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    let weeklyQuery = supabase
      .from('attendance')
      .select('date, status, student_id')
      .gte('date', weekStartStr)
      .lte('date', today);
    if (classId) {
      weeklyQuery = weeklyQuery.eq('class_id', classId);
    }
    const { data: weeklyAttendance } = await weeklyQuery;

    // Filter weekly attendance by admin's students
    const filteredWeeklyAttendance = weeklyAttendance?.filter(a => adminStudentIds.has(a.student_id)) || [];

    // Group by date
    const weeklyTrend: Record<string, { present: number; absent: number; late: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyTrend[dateStr] = { present: 0, absent: 0, late: 0 };
    }

    filteredWeeklyAttendance?.forEach((record) => {
      if (weeklyTrend[record.date]) {
        weeklyTrend[record.date][record.status as 'present' | 'absent' | 'late']++;
      }
    });

    // Get recent activity (last 10 attendance records)
    let activityQuery = supabase
      .from('attendance')
      .select(`
        id, date, status, created_at,
        students (id, student_id, name, admin_id)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    if (classId) {
      activityQuery = activityQuery.eq('class_id', classId);
    }
    const { data: recentActivity } = await activityQuery;

    // Filter recent activity by admin's students
    const transformedActivity = recentActivity
      ?.filter(record => record.students?.admin_id === decoded.id)
      ?.map((record) => ({
        id: record.id,
        date: record.date,
        status: record.status,
        createdAt: record.created_at,
        student: record.students,
      }));

    // Course distribution (only for admin's students)
    const { data: courseData } = await supabase
      .from('students')
      .select('course')
      .eq('admin_id', decoded.id);

    const courseDistribution: Record<string, number> = {};
    courseData?.forEach((s) => {
      courseDistribution[s.course] = (courseDistribution[s.course] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      dashboard: {
        totalStudents: totalStudents || 0,
        today: todayStats,
        weeklyTrend: Object.entries(weeklyTrend).map(([date, stats]) => ({
          date,
          ...stats,
        })),
        recentActivity: transformedActivity,
        courseDistribution: Object.entries(courseDistribution).map(([course, count]) => ({
          course,
          count,
        })),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
