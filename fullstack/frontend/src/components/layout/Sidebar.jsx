import { NavLink } from 'react-router-dom';
import ProfileMenu from '../features/profile/ProfileMenu';
import NotificationMenu from '../features/notifications/NotificationMenu';

// Ikon untuk setiap menu
const MenuIcon = ({ name, className = '' }) => {
  const icons = {
    home: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1"/>
        <rect x="13" y="3" width="8" height="8" rx="1"/>
        <rect x="3" y="13" width="8" height="8" rx="1"/>
        <rect x="13" y="13" width="8" height="8" rx="1"/>
      </>
    ),
    method: (
      <>
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </>
    ),
    analysis: (
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    ),
    recommendation: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    ),
    history: (
      <>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
        <path d="M4.93 4.93l1.41 1.41"/>
      </>
    ),
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {icons[name]}
    </svg>
  );
};

export default function Sidebar({ isOpen, onToggle, isLoggedIn = false, user = null, onLoginClick = () => {} }) {
  const isCollapsed = !isOpen;
  const menus = [
    { to: '/',              label: 'Home',           icon: 'home' },
    { to: '/method',        label: 'Method',         icon: 'method' },
    { to: '/analysis',      label: 'Analysis',       icon: 'analysis' },
    { to: '/recommendation',label: 'Recommendation', icon: 'recommendation' },
    { to: '/history',       label: 'History',        icon: 'history' },
  ];

  return (
    <>
      {/* Sidebar penuh */}
      <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex flex-col justify-between gap-6 transition-transform duration-300 ease-in-out z-40`}>

        {/* Tombol Close Sidebar */}
        <button
          onClick={onToggle}
          className="absolute right-3 top-7 z-50 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          {/* Tooltip */}
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
            Close sidebar
          </span>
        </button>

        {/* Top Section (Logo & Navigation) */}
        <div>
          {/* Logo Area */}
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="w-8 h-8 bg-smart-navy rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-smart-navy whitespace-nowrap">SmartInvest</h1>
          </div>

          {/* Navigation Menu dengan Ikon */}
          <nav className="flex flex-col gap-2 px-4 mt-4">
            {menus.map((menu) => (
              <NavLink
                key={menu.to}
                to={menu.to}
                end={menu.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors w-full whitespace-nowrap
                  ${isActive ? 'bg-smart-navy text-white' : 'text-gray-500 hover:bg-gray-50'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <MenuIcon name={menu.icon} className={isActive ? 'text-white' : 'text-smart-navy'} />
                    <span>{menu.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section (NotificationMenu & ProfileMenu) */}
        <div className="flex flex-col gap-2 px-4 pb-6" data-testid="sidebar-bottom-section">
          <NotificationMenu isCollapsed={isCollapsed} />
          <ProfileMenu
            isLoggedIn={isLoggedIn}
            user={user}
            onLoginClick={onLoginClick}
            isCollapsed={false}
          />
        </div>

        {/* Background Logo Watermark */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="absolute -right-12 bottom-12 w-64 h-64 text-blue-900 opacity-[0.04]">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
      </aside>

      {/* Mini navigation bar (muncul saat sidebar tertutup) */}
      {!isOpen && (
        <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-100 flex flex-col items-center justify-between py-4 z-40 transition-opacity duration-300">
          {/* Top Section */}
          <div className="flex flex-col items-center">
            {/* Logo button untuk buka sidebar */}
            <button
              onClick={onToggle}
              title="Open sidebar"
              className="w-10 h-10 bg-smart-navy rounded-lg flex items-center justify-center mb-6 hover:opacity-90 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </button>

            {/* Ikon navigasi */}
            <nav className="flex flex-col gap-2 items-center w-full px-2">
              {menus.map((menu) => (
                <NavLink
                  key={menu.to}
                  to={menu.to}
                  end={menu.to === '/'}
                  title={menu.label}
                  className={({ isActive }) =>
                    `w-10 h-10 flex items-center justify-center rounded-xl transition-colors
                    ${isActive ? 'bg-smart-navy text-white' : 'text-gray-500 hover:bg-gray-100'}`
                  }
                >
                  <MenuIcon name={menu.icon} />
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom Section (NotificationMenu & ProfileMenu icons) */}
          <div className="flex flex-col gap-2 items-center pb-2" data-testid="mini-sidebar-bottom-section">
            <NotificationMenu isCollapsed={true} />
            <ProfileMenu
              isLoggedIn={isLoggedIn}
              user={user}
              onLoginClick={onLoginClick}
              isCollapsed={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
