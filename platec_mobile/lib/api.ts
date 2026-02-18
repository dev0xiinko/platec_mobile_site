const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('student_token');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('student_token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('student_token');
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient(`${API_URL}/api`);

// Student type
export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  year: number;
  section: string;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<{
      success: boolean;
      token: string;
      student: Student;
    }>('/student/auth/login', { email, password });

    if (response.success && response.data?.token) {
      api.setToken(response.data.token);
    }

    return response;
  },

  logout: () => {
    api.removeToken();
    return { success: true };
  },

  getProfile: async () => {
    return api.get<{
      success: boolean;
      student: Student;
    }>('/student/auth/me');
  },
};

// Attendance types
export interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

// Attendance API
export const attendanceApi = {
  getHistory: async (page = 1, limit = 20) => {
    return api.get<{
      success: boolean;
      records: AttendanceRecord[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      stats: AttendanceStats;
    }>(`/student/attendance?page=${page}&limit=${limit}`);
  },
};

// Notification types
export interface Notification {
  _id: string;
  type: 'absence' | 'late' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Notifications API
export const notificationsApi = {
  getNotifications: async () => {
    return api.get<{
      success: boolean;
      notifications: Notification[];
    }>('/student/notifications');
  },

  markAsRead: async (id: string) => {
    return api.put(`/student/notifications/${id}/read`, {});
  },
};
