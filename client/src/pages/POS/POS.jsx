import React, { useState } from 'react';

export default function POS() {
  const [cart, setCart] = useState([
    { name: 'Espresso', price: 120, qty: 2 },
    { name: 'Chocolate Fudge', price: 220, qty: 1 }
  ]);

  const items = [
    { name: 'Espresso', price: 120, cat: 'Coffee' },
    { name: 'Cappuccino', price: 150, cat: 'Coffee' },
    { name: 'Latte', price: 160, cat: 'Coffee' },
    { name: 'Club Sandwich', price: 180, cat: 'Snacks' },
    { name: 'Chocolate Fudge', price: 220, cat: 'Desserts' }
  ];

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const tax = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + tax;

  return (
    <div className="flex h-full space-x-6">
      {/* Product grid catalog */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-amber-500"
          />
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-lg">All</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200">Coffee</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200">Snacks</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-amber-500 cursor-pointer transition">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{item.cat}</span>
                <h4 className="font-bold text-gray-800 mt-2">{item.name}</h4>
              </div>
              <div className="flex justify-between items-center mt-4 border-t border-gray-50 pt-3">
                <span className="font-extrabold text-gray-900">₹{item.price.toFixed(2)}</span>
                <button className="w-8 h-8 bg-amber-100 text-amber-700 font-bold flex items-center justify-center rounded-lg hover:bg-amber-600 hover:text-white transition">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart details & checkout */}
      <div className="w-96 bg-white border border-gray-100 rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden">
        <div>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Current Cart</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">Table T01</span>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto max-h-[300px]">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-gray-400 text-xs">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-6 h-6 border border-gray-200 hover:bg-gray-50 rounded flex items-center justify-center font-bold text-gray-500">-</button>
                  <span className="font-semibold text-gray-800 w-4 text-center">{item.qty}</span>
                  <button className="w-6 h-6 border border-gray-200 hover:bg-gray-50 rounded flex items-center justify-center font-bold text-gray-500">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5% GST)</span>
              <span className="font-semibold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-800 font-extrabold text-base pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-amber-600">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button className="py-2.5 border border-amber-600 text-amber-600 hover:bg-amber-50 rounded-xl font-bold transition text-xs">Send to Kitchen</button>
            <button className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition text-xs shadow-lg shadow-amber-900/10">Pay Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
