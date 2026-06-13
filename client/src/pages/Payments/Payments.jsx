import React from 'react';

export default function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Process Checkout Payment</h2>
        <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">Order #ORD-002</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-lg text-gray-800">Order Summary</h3>
          <div className="divide-y divide-gray-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span>Espresso (x2)</span>
              <span className="font-bold text-gray-800">₹240.00</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span>Club Sandwich (x1)</span>
              <span className="font-bold text-gray-800">₹180.00</span>
            </div>
            <div className="py-2.5 flex justify-between text-base font-extrabold text-gray-800 pt-3 border-t">
              <span>Total Payable</span>
              <span className="text-amber-600">₹441.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-lg text-gray-800">Payment Gateway</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <button className="py-3 bg-amber-50 border border-amber-500 text-amber-700 font-bold rounded-xl text-center text-sm transition hover:bg-amber-100">Cash</button>
            <button className="py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-center text-sm transition hover:bg-gray-50">Card</button>
            <button className="py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-center text-sm transition hover:bg-gray-50">UPI QR</button>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <input
              type="text"
              placeholder="UPI Transaction Reference / Card Slip #"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
            />
            <button className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-900/10">Confirm Payment & Invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
}
