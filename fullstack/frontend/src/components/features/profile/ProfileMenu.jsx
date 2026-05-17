import { useState, useRef, useEffect } from 'react';
import AccountSettingsModal from './AccountSettingsModal';

export default function ProfileMenu({ isLoggedIn = false, user = null, onLoginClick = () => {}, onLogout = () => {}, onProfileUpdate = () => {}, isCollapsed = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsDropdownOpen(false);
    }
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => { setIsDropdownOpen(false); }, [isCollapsed]);

  // Derive display name from user.name or email
  const displayName = user?.name || 'N/A';
  const displayEmail = user?.email || 'user@email.com';

  function getInitials(name) {
    if (!name || name === 'N/A') return 'U';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  // Dropdown content (shared between collapsed and expanded)
  const renderDropdown = (position) => (
    <div className={`absolute ${position} bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-56 overflow-hidden`} data-testid="profile-dropdown">
      
      {/* 1. Header — User Identity */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        {user?.avatar ? (
          <img src={user.avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-smart-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(displayName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
          <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
        </div>
      </div>

      {/* 2. Menu Items */}
      <div className="py-1">
        <button
          onClick={() => { setIsDropdownOpen(false); setShowSettings(true); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <GearIcon className="w-4 h-4 text-gray-400" />
          <span>Pengaturan Akun</span>
        </button>
        <button
          onClick={() => setIsDropdownOpen(false)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <BookIcon className="w-4 h-4 text-gray-400" />
          <span>Panduan Aplikasi</span>
        </button>
      </div>

      {/* 3. Footer — Logout */}
      <div className="border-t border-gray-100 py-1">
        <button
          onClick={() => { setIsDropdownOpen(false); onLogout(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogoutIcon className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  // Collapsed mode
  if (isCollapsed) {
    return (
      <div className="relative flex justify-center" ref={menuRef}>
        <button
          onClick={() => isLoggedIn ? setIsDropdownOpen(!isDropdownOpen) : onLoginClick()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          title={isLoggedIn ? displayName : 'Login'}
        >
          {isLoggedIn ? (
            user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-smart-navy text-white flex items-center justify-center text-xs font-bold">
                {getInitials(displayName)}
              </div>
            )
          ) : (
            <UserIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {isDropdownOpen && isLoggedIn && renderDropdown('left-full bottom-0 ml-2')}
        <AccountSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} user={user} onProfileUpdate={onProfileUpdate} />
      </div>
    );
  }

  // Expanded mode: logged out
  if (!isLoggedIn) {
    return (
      <button
        onClick={onLoginClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-smart-navy bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <UserIcon className="w-5 h-5 text-smart-navy" />
        <span>Login</span>
      </button>
    );
  }

  // Expanded mode: logged in
  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-smart-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(displayName)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 truncate">{displayName}</span>
          <ChevronIcon className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && renderDropdown('bottom-full left-0 mb-2')}
      </div>
      <AccountSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} user={user} onProfileUpdate={onProfileUpdate} />
    </>
  );
}

// Icons
function UserIcon({ className = '' }) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
}
function GearIcon({ className = '' }) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 9 3V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
}
function BookIcon({ className = '' }) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>);
}
function LogoutIcon({ className = '' }) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
}
function ChevronIcon({ className = '' }) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"/></svg>);
}
