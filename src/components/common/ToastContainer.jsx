import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// Inject keyframes once into the document head
const STYLES_ID = 'toast-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLES_ID)) {
  const style = document.createElement('style');
  style.id = STYLES_ID;
  style.textContent = `
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0);    }
    }
    @keyframes toastFadeOut {
      from { opacity: 1; transform: translateX(0);    }
      to   { opacity: 0; transform: translateX(40px); }
    }
    @keyframes shrinkBar {
      from { width: 100%; }
      to   { width: 0%;   }
    }
  `;
  document.head.appendChild(style);
}

const TYPE_CONFIG = {
  success: {
    border: '#1ea774',
    glow: 'rgba(16,185,129,0.12)',
    icon: CheckCircle,
    iconColor: '#1ea774',
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeColor: '#1ea774',
    barColor: '#1ea774',
    label: 'Success',
  },
  error: {
    border: '#d44333',
    glow: 'rgba(239,68,68,0.12)',
    icon: XCircle,
    iconColor: '#d44333',
    badgeBg: 'rgba(239,68,68,0.12)',
    badgeColor: '#d44333',
    barColor: '#d44333',
    label: 'Error',
  },
  warning: {
    border: '#eab308',
    glow: 'rgba(234,179,8,0.12)',
    icon: AlertTriangle,
    iconColor: '#eab308',
    badgeBg: 'rgba(234,179,8,0.12)',
    badgeColor: '#eab308',
    barColor: '#eab308',
    label: 'Warning',
  },
  info: {
    border: '#3b82f6',
    glow: 'rgba(59,130,246,0.12)',
    icon: Info,
    iconColor: '#3b82f6',
    badgeBg: 'rgba(59,130,246,0.12)',
    badgeColor: '#3b82f6',
    barColor: '#3b82f6',
    label: 'Info',
  },
};

function Toast({ notification, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  const handleRemove = () => {
    setExiting(true);
    setTimeout(() => onRemove(notification.id), 280);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        background: 'rgba(14,16,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)`,
        animation: exiting
          ? 'toastFadeOut 0.28s ease forwards'
          : 'toastSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      {/* Body */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: cfg.badgeBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color={cfg.iconColor} strokeWidth={2.2} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          {notification.title && (
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#f5f5f5',
                lineHeight: 1.3,
                marginBottom: notification.message ? 3 : 0,
                letterSpacing: '0.01em',
              }}
            >
              {notification.title}
            </p>
          )}
          {notification.message && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.5,
                fontWeight: 400,
              }}
            >
              {notification.message}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={handleRemove}
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: 5,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            transition: 'all 0.15s ease',
            marginTop: 1,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
          }}
          aria-label="Dismiss notification"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      {notification.duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 2,
            background: cfg.barColor,
            opacity: 0.7,
            animationName: 'shrinkBar',
            animationDuration: `${notification.duration}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
          }}
        />
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: '380px',
        pointerEvents: 'none',
      }}
    >
      {notifications.map(n => (
        <div key={n.id} style={{ pointerEvents: 'auto' }}>
          <Toast notification={n} onRemove={removeNotification} />
        </div>
      ))}
    </div>
  );
}
