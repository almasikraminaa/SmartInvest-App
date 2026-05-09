// src/components/Sidebar.jsx

export default function Sidebar({ activePage, setActivePage }) {
  const menus = [
    { key: 'home',     label: 'Home' },
    { key: 'method',   label: 'Method' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'history',  label: 'History' },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex flex-col justify-between">
      
      {/* Bagian Atas (Logo & Menu) */}
      <div>
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-8 h-8 bg-smart-navy rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">~</span>
          </div>
          <h1 className="text-xl font-bold text-smart-navy">SmartInvest</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 px-4 mt-4">
          {menus.map((menu) => (
            <button
              key={menu.key}
              onClick={() => setActivePage(menu.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors w-full
                ${activePage === menu.key
                  ? 'bg-smart-navy text-white'
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              {menu.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bagian Bawah */}
      <div className="p-6 opacity-20 pointer-events-none">
        <img src="/path-ke-gambarmu.png" alt="background pattern" className="w-full" />
      </div>

    </aside>
  );
}
