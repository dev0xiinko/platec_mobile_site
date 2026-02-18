'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import MobileHeader from '@/components/MobileHeader';

interface ClassInfo {
  id: string;
  name: string;
  code: string;
  description: string | null;
  subject: string | null;
  schedule: string | null;
  enrolled_at?: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClasses = async () => {
    try {
      const response = await api.get<{ success: boolean; classes: ClassInfo[] }>('/student/classes');
      if (response.success && response.data) {
        setClasses(response.data.classes || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post<{ success: boolean; error?: string; class?: ClassInfo }>(
        '/student/classes/join',
        { code: joinCode.toUpperCase() }
      );

      if (response.success) {
        setSuccess('Successfully joined the class!');
        setJoinCode('');
        fetchClasses();
        setTimeout(() => {
          setShowJoinModal(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(response.error || 'Failed to join class');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-12 safe-area-top">
        <div className="h-10 w-32 skeleton mb-6" />
        <div className="h-14 skeleton mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar">
      <MobileHeader title="My Classes" />

      <div className="px-4 space-y-4 pb-6">
        {/* Join Class Button */}
        <button
          onClick={() => setShowJoinModal(true)}
          className="w-full flex items-center justify-center gap-3 p-4 bg-[#7357C6] text-white font-medium rounded-xl border border-[#7357C6] hover:bg-[#5d44a8] min-h-[44px] animate-fade-in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Join a Class
        </button>

        {/* Classes List */}
        {classes.length > 0 ? (
          <div className="space-y-4 animate-fade-in stagger-1">
            {classes.map((cls, index) => (
              <div
                key={cls.id}
                className="p-5 bg-white border border-[#E5E7EB] rounded-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#7357C6] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">{cls.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[#111827] text-lg truncate">{cls.name}</h3>
                      <code className="text-xs text-[#7357C6] bg-[#E8E3F5] px-2 py-1 rounded-lg border border-[#D4CCE9] flex-shrink-0">
                        {cls.code}
                      </code>
                    </div>
                    {cls.subject && (
                      <p className="text-[#6B7280] text-sm mt-1">{cls.subject}</p>
                    )}
                    {cls.schedule && (
                      <div className="flex items-center gap-2 mt-2 text-[#6B7280] text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {cls.schedule}
                      </div>
                    )}
                    {cls.description && (
                      <p className="text-[#6B7280] text-sm mt-2 line-clamp-2">{cls.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#F3F4F6] rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#111827] mb-2">No classes yet</h3>
            <p className="text-[#6B7280] text-sm mb-6">Join a class using the code from your teacher</p>
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => { setShowJoinModal(false); setJoinCode(''); setError(''); }}
        >
          <div 
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#111827] text-center mb-2">Join a Class</h2>
            <p className="text-[#6B7280] text-center text-sm mb-6">
              Enter the class code provided by your teacher
            </p>

            {error && (
              <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg mb-4">
                <p className="text-[#991B1B] text-sm text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-lg mb-4">
                <p className="text-[#166534] text-sm text-center">{success}</p>
              </div>
            )}

            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter class code"
              maxLength={10}
              className="w-full px-4 py-4 bg-white border border-[#D1D5DB] rounded-lg text-[#111827] text-center text-2xl tracking-widest font-mono placeholder-[#9CA3AF] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#7357C6] uppercase"
              autoFocus
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                  setError('');
                }}
                className="flex-1 py-3 bg-white text-[#374151] font-medium rounded-lg border border-[#D1D5DB] hover:bg-[#F9FAFB] min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinClass}
                disabled={!joinCode.trim() || isJoining}
                className="flex-1 py-3 bg-[#7357C6] text-white font-medium rounded-lg border border-[#7357C6] hover:bg-[#5d44a8] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isJoining ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Join Class'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
