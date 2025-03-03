import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionContext } from '../session';

export const NotificationType = {
  CHECKLIST_COMPLETED: 'CHECKLIST_COMPLETED',
  CHECKLIST_MISSED: 'CHECKLIST_MISSED',
  CHECKLIST_REMINDER: 'CHECKLIST_REMINDER',
  CHECKLIST_ASSIGNED: 'CHECKLIST_ASSIGNED',
  CHECKLIST_UPDATED: 'CHECKLIST_UPDATED'
};

const NotificationTemplate = {
  [NotificationType.CHECKLIST_COMPLETED]:
    "Checklist completed for site {siteName} by {userName}",
  [NotificationType.CHECKLIST_MISSED]:
    "Missed checklist for site {siteName}. Due date: {dueDate}",
  [NotificationType.CHECKLIST_REMINDER]:
    "Reminder: Complete checklist for site {siteName} by {dueDate}",
  [NotificationType.CHECKLIST_ASSIGNED]:
    "New checklist assigned for site {siteName}",
  [NotificationType.CHECKLIST_UPDATED]:
    "Checklist updated for site {siteName}"
};

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { client } = useContext(SessionContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    setupSocketListeners();
  }, [client]);

  const fetchNotifications = async () => {
    try {
      const response = await client.get('/api/checklist/notifications');
      if (response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const setupSocketListeners = () => {
    if (client.socket) {
      client.socket.on('notification', handleNewNotification);
      return () => {
        client.socket.off('notification');
      };
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (notificationId) => {
    try {
      await client.put(`/api/checklist/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await client.put('/api/checklist/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      clearAll,
      NotificationType,
      NotificationTemplate
    }}>
      {children}
    </NotificationContext.Provider>
  );
};