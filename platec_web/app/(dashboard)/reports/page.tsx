'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Select,
} from '@/components/ui';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentReport {
  student: {
    id: string;
    studentId: string;
    name: string;
    course: string;
    year: number;
    section: string;
  };
  attendance: Record<string, { status: string; remarks: string | null }>;
  summary: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

interface ReportResponse {
  report: StudentReport[];
  stats: {
    totalStudents: number;
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  type: string;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${reportType}&date=${selectedDate}`);
      const result = await res.json();
      if (result.success) {
        setData({
          report: result.report,
          stats: result.stats,
          dateRange: result.dateRange,
          type: result.type,
        });
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setIsLoading(false);
    }
  }, [reportType, selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAttendanceRate = () => {
    if (!data?.stats) return '0.0';
    const { present, late, totalRecords } = data.stats;
    if (totalRecords === 0) return '0.0';
    return (((present + late) / totalRecords) * 100).toFixed(1);
  };

  const downloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Attendance Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateRange = data.type === 'daily'
      ? formatDate(data.dateRange.startDate)
      : `${formatDate(data.dateRange.startDate)} - ${formatDate(data.dateRange.endDate)}`;
    doc.text(`Report Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`, 14, 35);
    doc.text(`Period: ${dateRange}`, 14, 42);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 49);

    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Summary', 14, 62);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Attendance Rate: ${calculateAttendanceRate()}%`, 14, 70);
    doc.text(`Present: ${data.stats.present} | Absent: ${data.stats.absent} | Late: ${data.stats.late}`, 14, 77);

    if (data.report && data.report.length > 0) {
      const tableData = data.report.map((item) => {
        const rate = item.summary.total > 0
          ? (((item.summary.present + item.summary.late) / item.summary.total) * 100).toFixed(0)
          : '0';
        return [
          item.student.name,
          item.student.studentId,
          `${item.student.course} Y${item.student.year}-${item.student.section}`,
          item.summary.present.toString(),
          item.summary.absent.toString(),
          item.summary.late.toString(),
          `${rate}%`,
        ];
      });

      autoTable(doc, {
        startY: 85,
        head: [['Student', 'ID', 'Course', 'Present', 'Absent', 'Late', 'Rate']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [51, 51, 51] },
        styles: { fontSize: 9 },
      });
    }

    const filename = `attendance-${data.type}-${selectedDate}.pdf`;
    doc.save(filename);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
        <p className="text-gray-500 mt-1">Generate and view reports</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              options={[
                { value: 'daily', label: 'Daily Report' },
                { value: 'weekly', label: 'Weekly Report' },
                { value: 'monthly', label: 'Monthly Report' },
              ]}
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
              <Button onClick={fetchReport} className="flex-1">
                Generate
              </Button>
              <Button onClick={downloadPDF} variant="secondary" disabled={!data}>
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Report Period: <span className="font-medium text-gray-900">
                    {formatDate(data.dateRange.startDate)}
                    {data.type !== 'daily' && ` - ${formatDate(data.dateRange.endDate)}`}
                  </span>
                </span>
                <Badge variant="info">
                  {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Report
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{calculateAttendanceRate()}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{data.stats.present}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{data.stats.absent}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Late</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{data.stats.late}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {data.report && data.report.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Course</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Present</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Absent</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Late</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.report.map((item) => {
                        const rate = item.summary.total > 0
                          ? (((item.summary.present + item.summary.late) / item.summary.total) * 100).toFixed(0)
                          : '0';
                        return (
                          <tr key={item.student.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{item.student.name}</td>
                            <td className="py-3 px-4">
                              <code className="text-sm bg-gray-100 px-1">{item.student.studentId}</code>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {item.student.course} Year {item.student.year}-{item.student.section}
                            </td>
                            <td className="py-3 px-4 text-center text-green-600 font-medium">{item.summary.present}</td>
                            <td className="py-3 px-4 text-center text-red-600 font-medium">{item.summary.absent}</td>
                            <td className="py-3 px-4 text-center text-yellow-600 font-medium">{item.summary.late}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={parseInt(rate) >= 80 ? 'success' : parseInt(rate) >= 60 ? 'warning' : 'danger'}>
                                {rate}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No attendance data for this period</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
