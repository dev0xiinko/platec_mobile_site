'use client';

import { useAuth } from '@/lib/auth';

interface MobileHeaderProps {
  title?: string;
  showGreeting?: boolean;
}

export default function MobileHeader({ title, showGreeting = false }: MobileHeaderProps) {
  const { student } = useAuth();

  if (showGreeting && student) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    return (
      <header className="px-4 pt-12 pb-4 safe-area-top bg-white border-b border-[#E5E7EB]">
        <p className="text-[#6B7280] text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold text-[#111827] mt-0.5">{student.name.split(' ')[0]}</h1>
      </header>
    );
  }

  return (
    <header className="px-4 pt-12 pb-4 safe-area-top bg-white border-b border-[#E5E7EB]">
      <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
    </header>
  );
}
