import React from 'react';

export default function Kitchen() {
  const activeOrders = [
    {
      orderNo: 'ORD-002',
      table: 'T02',
      time: '12 mins ago',
      items: [
        { name: 'Espresso', qty: 2, done: false },
        { name: 'Club Sandwich', qty: 1, done: false }
      ]
    },
    {
      orderNo: 'ORD-003',
      table: 'R01',
      time: '5 mins ago',
      items: [
        { name: 'Capuccino', qty: 1, done: false },
        { name: 'Chocolate Fudge', qty: 1, done: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Kitchen Display System (KDS)</h2>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          <span>WebSocket Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeOrders.map((ord, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold tracking-wide text-amber-400">{ord.orderNo}</h4>
                  <p className="text-xs text-slate-400">Table: {ord.table}</p>
                </div>
                <span className="text-xs text-slate-400">{ord.time}</span>
              </div>

              <div className="p-4 divide-y divide-gray-100">
                {ord.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-slate-800 text-sm">{item.qty}x</span>
                      <span className={`ml-2 text-sm font-semibold ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.name}</span>
                    </div>
                    <button className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                      item.done ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white transition'
                    }`}>
                      {item.done ? 'Done' : 'Cook'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-50 bg-gray-50 flex space-x-2">
              <button className="flex-1 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-xs transition">Dismiss Ticket</button>
              <button className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition">Serve Order</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
