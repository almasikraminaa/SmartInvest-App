// src/pages/HistoryPage.jsx
import { useState } from 'react';

export default function HistoryPage() {
  const historyData = [
    { id: 1, analysisId: "ANL-8X9Q", date: "May 11, 2026", target: "LQ45",  method: "MVEP", return: "27.0%", risk: "18.1%" },
    { id: 2, analysisId: "ANL-2B4M", date: "May 10, 2026", target: "IDX30", method: "SIM",  return: "15.2%", risk: "12.4%" },
    { id: 3, analysisId: "ANL-9C1K", date: "May 08, 2026", target: "JII",   method: "CAF",  return: "--",    risk: "--"    },
  ];

  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(historyData.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-6xl mx-auto w-full">

      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-smart-navy mb-2">Analysis History</h1>
        <p className="text-gray-500 text-sm font-medium">Review and track your previous portfolio optimizations</p>
      </div>

      {/* 2. Controls Area */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">

        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            placeholder="Search by target, method, or date..."
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none focus:border-smart-green shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">

          <button
            disabled={selectedRows.length === 0}
            className="bg-white border border-gray-200 text-gray-600 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Update Privacy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </button>

          <button
            disabled={selectedRows.length === 0}
            className="bg-white border border-red-200 text-red-500 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Selected"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>

          <div className="w-px h-8 bg-gray-200 mx-1"></div>

          <button className="bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
          </button>
        </div>
      </div>

      {/* 3. Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">

            <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === historyData.length && historyData.length > 0}
                    className="w-4 h-4 text-smart-navy bg-gray-100 border-gray-300 rounded focus:ring-smart-navy cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Analysis ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Target Index</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Expected Return</th>
                <th className="px-6 py-4">Risk</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {historyData.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${selectedRows.includes(item.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="w-4 h-4 text-smart-navy bg-gray-100 border-gray-300 rounded focus:ring-smart-navy cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-gray-500">{item.analysisId}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                      {item.target}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-smart-navy">{item.method}</td>
                  <td className="px-6 py-4 font-bold text-smart-green">{item.return}</td>
                  <td className="px-6 py-4 font-bold text-gray-600">{item.risk}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
