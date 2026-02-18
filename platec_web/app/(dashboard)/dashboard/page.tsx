'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

interface DashboardData {
  totalStudents: number;
  today: { present: number; absent: number; late: number; notMarked: number };
  weeklyTrend: Array<{ date: string; present: number; absent: number; late: number }>;
  recentActivity: Array<{
    id: string;
    status: string;
    date: string;
    student: {
      id: string;
      student_id: string;
      name: string;
    };
  }>;
  courseDistribution: Array<{ course: string; count: number }>;
}

interface ClassInfo {
  id: string;
  name: string;
  code: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const result = await res.json();
      if (result.success) {
        setClasses(result.classes || []);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = selectedClass
        ? `/api/reports/dashboard?classId=${selectedClass}`
        : '/api/reports/dashboard';
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setData(result.dashboard);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchDashboardData();
          }}
          className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const weeklyTotals = data?.weeklyTrend?.reduce(
    (acc, day) => ({
      present: acc.present + day.present,
      absent: acc.absent + day.absent,
      late: acc.late + day.late,
    }),
    { present: 0, absent: 0, late: 0 }
  ) || { present: 0, absent: 0, late: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your attendance system</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{data?.totalStudents || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Present Today</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{data?.today?.present || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Absent Today</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{data?.today?.absent || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Late Today</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{data?.today?.late || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Present</span>
                <span className="font-medium text-gray-900">{weeklyTotals.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Absent</span>
                <span className="font-medium text-gray-900">{weeklyTotals.absent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Late</span>
                <span className="font-medium text-gray-900">{weeklyTotals.late}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.courseDistribution?.map((item) => (
                <div key={item.course} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{item.course}</span>
                  <span className="font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
              {(!data?.courseDistribution || data.courseDistribution.length === 0) && (
                <p className="text-gray-400 text-center py-4">No courses found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {data.recentActivity.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{record.student?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{record.student?.student_id || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        record.status === 'present'
                          ? 'success'
                          : record.status === 'absent'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
