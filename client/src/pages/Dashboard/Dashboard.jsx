import React from 'react';

export default function Dashboard() {
  const stats = [
    { title: "Total Revenue", value: "₹24,500.00", change: "+15.2% from yesterday", color: "border-emerald-500" },
    { title: "Total Orders", value: "148", change: "+8.3% from yesterday", color: "border-blue-500" },
    { title: "Average Order Value", value: "₹165.50", change: "+6.1% from yesterday", color: "border-amber-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Business Dashboard</h2>
        <span className="text-sm text-gray-500">Live Analytics</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${stat.color} space-y-2`}>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
            <p className="text-3xl font-extrabold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 font-sans">Today's Active Session Sales</h3>
        <p className="text-gray-500 text-sm">Dashboard metrics will display graph charts and metrics summaries once orders are populated.</p>
      </div>
    </div>
  );
}
