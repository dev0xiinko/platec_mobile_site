'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import MobileHeader from '@/components/MobileHeader';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  class_name?: string;
  class_code?: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await api.get<{
          success: boolean;
          records: AttendanceRecord[];
          stats: AttendanceStats;
        }>('/student/attendance?limit=100');

        if (response.success && response.data) {
          setRecords(response.data.records || []);
          setStats(response.data.stats || { present: 0, absent: 0, late: 0, total: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttendance();
  }, []);

  const filteredRecords = filter === 'all' 
    ? records 
    : records.filter(r => r.status === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'present': return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', border: 'border-[#BBF7D0]' };
      case 'absent': return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', border: 'border-[#FECACA]' };
      case 'late': return { bg: 'bg-[#FEF9C3]', text: 'text-[#854D0E]', border: 'border-[#FEF08A]' };
      default: return { bg: 'bg-[#F3F4F6]', text: 'text-[#374151]', border: 'border-[#E5E7EB]' };
    }
  };

  const attendanceRate = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="px-4 pt-12 safe-area-top">
        <div className="h-10 w-40 skeleton mb-6" />
        <div className="h-24 skeleton mb-6" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 skeleton" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar">
      <MobileHeader title="Attendance" />

      <div className="px-4 space-y-4 pb-6">
        {/* Summary Card */}
        <div className="p-5 bg-white border border-[#E5E7EB] rounded-xl animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#6B7280] text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold text-[#111827]">{attendanceRate}%</p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              attendanceRate >= 80 ? 'bg-[#DCFCE7]' : attendanceRate >= 60 ? 'bg-[#FEF9C3]' : 'bg-[#FEE2E2]'
            }`}>
              <span className={`text-2xl font-bold ${
                attendanceRate >= 80 ? 'text-[#166534]' : attendanceRate >= 60 ? 'text-[#854D0E]' : 'text-[#991B1B]'
              }`}>
                {attendanceRate >= 80 ? '✓' : '!'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-[#166534]">{stats.present} Present</span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="text-[#991B1B]">{stats.absent} Absent</span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="text-[#854D0E]">{stats.late} Late</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar animate-fade-in stagger-1">
          {(['all', 'present', 'absent', 'late'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap min-h-[44px] rounded-lg border ${
                filter === status
                  ? 'bg-[#7357C6] text-white border-[#7357C6]'
                  : 'bg-white text-[#4B5563] border-[#D1D5DB]'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  ({status === 'present' ? stats.present : status === 'absent' ? stats.absent : stats.late})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-3 animate-fade-in stagger-2">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const date = formatDate(record.date);
              const styles = getStatusStyles(record.status);
              
              return (
                <div
                  key={record.id}
                  className={`flex items-center gap-4 p-4 bg-white border rounded-xl ${styles.border}`}
                >
                  {/* Date */}
                  <div className="text-center min-w-[50px]">
                    <p className="text-2xl font-bold text-[#111827]">{date.day}</p>
                    <p className="text-xs text-[#6B7280]">{date.month}</p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-12 bg-[#E5E7EB]" />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] truncate">
                      {record.class_name || 'Class Session'}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {date.weekday}
                      {record.class_code && ` • ${record.class_code}`}
                    </p>
                    {record.remarks && (
                      <p className="text-xs text-[#6B7280] mt-1 truncate">{record.remarks}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`px-2.5 py-1 rounded-full ${styles.bg} border ${styles.border}`}>
                    <span className={`text-xs font-semibold capitalize ${styles.text}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white border border-[#E5E7EB] rounded-xl">
              <svg className="w-16 h-16 mx-auto text-[#9CA3AF] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[#6B7280]">No {filter === 'all' ? '' : filter + ' '}records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
