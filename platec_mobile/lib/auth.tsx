'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, Student } from './api';

interface AuthContextType {
  student: Student | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      if (token) {
        const response = await authApi.getProfile();
        if (response.success && response.data?.student) {
          setStudent(response.data.student);
        } else {
          localStorage.removeItem('student_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data?.student) {
        setStudent(response.data.student);
        return { success: true };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    authApi.logout();
    setStudent(null);
  };

  const refreshProfile = async () => {
    const response = await authApi.getProfile();
    if (response.success && response.data?.student) {
      setStudent(response.data.student);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        isLoading,
        isAuthenticated: !!student,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
