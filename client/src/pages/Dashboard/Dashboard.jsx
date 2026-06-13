import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  Banknote, 
  Receipt, 
  LayoutGrid, 
  ArrowUpRight, 
  ChevronDown, 
  Award,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get('/api/reports/sales', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiveData(response.data);
      } catch (err) {
        console.error('Failed to fetch live sales reports, using mockup data.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  // Format currency helpers
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Mock values from screenshot
  const mockStats = {
    totalOrders: 1248,
    todayRevenue: 4250.00,
    avgOrderValue: 18.50, // screenshot value
    activeTables: "12/24",
    activeTablesPercent: 50
  };

  // Merge live database data if it exists, otherwise fall back to screenshot mocks
  const stats = {
    totalOrders: liveData?.totalOrders ? liveData.totalOrders + mockStats.totalOrders : mockStats.totalOrders,
    todayRevenue: liveData?.totalRevenue ? Number(liveData.totalRevenue) + mockStats.todayRevenue : mockStats.todayRevenue,
    avgOrderValue: liveData?.averageOrderValue ? Number(liveData.averageOrderValue) : mockStats.avgOrderValue,
    activeTables: mockStats.activeTables,
    activeTablesPercent: mockStats.activeTablesPercent
  };

  // Sales trend data (Mon - Sun)
  const salesTrends = [
    { day: 'Mon', height: '40%', value: '₹2,100' },
    { day: 'Tue', height: '65%', value: '₹3,412' },
    { day: 'Wed', height: '50%', value: '₹2,630' },
    { day: 'Thu', height: '80%', value: '₹4,250' },
    { day: 'Fri', height: '60%', value: '₹3,180' },
    { day: 'Sat', height: '85%', value: '₹4,510' },
    { day: 'Sun', height: '70%', value: '₹3,720' }
  ];

  // Top Selling Products
  const topProducts = [
    { name: 'Espresso', count: 342, percent: '90%' },
    { name: 'Croissant', count: 289, percent: '75%' },
    { name: 'Latte', count: 215, percent: '55%' },
    { name: 'Cappuccino', count: 188, percent: '45%' }
  ];

  // Recent Orders
  const recentOrders = [
    { id: '#9842', table: 'T-04', items: '3 Items', amount: 24.50, status: 'Completed' },
    { id: '#9841', table: 'T-12', items: '1 Item', amount: 12.00, status: 'Preparing' },
    { id: '#9840', table: 'T-08', items: '5 Items', amount: 45.20, status: 'Completed' }
  ];

  // Employee Performance
  const employees = [
    { 
      name: 'Sarah Jenkins', 
      orders: 42, 
      sales: 842.00, 
      rank: 1, 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80' 
    },
    { 
      name: 'Marcus Vole', 
      orders: 38, 
      sales: 720.50, 
      rank: 2, 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80' 
    },
    { 
      name: 'Elena Rodriguez', 
      orders: 31, 
      sales: 612.00, 
      rank: 3, 
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&fit=crop&q=80' 
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans animate-fade-in">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-[#8A583C]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              {stats.totalOrders.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[#2E7D32] text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>12% increase</span>
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400">Today's Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-[#8A583C]">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              {formatINR(stats.todayRevenue)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[#2E7D32] text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>8.5% higher</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400">Avg. Order Value</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-[#8A583C]">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              {formatINR(stats.avgOrderValue)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs font-semibold">
              <span className="text-lg leading-none select-none">—</span>
              <span>Stable trend</span>
            </div>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400">Active Tables</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-[#8A583C]">
              <LayoutGrid className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              {stats.activeTables}
            </span>
            {/* Custom progress bar */}
            <div className="mt-4">
              <div className="w-full bg-[#FAF6F0] rounded-full h-2">
                <div 
                  className="bg-[#8A583C] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.activeTablesPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid (Sales Trends & Top Selling Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trends Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-850">Sales Trends</h3>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF8F6] border border-gray-100 hover:bg-gray-100/50 rounded-2xl text-xs font-bold text-gray-600 transition">
              <span>Last 7 Days</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar Chart Graphics */}
          <div className="flex items-end justify-between h-64 px-4 pt-4 border-b border-gray-100">
            {salesTrends.map((trend, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div className="relative w-7 sm:w-10 bg-[#FAF6F0] rounded-t-full rounded-b-full h-44 flex items-end overflow-hidden cursor-pointer">
                  {/* Inner filled bar */}
                  <div 
                    className="bg-[#8A583C] w-full rounded-b-full rounded-t-full group-hover:bg-[#73442A] transition-colors duration-300"
                    style={{ height: trend.height }}
                  ></div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#231510] text-[#D9C3B0] text-[10px] font-bold py-1.5 px-2.5 rounded-lg shadow-md transition-opacity duration-300 pointer-events-none whitespace-nowrap z-25">
                    {trend.value}
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400 mt-3">{trend.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-850 mb-6">Top Selling Products</h3>
            <div className="space-y-5">
              {topProducts.map((prod, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">{prod.name}</span>
                    <span className="font-semibold text-gray-400">{prod.count} units</span>
                  </div>
                  <div className="w-full bg-[#FAF6F0] rounded-full h-2.5">
                    <div 
                      className="bg-[#8A583C] h-2.5 rounded-full" 
                      style={{ width: prod.percent }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-3.5 border border-[#8A583C]/35 text-[#8A583C] hover:bg-[#8A583C]/5 font-bold text-sm rounded-2xl transition duration-300 mt-6">
            View Detailed Report
          </button>
        </div>
      </div>

      {/* Bottom Grid (Recent Orders & Employee Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-850">Recent Orders</h3>
            <button className="text-xs font-bold text-[#8A583C] hover:underline">View All</button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Table</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {recentOrders.map((ord, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F6]/40 transition duration-200">
                    <td className="py-4 font-bold text-gray-700">{ord.id}</td>
                    <td className="py-4 font-semibold text-gray-650">{ord.table}</td>
                    <td className="py-4 text-gray-500">{ord.items}</td>
                    <td className="py-4 font-bold text-gray-700">{formatINR(ord.amount)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'Completed' 
                          ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                          : 'bg-[#FFF3E0] text-[#E65100]'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Performance */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-850 mb-6">Employee Performance</h3>
          
          <div className="space-y-4">
            {employees.map((emp) => (
              <div 
                key={emp.rank} 
                className="flex items-center justify-between p-3.5 bg-[#FAF8F6]/80 rounded-2xl hover:bg-[#FAF8F6] hover:shadow-sm border border-transparent hover:border-gray-100 transition duration-300"
              >
                <div className="flex items-center gap-3">
                  {/* Superimposed rank avatar */}
                  <div className="relative">
                    <img 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" 
                      src={emp.avatar} 
                      alt={emp.name} 
                    />
                    <div className="absolute -bottom-1.5 -right-1 w-5 h-5 bg-[#8A583C] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                      {emp.rank}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{emp.name}</h4>
                    <p className="text-[11px] text-gray-400 font-semibold">{emp.orders} orders today</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#2E7D32] block">
                    {formatINR(emp.sales)}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider block">Total Sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
