'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  Badge,
} from '@/components/ui';

interface ClassData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  subject: string | null;
  schedule: string | null;
  is_active: boolean;
  studentCount: number;
  created_at: string;
  createdBy?: { name: string };
}

interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  course: string;
  year: number;
  section: string;
  enrolledAt?: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    dayPattern: '',
    timeRange: '',
  });

  const scheduleOptions = {
    MWF: ['7:00–9:00 AM', '9:30–11:30 AM'],
    TTH: ['7:00–9:30 AM', '10:00–11:00 AM'],
  };
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const schedule = formData.dayPattern && formData.timeRange
        ? `${formData.dayPattern} ${formData.timeRange}`
        : null;
      
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          subject: formData.subject,
          schedule,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Class created! Code: ${data.class.code}` });
        setIsModalOpen(false);
        setFormData({ name: '', description: '', subject: '', dayPattern: '', timeRange: '' });
        fetchClasses();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create class' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (classId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (res.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('Failed to toggle class:', error);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchClasses();
        setMessage({ type: 'success', text: 'Class deleted successfully' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete class' });
    }
  };

  const viewStudents = async (classData: ClassData) => {
    setSelectedClass(classData);
    setIsStudentsModalOpen(true);

    try {
      const res = await fetch(`/api/classes/${classData.id}/students`);
      const data = await res.json();
      if (data.success) {
        setClassStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setMessage({ type: 'success', text: 'Class code copied!' });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 mt-1">Create and manage classes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Class</Button>
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
          <button
            onClick={() => setMessage(null)}
            className="float-right text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{cls.name}</CardTitle>
                <p className="text-gray-500 text-sm mt-1">{cls.subject || 'No subject'}</p>
              </div>
              <Badge variant={cls.is_active ? 'success' : 'danger'}>
                {cls.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Join Code</p>
                  <p className="text-xl font-mono font-bold text-gray-900 tracking-wider">
                    {cls.code}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyCode(cls.code)}>
                  Copy
                </Button>
              </div>

              {cls.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cls.description}</p>
              )}

              {cls.schedule && (
                <p className="text-sm text-gray-500 mb-4">{cls.schedule}</p>
              )}

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="text-gray-600">
                  <span className="font-medium text-gray-900">{cls.studentCount}</span> students
                </span>
                <Button variant="ghost" size="sm" onClick={() => viewStudents(cls)}>
                  View
                </Button>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleToggleActive(cls.id, cls.is_active)}
                >
                  {cls.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(cls.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No classes yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first class to get started</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Class">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <Input
            label="Class Name"
            placeholder="e.g., Introduction to Programming"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Subject"
            placeholder="e.g., Computer Science"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
              <select
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={formData.dayPattern}
                onChange={(e) => setFormData({ ...formData, dayPattern: e.target.value, timeRange: '' })}
              >
                <option value="">Select days</option>
                <option value="MWF">MWF (Mon/Wed/Fri)</option>
                <option value="TTH">TTH (Tue/Thu)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <select
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
                value={formData.timeRange}
                onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                disabled={!formData.dayPattern}
              >
                <option value="">Select time</option>
                {formData.dayPattern && scheduleOptions[formData.dayPattern as keyof typeof scheduleOptions]?.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              rows={3}
              placeholder="Optional class description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Create Class
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        title={`Students in ${selectedClass?.name || 'Class'}`}
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {classStudents.length > 0 ? (
            classStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.student_id} • {student.course}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No students enrolled yet</p>
          )}
        </div>
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            Share this code with students:
            <span className="ml-2 font-mono font-bold text-gray-900">
              {selectedClass?.code}
            </span>
          </p>
        </div>
      </Modal>
    </div>
  );
}
