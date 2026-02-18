import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variants = {
    success: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    warning: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    info: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
    default: 'bg-[#F3F4F6] text-[#1F2937] border-[#E5E7EB]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
