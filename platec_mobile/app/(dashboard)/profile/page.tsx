'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/MobileHeader';

export default function ProfilePage() {
  const { student, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!student) {
    return (
      <div className="px-4 pt-12 safe-area-top">
        <div className="h-10 w-32 skeleton mb-6" />
        <div className="h-32 skeleton mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const profileItems = [
    {
      label: 'Student ID',
      value: student.studentId,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
    },
    {
      label: 'Email',
      value: student.email,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Course',
      value: student.course,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: 'Year & Section',
      value: `Year ${student.year} - Section ${student.section}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="hide-scrollbar">
      <MobileHeader title="Profile" />

      <div className="px-4 space-y-4 pb-6">
        {/* Profile Card */}
        <div className="bg-[#7357C6] rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
              <span className="text-3xl font-bold text-white">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <p className="text-white/80 text-sm mt-1">{student.course} Student</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-3 animate-fade-in stagger-1">
          {profileItems.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center gap-4 p-4 bg-white border border-[#E5E7EB] rounded-xl"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-[#E8E3F5] flex items-center justify-center text-[#7357C6]">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#6B7280] uppercase tracking-wide">{item.label}</p>
                <p className="text-[#111827] font-medium truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-fade-in stagger-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-[#991B1B] font-medium min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {/* App Info */}
        <div className="text-center pt-4 animate-fade-in stagger-3">
          <p className="text-[#9CA3AF] text-xs">
            Student Attendance Management System
          </p>
          <p className="text-[#D1D5DB] text-xs mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
