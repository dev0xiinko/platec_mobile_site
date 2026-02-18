'use client';

import { useEffect, useState } from 'react';
import { notificationsApi, Notification } from '@/lib/api';
import MobileHeader from '@/components/MobileHeader';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await notificationsApi.getNotifications();
        if (response.success && response.data) {
          setNotifications(response.data.notifications || []);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'absence':
        return {
          bg: 'bg-[#FEE2E2]',
          border: 'border-[#FECACA]',
          icon: 'text-[#991B1B]',
          iconBg: 'bg-[#FEE2E2]',
        };
      case 'late':
        return {
          bg: 'bg-[#FEF9C3]',
          border: 'border-[#FEF08A]',
          icon: 'text-[#854D0E]',
          iconBg: 'bg-[#FEF9C3]',
        };
      default:
        return {
          bg: 'bg-[#E8E3F5]',
          border: 'border-[#D4CCE9]',
          icon: 'text-[#7357C6]',
          iconBg: 'bg-[#E8E3F5]',
        };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'absence':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'late':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="px-4 pt-12 safe-area-top">
        <div className="h-10 w-40 skeleton mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar">
      <MobileHeader title="Notifications" />

      <div className="px-4 space-y-4 pb-6">
        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="px-2.5 py-1 rounded-full bg-[#E8E3F5] text-[#7357C6] text-sm font-medium border border-[#D4CCE9]">
              {unreadCount} unread
            </span>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const styles = getTypeStyles(notification.type);
              
              return (
                <button
                  key={notification._id}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                  className={`w-full text-left p-4 rounded-xl transition-colors touch-feedback animate-fade-in ${
                    notification.read
                      ? 'bg-white border border-[#E5E7EB]'
                      : `${styles.bg} border ${styles.border}`
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.read ? 'bg-[#F3F4F6]' : styles.iconBg
                    }`}>
                      <span className={notification.read ? 'text-[#9CA3AF]' : styles.icon}>
                        {getIcon(notification.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium truncate ${
                          notification.read ? 'text-[#6B7280]' : 'text-[#111827]'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-[#7357C6] flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className={`text-sm mt-1 line-clamp-2 ${
                        notification.read ? 'text-[#9CA3AF]' : 'text-[#6B7280]'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#F3F4F6] rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#111827] mb-2">All caught up!</h3>
            <p className="text-[#6B7280] text-sm">You have no notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
