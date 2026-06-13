import React from 'react';

export default function Categories() {
  const categoriesList = [
    { name: 'Beverages', color: '#ffb74d' },
    { name: 'Snacks', color: '#81c784' },
    { name: 'Desserts', color: '#e57373' },
    { name: 'Coffee', color: '#a1887f' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Categories</h2>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition text-sm font-medium">Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categoriesList.map((cat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
            <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-gray-500 font-semibold uppercase">{cat.color}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
