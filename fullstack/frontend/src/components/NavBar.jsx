import { useState } from "react";

export default function NavBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <nav className="flex justify-end items-center mb-8">
            <div className="flex items-center gap-4">
                {/* Notification Icon with Red Dot */}
                <button className="relative p-2 text-gray-500 hover:text-smart-navy transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                    </svg>
                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                {/* garis pemisah vertikal antara notification dan profile */}
                <div className="w-px h-8 bg-gray-300"></div>

                {/* logika kondisional untuk menampilkan profile atau tombol login */}
                {isLoggedIn ? (
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1.5 pr-3 rounded-full transition-colors relative group">
                        <div className="w-9 h-9 bg-smart-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                            L
                        </div>
                        <span className="font-medium text-gray-700 text-sm">Leca</span>
                        {/* Dropdown menu untuk profile */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M6 9 6 6 6-6"/>
                        </svg>
                        {/* Dropdown Menu nanti disini */}
                    </div>

                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    );
}