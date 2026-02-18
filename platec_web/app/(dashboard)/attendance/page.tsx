'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
} from '@/components/ui';

interface ClassData {
  id: string;
  name: string;
  code: string;
  subject: string | null;
  studentCount: number;
}

interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  course: string;
  year: number;
  section: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'unmarked';
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/classes?active=true');
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
        if (data.classes.length > 0 && !selectedClassId) {
          setSelectedClassId(data.classes[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId]);

  const fetchClassStudents = useCallback(async () => {
    if (!selectedClassId) return;
    
    setIsLoadingStudents(true);
    try {
      const res = await fetch(`/api/classes/${selectedClassId}/students`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedClassId]);

  const fetchAttendance = useCallback(async () => {
    if (!selectedClassId) return;
    
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}&classId=${selectedClassId}`);
      const data = await res.json();
      if (data.success) {
        const attendanceMap = new Map<string, AttendanceRecord>();
        data.records.forEach((record: { student: { id: string }; status: 'present' | 'absent' | 'late' }) => {
          attendanceMap.set(record.student.id, {
            studentId: record.student.id,
            status: record.status,
          });
        });
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents();
      fetchAttendance();
    }
  }, [selectedClassId, selectedDate, fetchClassStudents, fetchAttendance]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'unmarked') => {
    const newAttendance = new Map(attendance);
    if (status === 'unmarked') {
      newAttendance.delete(studentId);
    } else {
      newAttendance.set(studentId, { studentId, status });
    }
    setAttendance(newAttendance);
  };

  const markAllAs = (status: 'present' | 'absent' | 'late') => {
    const newAttendance = new Map<string, AttendanceRecord>();
    students.forEach((student) => {
      newAttendance.set(student.id, { studentId: student.id, status });
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      const records = Array.from(attendance.values()).map((record) => ({
        studentId: record.studentId,
        status: record.status,
      }));

      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          classId: selectedClassId,
          records,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Attendance saved for ${data.count} students` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save attendance' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save attendance' });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-500 mt-1">Select a class to mark attendance</p>
        </div>
        <Card className="text-center py-12">
          <p className="text-gray-500">No classes found</p>
          <p className="text-gray-400 text-sm mt-1">Create a class first to mark attendance</p>
          <Button className="mt-4" onClick={() => window.location.href = '/classes'}>
            Go to Classes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-500 mt-1">
            {selectedClass ? `${selectedClass.name} • ${selectedClass.code}` : 'Select a class'}
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} disabled={students.length === 0}>
          Save Attendance
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={classes.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.code})`,
              }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => markAllAs('present')} className="flex-1">
                All Present
              </Button>
              <Button variant="secondary" size="sm" onClick={() => markAllAs('absent')} className="flex-1">
                All Absent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students ({students.length})</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Present: {Array.from(attendance.values()).filter((a) => a.status === 'present').length}</span>
              <span>Absent: {Array.from(attendance.values()).filter((a) => a.status === 'absent').length}</span>
              <span>Late: {Array.from(attendance.values()).filter((a) => a.status === 'late').length}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-2">
              {students.map((student) => {
                const record = attendance.get(student.id);
                const status = record?.status || 'unmarked';

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">
                        {student.student_id} • {student.course} Year {student.year}-{student.section}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(['present', 'late', 'absent'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(student.id, status === s ? 'unmarked' : s)}
                          className={`px-3 py-1.5 text-sm font-medium border ${
                            status === s
                              ? s === 'present'
                                ? 'bg-green-600 text-white border-green-600'
                                : s === 'late'
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No students in this class</p>
              <p className="text-gray-400 text-sm mt-1">Students need to join using the class code</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
