import React from 'react';

export default function Customers() {
  const customersList = [
    { name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Customer Directory</h2>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition text-sm font-medium">Add Customer</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {customersList.map((cust, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-semibold text-gray-900">{cust.name}</td>
                <td className="px-6 py-4">{cust.email}</td>
                <td className="px-6 py-4">{cust.phone}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-amber-600 hover:text-amber-500 text-xs font-bold mr-3">Edit Details</button>
                  <button className="text-rose-600 hover:text-rose-500 text-xs font-bold">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
