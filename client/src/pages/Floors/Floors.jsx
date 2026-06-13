import React from 'react';

export default function Floors() {
  const floorsList = [
    { name: 'Ground Floor', tablesCount: 12 },
    { name: 'Rooftop Lounge', tablesCount: 8 },
    { name: 'Garden Area', tablesCount: 6 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Floors Layout</h2>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition text-sm font-medium">Add Floor</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {floorsList.map((floor, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{floor.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{floor.tablesCount} Tables Configured</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold">Configure Layout</button>
              <button className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
