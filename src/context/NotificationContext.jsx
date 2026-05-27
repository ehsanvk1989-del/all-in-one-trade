import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext(null);

const MAX_NOTIFICATIONS = 5;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timerRefs = useRef({});

  const removeNotification = useCallback((id) => {
    // Clear auto-remove timer if it exists
    if (timerRefs.current[id]) {
      clearTimeout(timerRefs.current[id]);
      delete timerRefs.current[id];
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notif) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const duration = notif.duration ?? 4000;

    const newNotif = {
      id,
      type: notif.type || 'info',
      title: notif.title || '',
      message: notif.message || '',
      duration,
      createdAt: Date.now(),
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      // Trim to max; remove oldest entries beyond the cap
      if (updated.length > MAX_NOTIFICATIONS) {
        const removed = updated.splice(MAX_NOTIFICATIONS);
        removed.forEach(n => {
          if (timerRefs.current[n.id]) {
            clearTimeout(timerRefs.current[n.id]);
            delete timerRefs.current[n.id];
          }
        });
      }
      return updated;
    });

    if (duration > 0) {
      timerRefs.current[id] = setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [removeNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
