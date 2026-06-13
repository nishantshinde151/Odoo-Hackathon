import React from 'react';

export default function Products() {
  const productsList = [
    { name: 'Espresso', price: '₹120.00', category: 'Coffee', status: 'Active' },
    { name: 'Capuccino', price: '₹150.00', category: 'Coffee', status: 'Active' },
    { name: 'Club Sandwich', price: '₹180.00', category: 'Snacks', status: 'Active' },
    { name: 'Chocolate Fudge', price: '₹220.00', category: 'Desserts', status: 'Active' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Menu Products</h2>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition text-sm font-medium">Add Product</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {productsList.map((prod, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-semibold text-gray-900">{prod.name}</td>
                <td className="px-6 py-4">{prod.category}</td>
                <td className="px-6 py-4">{prod.price}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 font-semibold text-xs rounded-full">{prod.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-amber-600 hover:text-amber-500 text-xs font-bold mr-3">Edit</button>
                  <button className="text-rose-600 hover:text-rose-500 text-xs font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
