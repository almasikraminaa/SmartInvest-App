import { useState, useRef, useEffect } from 'react';

export default function ProfileMenu({ isLoggedIn = false, user = null, onLoginClick = () => {}, isCollapsed = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown when collapsed state changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [isCollapsed]);

  const profileActions = [
    { label: 'Profile', icon: UserIcon },
    { label: 'Settings', icon: SettingsIcon },
    { label: 'Logout', icon: LogoutIcon },
  ];

  // Get user initials for avatar fallback
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Collapsed mode: show only avatar icon
  if (isCollapsed) {
    return (
      <div className="relative flex justify-center" ref={menuRef}>
        <button
          onClick={() => isLoggedIn ? setIsDropdownOpen(!isDropdownOpen) : onLoginClick()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          title={isLoggedIn ? user?.name || 'Profile' : 'Login'}
          data-testid="profile-menu-collapsed"
        >
          {isLoggedIn ? (
            user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-smart-navy text-white flex items-center justify-center text-xs font-semibold">
                {getInitials(user?.name)}
              </div>
            )
          ) : (
            <UserIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Dropdown overlay for collapsed mode */}
        {isDropdownOpen && isLoggedIn && (
          <div
            className="absolute left-full bottom-0 ml-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
            data-testid="profile-dropdown"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            </div>
            {profileActions.map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <action.icon className="w-4 h-4 text-gray-400" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Expanded mode: logged out - show Login button
  if (!isLoggedIn) {
    return (
      <div data-testid="profile-menu-expanded">
        <button
          onClick={onLoginClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-smart-navy bg-gray-50 hover:bg-gray-100 transition-colors"
          data-testid="profile-login-button"
        >
          <UserIcon className="w-5 h-5 text-smart-navy" />
          <span>Login</span>
        </button>
      </div>
    );
  }

  // Expanded mode: logged in - show avatar + name with dropdown
  return (
    <div className="relative" ref={menuRef} data-testid="profile-menu-expanded">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        data-testid="profile-menu-trigger"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-smart-navy text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(user?.name)}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 truncate">{user?.name}</span>
        <ChevronIcon className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown overlay for expanded mode */}
      {isDropdownOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
          data-testid="profile-dropdown"
        >
          {profileActions.map((action) => (
            <button
              key={action.label}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <action.icon className="w-4 h-4 text-gray-400" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Icon components
function UserIcon({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 9 3V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronIcon({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
