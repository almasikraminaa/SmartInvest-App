import { NavLink, useNavigate } from 'react-router-dom';
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

export default function Sidebar({ isOpen, onToggle, isLoggedIn = false, user = null, onLoginClick = () => {}, onLogout = () => {}, onProfileUpdate = () => {} }) {
  const navigate = useNavigate();
  const menus = [
    { to: '/',              label: 'Home',           icon: 'home' },
    { to: '/method',        label: 'Method',         icon: 'method' },
    { to: '/analysis',      label: 'Analysis',       icon: 'analysis' },
    { to: '/recommendation',label: 'Recommendation', icon: 'recommendation' },
    { to: '/history',       label: 'History',        icon: 'history' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col justify-between z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'}`}>

      {/* Top Section */}
      <div className="flex flex-col overflow-hidden">

        {/* ============================================ */}
        {/* 1. HEADER: Logo + Toggle                     */}
        {/* ============================================ */}
        <div className={`flex items-center w-full h-16 px-3 mt-4 mb-2 transition-all duration-300 ${isOpen ? 'justify-between' : 'justify-center'}`}>

          {isOpen ? (
            <>
              {/* Logo Penuh — klik teks untuk navigasi ke Home */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 bg-smart-navy rounded-lg flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <span onClick={() => navigate('/')} className="text-lg font-bold text-smart-navy whitespace-nowrap overflow-hidden cursor-pointer hover:text-blue-700 transition-colors duration-150" title="Kembali ke Home">SmartInvest</span>
              </div>

              {/* Tombol toggle tutup (ikon kotak sidebar) */}
              <button
                onClick={onToggle}
                title="Tutup sidebar"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
            </>
          ) : (
            /* Ikon Logo saja — berfungsi ganda sebagai toggle buka */
            <button
              onClick={onToggle}
              title="Buka sidebar"
              className="w-10 h-10 bg-smart-navy rounded-xl flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* ============================================ */}
        {/* 2. NAVIGATION MENU                           */}
        {/* ============================================ */}
        <nav className="flex flex-col gap-1.5 px-2 mt-2">
          {menus.map((menu) => (
            <NavLink
              key={menu.to}
              to={menu.to}
              end={menu.to === '/'}
              title={!isOpen ? menu.label : undefined}
              className={({ isActive }) => {
                // Saat tutup: kotak simetris terpusat
                if (!isOpen) {
                  return `w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out px-0 ${isActive ? 'bg-smart-navy text-white' : 'text-gray-500 hover:bg-gray-100'}`;
                }
                // Saat buka: bar memanjang dengan padding
                return `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ease-in-out ${isActive ? 'bg-smart-navy text-white' : 'text-gray-500 hover:bg-gray-50'}`;
              }}
            >
              {({ isActive }) => (
                <>
                  <MenuIcon name={menu.icon} className={isActive ? 'text-white' : 'text-smart-navy'} />
                  {/* 3. Teks menu: whitespace-nowrap + overflow-hidden */}
                  <span className={`whitespace-nowrap overflow-hidden transition-all duration-150 ease-in-out ${isOpen ? 'opacity-100 max-w-[160px] ml-0' : 'opacity-0 max-w-0'}`}>
                    {menu.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={`flex flex-col gap-2 pb-4 transition-all duration-300 ${isOpen ? 'px-3' : 'px-1 items-center'}`}>
        <NotificationMenu isCollapsed={!isOpen} />
        <ProfileMenu
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileUpdate={onProfileUpdate}
          isCollapsed={!isOpen}
        />
      </div>

      {/* Background Logo Watermark (only when open) */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="absolute -right-12 bottom-12 w-64 h-64 text-blue-900 opacity-[0.04]">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>
    </aside>
  );
}
