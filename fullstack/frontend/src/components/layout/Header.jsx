// src/components/Navbar.jsx
import { useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notifications = [
    { id: 1, type: 'success', title: 'Dividen Diterima',   desc: 'Anda telah menerima dividen sebesar Rp 500.000 dari saham BBCA.', time: '10:30', date: 'HARI INI',              isRead: false },
    { id: 2, type: 'warning', title: 'Peringatan Harga',   desc: 'Saham BBRI telah mencapai target harga Anda di Rp 6.000.',        time: '09:15', date: 'HARI INI',              isRead: false },
    { id: 3, type: 'info',    title: 'Laporan Bulanan',    desc: 'Laporan kinerja portofolio bulan April 2026 telah tersedia.',      time: '14:20', date: 'KEMARIN, 07 MEI 2026', isRead: true  },
    { id: 4, type: 'success', title: 'Deposit Berhasil',   desc: 'Dana sebesar Rp 10.000.000 telah masuk ke RDN Anda.',             time: '08:45', date: 'KEMARIN, 07 MEI 2026', isRead: true  },
  ];

  const getIconColor = (type) => {
    if (type === 'success') return 'bg-green-500';
    if (type === 'warning') return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <>
      <nav className="flex justify-end items-center mb-8 relative z-40">
        <div className="flex items-center gap-4">

          {/* 1. BUTTON LONCENG & DROPDOWN NOTIFIKASI */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2 transition-colors rounded-full ${isNotifOpen ? 'bg-gray-100 text-smart-navy' : 'text-gray-500 hover:text-smart-navy'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* BOX DROPDOWN NOTIFIKASI */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in origin-top-right">

                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-smart-navy">Notifikasi</h3>
                  <button className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    Tandai semua dibaca
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-blue-50/20' : ''}`}>
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${getIconColor(notif.type)}`}></div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{notif.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.desc}</p>
                        <span className="text-xs text-blue-500 font-medium mt-1 inline-block">Baca selengkapnya...</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setIsNotifOpen(false); setIsModalOpen(true); }}
                  className="w-full text-center py-3 text-sm font-bold text-smart-navy hover:bg-gray-50 transition-colors border-t border-gray-100 bg-gray-50/50"
                >
                  Lihat Selengkapnya
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-gray-300"></div>

          {/* User Profile */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1.5 pr-3 rounded-full transition-colors relative group">
              <div className="w-9 h-9 bg-smart-green rounded-full flex items-center justify-center text-white font-bold text-sm">R</div>
              <span className="font-medium text-gray-700 text-sm">Reynaldi</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className="font-medium text-sm">Guest</span>
              <button
                onClick={() => setIsLoggedIn(true)}
                className="bg-smart-navy text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Log In
              </button>
            </div>
          )}

        </div>
      </nav>

      {/* 2. MODAL POPUP SEMUA NOTIFIKASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-smart-navy/40 backdrop-blur-sm p-4 animate-fade-in">

          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="px-8 pt-8 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-smart-navy mb-1">Semua Notifikasi</h2>
              <p className="text-gray-500 text-sm">Kelola semua pemberitahuan dan aktivitas akun Anda.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
              {['HARI INI', 'KEMARIN, 07 MEI 2026'].map((dateGroup) => (
                <div key={dateGroup}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-bold text-gray-400 tracking-wider">[{dateGroup}]</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {notifications.filter(n => n.date === dateGroup).map(notif => (
                      <div key={notif.id} className="group relative flex gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                        <div className="mt-1">
                          {notif.type === 'info' ? (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                          ) : (
                            <div className={`w-4 h-4 rounded-full ${getIconColor(notif.type)} border-2 border-white shadow-sm ring-1 ring-gray-100`}></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-smart-navy">{notif.title}</h4>
                            <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{notif.desc}</p>
                          <button className="text-sm text-blue-500 font-medium hover:underline">Baca selengkapnya...</button>
                        </div>
                        <button className="absolute right-4 top-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/80 rounded-b-3xl flex justify-between items-center">
              <button className="text-gray-500 text-sm font-bold flex items-center gap-2 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Hapus semua notifikasi
              </button>
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                Tandai semua dibaca
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
