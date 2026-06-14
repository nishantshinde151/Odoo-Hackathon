import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Search, Loader2, Clock, CheckCircle2, Play, ChefHat, Filter } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

export default function Kitchen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'KITCHEN', 'PREPARING'

  useEffect(() => {
    fetchOrders();

    // Setup Socket.IO connection
    const socket = io('/', {
      path: '/socket.io',
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketStatus('Connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setSocketStatus('Disconnected');
    });

    // Listen for new orders sent to kitchen
    socket.on('kds:new_order', (order) => {
      if (['KITCHEN', 'PREPARING'].includes(order.status)) {
        setOrders((prev) => {
          const exists = prev.find(o => o.id === order.id);
          if (exists) return prev.map(o => o.id === order.id ? order : o);
          return [...prev, order];
        });
      }
    });

    // Listen for order status updates
    socket.on('pos:order_status_update', (order) => {
      setOrders((prev) => {
        // If it's completed or cancelled, remove it from the active KDS view
        if (!['KITCHEN', 'PREPARING'].includes(order.status)) {
          return prev.filter(o => o.id !== order.id);
        }
        
        // Otherwise, update or add it
        const exists = prev.find(o => o.id === order.id);
        if (exists) return prev.map(o => o.id === order.id ? order : o);
        return [...prev, order];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      // Only keep orders meant for kitchen
      const activeKitchenOrders = data.filter(o => ['KITCHEN', 'PREPARING'].includes(o.status));
      setOrders(activeKitchenOrders);
    } catch (error) {
      console.error('Failed to load kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'KITCHEN' ? 'PREPARING' : 'COMPLETED';
    try {
      // Optimistic UI update
      setOrders(prev => {
        if (nextStatus === 'COMPLETED') {
          return prev.filter(o => o.id !== orderId);
        }
        return prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);
      });
      
      await updateOrderStatus(orderId, nextStatus);
    } catch (error) {
      console.error(`Failed to update order status to ${nextStatus}:`, error);
      // Revert optimism by refetching
      fetchOrders();
    }
  };

  // Derived filtered data
  const filteredOrders = orders.filter(ord => {
    const matchesTab = activeTab === 'ALL' || ord.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(searchLower)) ||
      (ord.table?.tableNumber && ord.table.tableNumber.toLowerCase().includes(searchLower));
    
    return matchesTab && matchesSearch;
  });

  // Sort orders by oldest first (FIFO)
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const getTimeElapsed = (createdAt) => {
    const diff = Math.floor((new Date() - new Date(createdAt)) / 60000);
    if (diff < 1) return 'Just now';
    return `${diff} min ago`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
          <p className="font-semibold">Loading KDS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col font-sans animate-fade-in">
      {/* Header and Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ChefHat className="text-amber-600 w-7 h-7" />
            Kitchen Display System
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <p className="text-slate-500 text-sm font-semibold">{socketStatus}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Order or Table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('KITCHEN')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === 'KITCHEN' ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20' : 'text-slate-500 hover:text-slate-700'}`}
            >
              To Cook
            </button>
            <button
              onClick={() => setActiveTab('PREPARING')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === 'PREPARING' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Preparing
            </button>
          </div>
        </div>
      </div>

      {/* Kanban / Ticket Grid */}
      <div className="flex-1 overflow-y-auto pb-6">
        {sortedOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 p-10">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800">All clear!</h3>
            <p className="text-slate-500 mt-2">No active orders in the kitchen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOrders.map((ord) => {
              const isPreparing = ord.status === 'PREPARING';
              
              return (
                <div key={ord.id} className={`bg-white rounded-3xl shadow-sm border flex flex-col overflow-hidden transition-all duration-300 ${
                  isPreparing ? 'border-amber-300 shadow-amber-900/5' : 'border-rose-200 shadow-rose-900/5'
                }`}>
                  {/* Ticket Header */}
                  <div className={`p-4 flex justify-between items-center ${
                    isPreparing ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    <div>
                      <h4 className="font-black text-lg tracking-wider">{ord.orderNumber}</h4>
                      <p className="text-xs font-semibold opacity-90 mt-0.5">
                        {ord.table ? `Table ${ord.table.tableNumber}` : 'Takeaway'} 
                        {ord.customer && ` • ${ord.customer.name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {getTimeElapsed(ord.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="p-5 flex-1 bg-white">
                    <ul className="space-y-3.5">
                      {(ord.orderItems || []).map((item) => (
                        <li key={item.id} className="flex justify-between items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                          <div className="flex gap-3">
                            <span className="font-black text-lg text-slate-800 w-6">{item.quantity}x</span>
                            <div>
                              <span className="font-bold text-slate-700 text-sm block leading-tight">{item.product?.name || 'Unknown Item'}</span>
                              {item.product?.category?.name && (
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  {item.product.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-[#FAF8F6] border-t border-slate-100 flex gap-3">
                    {user?.role === 'EMPLOYEE' ? (
                      isPreparing ? (
                        <span className="flex-1 py-3 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 animate-pulse">
                          <Clock className="w-4 h-4" /> Preparing...
                        </span>
                      ) : (
                        <span className="flex-1 py-3 bg-rose-50 text-rose-700 border border-rose-250 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" /> Waiting to Cook
                        </span>
                      )
                    ) : isPreparing ? (
                      <button 
                        onClick={() => handleUpdateStatus(ord.id, ord.status)}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Ready to Serve
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus(ord.id, ord.status)}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                      >
                        <Play className="w-4 h-4" /> Start Cooking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
