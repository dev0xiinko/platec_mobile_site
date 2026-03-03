import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import supabase from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { data: student, error } = await supabase
      .from('students')
      .select('id, student_id, name, email, course, year, section, created_at, admin_id')
      .eq('id', id)
      .eq('admin_id', payload.id)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { name, email, password, course, year, section } = body;

    // Verify student belongs to this admin
    const { data: student } = await supabase
      .from('students')
      .select('id, admin_id')
      .eq('id', id)
      .single();

    if (!student || student.admin_id !== payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (course) updateData.course = course;
    if (year) updateData.year = year;
    if (section) updateData.section = section;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: student, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select('id, student_id, name, email, course, year, section, created_at')
      .single();

    if (error) {
      console.error('Error updating student:', error);
      return NextResponse.json({ error: error.message || 'Failed to update student' }, { status: 500 });
    }

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify student belongs to this admin
    const { data: student } = await supabase
      .from('students')
      .select('id, admin_id')
      .eq('id', id)
      .single();

    if (!student || student.admin_id !== payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      return NextResponse.json({ error: error.message || 'Failed to delete student' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
