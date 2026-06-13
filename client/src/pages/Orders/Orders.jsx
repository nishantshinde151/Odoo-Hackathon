import React from 'react';

export default function Orders() {
  const ordersList = [
    { orderNo: 'ORD-2026-001', table: 'T01', amount: '₹420.00', status: 'Paid', time: '12:45 PM' },
    { orderNo: 'ORD-2026-002', table: 'T02', amount: '₹150.00', status: 'Sent to Kitchen', time: '01:15 PM' },
    { orderNo: 'ORD-2026-003', table: 'R01', amount: '₹220.00', status: 'Preparing', time: '01:30 PM' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Orders Log</h2>
        <span className="text-sm text-gray-500 font-medium">Session #42</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
              <th className="px-6 py-4">Order Number</th>
              <th className="px-6 py-4">Table</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {ordersList.map((ord, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-mono font-bold text-gray-900">{ord.orderNo}</td>
                <td className="px-6 py-4">{ord.table}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{ord.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    ord.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                    ord.status === 'Preparing' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                    'bg-sky-50 text-sky-600'
                  }`}>{ord.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">{ord.time}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-amber-600 hover:text-amber-500 text-xs font-bold">View Receipt</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
