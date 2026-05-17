// src/components/features/notifications/NotificationMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Notifikasi — nanti diisi dari API/database
const INITIAL_NOTIFICATIONS = [];

export default function NotificationMenu({ isCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAllModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showAllModal]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleOpenAllModal = () => { setIsOpen(false); setShowAllModal(true); };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(notifications.map(n => n.id));
    else setSelectedIds([]);
  };
  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleMarkRead = () => {
    const targets = selectedIds.length > 0 ? selectedIds : notifications.map(n => n.id);
    setNotifications(notifications.map(n => targets.includes(n.id) ? { ...n, unread: false } : n));
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    setNotifications(notifications.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  // Accordion expand — auto-collapse previous, mark as read
  const handleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Bell icon button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 w-full px-4 py-3'} text-gray-500 hover:text-smart-navy transition-colors rounded-xl hover:bg-gray-50`}
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          {!isCollapsed && <span className="font-medium text-sm">Notifications</span>}
          {unreadCount > 0 && (
            <span className={`absolute ${isCollapsed ? 'top-1 right-1' : 'top-2 left-8'} w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center`}>{unreadCount}</span>
          )}
        </button>

        {/* Small dropdown */}
        {isOpen && (
          <div className={`absolute ${isCollapsed ? 'left-full ml-2' : 'left-0'} bottom-0 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden`} role="menu">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs text-smart-navy font-medium">{unreadCount} new</span>}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? notifications.slice(0, 3).map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${n.unread ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex items-start gap-2">
                    {n.unread && <span className="w-2 h-2 bg-smart-navy rounded-full mt-1.5 shrink-0" />}
                    <div className={n.unread ? '' : 'ml-4'}>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-8 flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <p className="text-xs text-gray-400 font-medium">Tidak ada notifikasi terbaru</p>
                </div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-100">
              <button onClick={handleOpenAllModal} className="text-xs text-smart-navy font-medium hover:underline w-full text-center">Lihat selengkapnya</button>
            </div>
          </div>
        )}
      </div>

      {/* Full Notification Modal — Portal to body */}
      {showAllModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) { setShowAllModal(false); setSelectedIds([]); setExpandedId(null); } }}>
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col shadow-2xl">

            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Semua Notifikasi</h2>
              <div className="flex items-center gap-3">
                <button onClick={handleMarkRead} className="text-sm text-blue-600 hover:underline font-medium">Tandai sudah dibaca</button>
                {selectedIds.length > 0 && (
                  <button onClick={handleDeleteSelected} className="text-sm text-red-600 hover:text-red-700 font-medium">Hapus</button>
                )}
              </div>
            </div>

            {/* Select All bar */}
            <div className="px-6 py-2 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50 shrink-0">
              <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === notifications.length && notifications.length > 0} className="w-4 h-4 text-smart-navy bg-gray-100 border-gray-300 rounded cursor-pointer" />
              <span className="text-xs text-gray-500 font-medium">{selectedIds.length > 0 ? `${selectedIds.length} dipilih` : 'Pilih semua'}</span>
            </div>

            {/* Notification List (scrollable) */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {notifications.length > 0 ? notifications.map((n) => (
                <div key={n.id} className={`rounded-lg border transition-all duration-300 ${n.unread ? 'bg-slate-50 border-blue-100' : 'bg-white border-gray-100'}`}>
                  <div className="flex items-start gap-3 p-4">
                    {/* Checkbox */}
                    <input type="checkbox" checked={selectedIds.includes(n.id)} onChange={() => handleSelectOne(n.id)} className="w-4 h-4 text-smart-navy bg-gray-100 border-gray-300 rounded cursor-pointer mt-0.5 shrink-0" />
                    {/* Unread dot */}
                    {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0 transition-opacity duration-300" />}
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm transition-all duration-300 ${n.unread ? 'font-bold text-gray-900' : 'font-medium text-slate-700'}`}>{n.title}</p>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{n.message}</p>

                      {/* Toggle button */}
                      <button onClick={() => handleExpand(n.id)} className="text-[11px] text-blue-600 hover:underline font-medium mt-2 inline-block transition-colors">
                        {expandedId === n.id ? 'Tutup detail' : 'Baca selengkapnya'}
                      </button>

                      {/* Expandable detail — smooth transition */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === n.id ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-600 leading-relaxed">{n.detail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200 mb-3">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <p className="text-sm text-gray-400 font-medium mb-1">Tidak ada notifikasi</p>
                  <p className="text-xs text-gray-300">Belum ada update, pembaharuan, atau perubahan terbaru untuk ditampilkan.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => { setShowAllModal(false); setSelectedIds([]); setExpandedId(null); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Tutup</button>
            </div>

          </div>
        </div>
      , document.body)}
    </>
  );
}
