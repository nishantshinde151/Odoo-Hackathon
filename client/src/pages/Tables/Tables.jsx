import React from 'react';

export default function Tables() {
  const tablesList = [
    { tableNumber: 'T01', floor: 'Ground Floor', seats: 4, status: 'Active' },
    { tableNumber: 'T02', floor: 'Ground Floor', seats: 2, status: 'Active' },
    { tableNumber: 'T03', floor: 'Ground Floor', seats: 6, status: 'Active' },
    { tableNumber: 'R01', floor: 'Rooftop Lounge', seats: 4, status: 'Active' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dining Tables</h2>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition text-sm font-medium">Add Table</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
              <th className="px-6 py-4">Table Number</th>
              <th className="px-6 py-4">Floor Location</th>
              <th className="px-6 py-4">Seats Count</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {tablesList.map((tbl, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">{tbl.tableNumber}</td>
                <td className="px-6 py-4">{tbl.floor}</td>
                <td className="px-6 py-4">{tbl.seats} Seats</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 font-semibold text-xs rounded-full">{tbl.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-amber-600 hover:text-amber-500 text-xs font-bold mr-3">Modify</button>
                  <button className="text-rose-600 hover:text-rose-500 text-xs font-bold">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
