import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { createAbsenceNotification, createLateNotification } from '@/lib/notifications';

interface AttendanceWithStudent {
  id: string;
  date: string;
  status: string;
  remarks: string | null;
  class_id: string | null;
  created_at: string;
  students: {
    id: string;
    student_id: string;
    name: string;
    course: string;
    year: number;
    section: string;
  };
}

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    // Get admin ID from cookie token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('attendance')
      .select(`
        id, date, status, remarks, class_id, created_at,
        students!inner (id, student_id, name, course, year, section, admin_id)
      `, { count: 'exact' });

    // Apply filters - filter by admin_id through students table
    query = query.eq('students.admin_id', payload.id);
    if (date) query = query.eq('date', date);
    if (studentId) query = query.eq('student_id', studentId);
    if (classId) query = query.eq('class_id', classId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching attendance:', error);
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }

    // Cast and transform data to expected format
    const records = data as unknown as AttendanceWithStudent[];
    const transformedRecords = records?.map(record => ({
      id: record.id,
      date: record.date,
      status: record.status,
      remarks: record.remarks,
      classId: record.class_id,
      createdAt: record.created_at,
      student: record.students,
    }));

    return NextResponse.json({
      success: true,
      records: transformedRecords,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create attendance record
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, date, status, remarks, classId } = await request.json();

    if (!studentId || !date || !status) {
      return NextResponse.json(
        { error: 'Student ID, date, and status are required' },
        { status: 400 }
      );
    }

    // Verify student belongs to this admin
    const { data: student } = await supabase
      .from('students')
      .select('id, admin_id')
      .eq('id', studentId)
      .single();

    if (!student || student.admin_id !== payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upsert attendance record - uses composite unique (student_id, date, class_id)
    const { data: attendance, error } = await supabase
      .from('attendance')
      .upsert(
        {
          student_id: studentId,
          date,
          status,
          remarks: remarks || null,
          class_id: classId || null,
          marked_by: payload.id,
        } as never,
        { onConflict: 'student_id,date,class_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance:', error);
      return NextResponse.json({ error: error.message || 'Failed to create attendance' }, { status: 500 });
    }

    // Create notification for absence or late
    if (status === 'absent') {
      await createAbsenceNotification(studentId, date);
    } else if (status === 'late') {
      await createLateNotification(studentId, date);
    }

    return NextResponse.json({ success: true, attendance }, { status: 201 });
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
