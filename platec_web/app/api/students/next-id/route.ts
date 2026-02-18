import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('student_id')
      .like('student_id', 'BSIT-%')
      .order('student_id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last student ID:', error);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    let nextNumber = 1;

    if (students && students.length > 0) {
      const lastId = students[0].student_id;
      const match = lastId.match(/BSIT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const nextId = `BSIT-${nextNumber.toString().padStart(4, '0')}`;

    return NextResponse.json({ success: true, nextId });
  } catch (error) {
    console.error('Next ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
