'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import MobileHeader from '@/components/MobileHeader';

interface ClassInfo {
  id: string;
  name: string;
  code: string;
  subject: string | null;
  schedule: string | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  class_name?: string;
  class_code?: string;
}

interface DashboardData {
  myClasses: ClassInfo[];
  recentAttendance: AttendanceRecord[];
  stats: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export default function DashboardPage() {
  const { student } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, attendanceRes] = await Promise.all([
          api.get<{ success: boolean; classes: ClassInfo[] }>('/student/classes'),
          api.get<{ success: boolean; records: AttendanceRecord[]; stats: DashboardData['stats'] }>('/student/attendance?limit=5'),
        ]);

        setData({
          myClasses: classesRes.data?.classes || [],
          recentAttendance: attendanceRes.data?.records || [],
          stats: attendanceRes.data?.stats || { present: 0, absent: 0, late: 0, total: 0 },
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const attendanceRate = data?.stats.total 
    ? Math.round((data.stats.present / data.stats.total) * 100) 
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'present': return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', border: 'border-[#BBF7D0]' };
      case 'absent': return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', border: 'border-[#FECACA]' };
      case 'late': return { bg: 'bg-[#FEF9C3]', text: 'text-[#854D0E]', border: 'border-[#FEF08A]' };
      default: return { bg: 'bg-[#F3F4F6]', text: 'text-[#374151]', border: 'border-[#E5E7EB]' };
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-12 safe-area-top">
        <div className="h-8 w-32 skeleton mb-2" />
        <div className="h-10 w-48 skeleton mb-8" />
        <div className="h-32 skeleton mb-4" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar">
      <MobileHeader showGreeting />

      <div className="px-4 space-y-4 pb-6">
        {/* Attendance Rate Card */}
        <div className="bg-[#7357C6] rounded-2xl p-6 animate-fade-in">
          <p className="text-white/80 text-sm font-medium mb-1">Overall Attendance</p>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-bold text-white">{attendanceRate}</span>
            <span className="text-2xl text-white/80 mb-1">%</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
          
          <p className="text-white/80 text-sm mt-3">
            {data?.stats.present || 0} present out of {data?.stats.total || 0} classes
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in stagger-1">
          <div className="stat-present p-4 text-center">
            <p className="text-2xl font-bold text-[#166534]">{data?.stats.present || 0}</p>
            <p className="text-xs text-[#6B7280] mt-1">Present</p>
          </div>
          <div className="stat-absent p-4 text-center">
            <p className="text-2xl font-bold text-[#991B1B]">{data?.stats.absent || 0}</p>
            <p className="text-xs text-[#6B7280] mt-1">Absent</p>
          </div>
          <div className="stat-late p-4 text-center">
            <p className="text-2xl font-bold text-[#854D0E]">{data?.stats.late || 0}</p>
            <p className="text-xs text-[#6B7280] mt-1">Late</p>
          </div>
        </div>

        {/* My Classes */}
        {data?.myClasses && data.myClasses.length > 0 && (
          <div className="animate-fade-in stagger-2">
            <h2 className="text-lg font-semibold text-[#111827] mb-3">My Classes</h2>
            <div className="space-y-3">
              {data.myClasses.slice(0, 3).map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-4 p-4 bg-white border border-[#E5E7EB] rounded-xl"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#7357C6] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{cls.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] truncate">{cls.name}</p>
                    <p className="text-sm text-[#6B7280] truncate">
                      {cls.subject || cls.schedule || `Code: ${cls.code}`}
                    </p>
                  </div>
                  <code className="text-xs text-[#7357C6] bg-[#E8E3F5] px-2 py-1 rounded-lg border border-[#D4CCE9] flex-shrink-0">
                    {cls.code}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        <div className="animate-fade-in stagger-3">
          <h2 className="text-lg font-semibold text-[#111827] mb-3">Recent Attendance</h2>
          
          {data?.recentAttendance && data.recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {data.recentAttendance.map((record) => {
                const styles = getStatusStyles(record.status);
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg} border ${styles.border}`}>
                        {record.status === 'present' && (
                          <svg className={`w-5 h-5 ${styles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {record.status === 'absent' && (
                          <svg className={`w-5 h-5 ${styles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {record.status === 'late' && (
                          <svg className={`w-5 h-5 ${styles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#111827] text-sm">
                          {record.class_name || 'Class'}
                        </p>
                        <p className="text-xs text-[#6B7280]">{formatDate(record.date)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles.bg} ${styles.text} border ${styles.border}`}>
                      {record.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white border border-[#E5E7EB] rounded-xl">
              <svg className="w-12 h-12 mx-auto text-[#9CA3AF] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[#6B7280] text-sm">No attendance records yet</p>
            </div>
          )}
        </div>

        {/* Student Info */}
        {student && (
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl animate-fade-in stagger-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#7357C6] flex items-center justify-center">
                <span className="text-white font-bold text-lg">{student.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-[#111827]">{student.name}</p>
                <p className="text-sm text-[#6B7280]">
                  {student.course} • Year {student.year} - {student.section}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
