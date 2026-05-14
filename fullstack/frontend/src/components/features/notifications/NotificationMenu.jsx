// src/components/features/notifications/NotificationMenu.jsx
import { useState, useRef, useEffect } from 'react';

export default function NotificationMenu({ isCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sample notifications for display
  const notifications = [
    { id: 1, title: 'Analysis Complete', message: 'Your LQ45 analysis is ready to view.', time: '2m ago', unread: true },
    { id: 2, title: 'Market Alert', message: 'IDX30 index dropped by 2.3% today.', time: '1h ago', unread: true },
    { id: 3, title: 'Portfolio Update', message: 'Your recommended portfolio has been updated.', time: '3h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell icon button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 w-full px-4 py-3'} text-gray-500 hover:text-smart-navy transition-colors rounded-xl hover:bg-gray-50`}
        aria-label="Notifications"
        data-testid="notification-bell-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        {!isCollapsed && <span className="font-medium text-sm">Notifications</span>}
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className={`absolute ${isCollapsed ? 'top-1 right-1' : 'top-2 left-8'} w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center`}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown panel */}
      {isOpen && (
        <div
          className={`absolute ${isCollapsed ? 'left-full ml-2' : 'left-0'} bottom-0 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden`}
          data-testid="notification-panel"
          role="menu"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-smart-navy font-medium">{unreadCount} new</span>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {notification.unread && (
                    <span className="w-2 h-2 bg-smart-navy rounded-full mt-1.5 shrink-0" />
                  )}
                  <div className={notification.unread ? '' : 'ml-4'}>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Panel footer */}
          <div className="px-4 py-2 border-t border-gray-100">
            <button className="text-xs text-smart-navy font-medium hover:underline w-full text-center">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
