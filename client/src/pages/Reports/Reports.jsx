import React from 'react';

export default function Reports() {
  const reportsList = [
    { title: 'Daily Sales Trend', type: 'Sales', format: 'PDF / Excel' },
    { title: 'Top-Selling Products', type: 'Inventory', format: 'PDF / Excel' },
    { title: 'Employee Performance Logs', type: 'Audit', format: 'PDF' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Business Reports</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition">Today</button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-500 transition">This Month</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((rep, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-44">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{rep.type}</span>
              <h3 className="font-bold text-lg text-gray-800 mt-2">{rep.title}</h3>
            </div>
            <div className="flex justify-between items-center border-t pt-3 mt-4">
              <span className="text-xs text-gray-400 font-semibold">{rep.format}</span>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-amber-100 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold text-amber-800 transition">PDF</button>
                <button className="px-3 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg text-xs font-bold text-slate-800 transition">Excel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
