import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, Eye, Trash2, Edit2, X, Printer, Mail, 
  ShoppingBag, Clock, User, CreditCard, ChevronRight, DollarSign, Filter, RefreshCw
} from 'lucide-react';
import { getOrders, deleteOrder } from '../../services/orderService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // holds orderId to delete
  const navigate = useNavigate();

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresh orders on a periodic interval or via socket event broadcast
  }, []);

  const handleDelete = async (orderId) => {
    try {
      await deleteOrder(orderId);
      setShowDeleteConfirm(null);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete order.');
    }
  };

  const handleEditDraft = (order) => {
    navigate(`/pos?orderId=${order.id}&tableId=${order.tableId}`);
  };

  // Helper: Format Date/Time
  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter(ord => {
    // 1. Search filter
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.table?.tableNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Status filter
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;

    // 3. Date filter
    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const orderDate = new Date(ord.createdAt);
      const today = new Date();
      
      const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));
      
      if (dateFilter === 'TODAY') {
        matchesDate = startOfDay(orderDate).getTime() === startOfDay(today).getTime();
      } else if (dateFilter === 'YESTERDAY') {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        matchesDate = startOfDay(orderDate).getTime() === startOfDay(yesterday).getTime();
      } else if (dateFilter === 'WEEK') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        matchesDate = orderDate >= oneWeekAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate Metrics based on current lists
  const paidOrders = orders.filter(o => o.status === 'PAID');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + parseFloat(o.grandTotal), 0);
  const totalSalesCount = paidOrders.length;
  const activeDraftsCount = orders.filter(o => o.status === 'DRAFT').length;

  // Status Badges Styling Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'KITCHEN':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'PREPARING':
        return 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse';
      case 'COMPLETED':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'PAID':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'CANCELLED':
        return 'bg-neutral-100 text-neutral-500 border border-neutral-200';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans animate-fade-in">
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-[#8A583C] w-7 h-7" />
            Orders History Log
          </h2>
          <p className="text-slate-500 text-sm mt-1">Audit transactions, manage table bookings, view receipts, and update active orders.</p>
        </div>
        <button 
          onClick={() => fetchOrders()}
          className="p-3 text-slate-500 hover:text-[#8A583C] bg-[#FAF8F6] hover:bg-[#FAF6F0] rounded-xl border border-slate-100/50 transition duration-300 self-stretch md:self-auto flex items-center justify-center gap-2 font-bold text-xs"
          title="Refresh log"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Ledger
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Settled Revenue</span>
            <span className="text-slate-800 text-xl font-black">₹{totalRevenue.toFixed(2)}</span>
            <span className="block text-slate-400 text-[10px] mt-0.5">{totalSalesCount} paid orders</span>
          </div>
        </div>

        {/* Card 2: Drafts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Active Drafts</span>
            <span className="text-slate-800 text-xl font-black">{activeDraftsCount} Tickets</span>
            <span className="block text-slate-400 text-[10px] mt-0.5">Editable bookings at tables</span>
          </div>
        </div>

        {/* Card 3: Total Logs */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Total Registers</span>
            <span className="text-slate-800 text-xl font-black">{orders.length} Tickets</span>
            <span className="block text-slate-400 text-[10px] mt-0.5">All tickets tracked in session</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name, table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10.5 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] transition"
            />
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none bg-white text-slate-600"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="WEEK">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Status Tab buttons */}
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {['ALL', 'DRAFT', 'KITCHEN', 'PREPARING', 'COMPLETED', 'PAID', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
                statusFilter === status
                  ? 'bg-[#8A583C] text-white shadow-sm'
                  : 'bg-[#FAF8F6] text-slate-600 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All Statuses' : status}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE VIEW OF ORDERS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#8A583C] border-t-transparent animate-spin"></div>
            <span className="text-slate-400 font-semibold text-xs">Loading ledger log...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold">No orders found matching the filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Ticket Info</th>
                  <th className="px-6 py-4">Dining Table</th>
                  <th className="px-6 py-4">Seated Customer</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-semibold">
                {filteredOrders.map((ord) => {
                  const { date, time } = formatDateTime(ord.createdAt);
                  const itemsCount = ord.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                  return (
                    <tr 
                      key={ord.id} 
                      className="hover:bg-slate-50/40 cursor-pointer transition"
                      onClick={() => setSelectedOrder(ord)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 text-sm block font-mono">#{ord.orderNumber.split('-')[1] || ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">{itemsCount} items ordered</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-[#8A583C]/5 text-[#8A583C] px-3 py-1 rounded-xl font-extrabold text-[10px] border border-[#8A583C]/5">
                          Table {ord.table?.tableNumber || 'N/A'}
                        </span>
                        <span className="text-[9px] text-slate-450 block mt-1">{ord.table?.floor?.name || 'Main Floor'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-800 font-bold block">{ord.customer?.name || 'Walk-in Customer'}</span>
                        <span className="text-[10px] text-slate-400">{ord.customer?.phone || 'No Phone'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-850 block">{date}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {time}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900 font-black text-sm block">₹{parseFloat(ord.grandTotal).toFixed(2)}</span>
                        {parseFloat(ord.discount) > 0 && (
                          <span className="text-emerald-600 text-[9px] font-bold">-{parseFloat(ord.discount).toFixed(2)} off</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide inline-block ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-2 bg-slate-50 border border-slate-100 text-slate-600 hover:text-[#8A583C] hover:bg-[#FAF6F0] rounded-xl transition"
                            title="Preview Ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {ord.status === 'DRAFT' && (
                            <button
                              onClick={() => handleEditDraft(ord)}
                              className="p-2 bg-slate-50 border border-slate-100 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                              title="Resume Cart"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {(ord.status === 'DRAFT' || ord.status === 'CANCELLED') && (
                            <button
                              onClick={() => setShowDeleteConfirm(ord.id)}
                              className="p-2 bg-slate-50 border border-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL RECEIPT OVERLAY MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white h-full sm:h-auto sm:max-w-md w-full sm:rounded-3xl border-l sm:border border-slate-150 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-[#FAF8F6]">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Order Details</h3>
                <p className="text-slate-400 text-xs mt-0.5">Ticket #{selectedOrder.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-lg transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Scrollable Receipt Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
              {/* Dining & Customer info */}
              <div className="grid grid-cols-2 gap-4 border border-slate-100 bg-slate-50/50 p-4.5 rounded-2xl text-[11px] font-bold text-slate-600">
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] tracking-wider font-extrabold mb-1">Dine Location</span>
                  <span className="text-slate-800 text-xs font-black block">Table {selectedOrder.table?.tableNumber || 'Walk-in'}</span>
                  <span className="text-slate-400 mt-0.5 block">{selectedOrder.table?.floor?.name || 'Main Floor'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] tracking-wider font-extrabold mb-1">Customer info</span>
                  <span className="text-slate-800 text-xs font-black block">{selectedOrder.customer?.name || 'Walk-in Customer'}</span>
                  <span className="text-slate-400 mt-0.5 block">{selectedOrder.customer?.phone || 'No phone'}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200/60 pt-3 mt-1 flex justify-between items-center">
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px] tracking-wider font-extrabold">Registered Time</span>
                    <span className="text-slate-800 mt-0.5 block">{formatDateTime(selectedOrder.createdAt).date} at {formatDateTime(selectedOrder.createdAt).time}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-3">
                <span className="block text-slate-400 uppercase text-[9px] tracking-wider font-extrabold">Itemized list</span>
                {selectedOrder.orderItems?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No items registered on this ticket.</p>
                ) : (
                  <div className="space-y-3 border-b border-slate-100 pb-3">
                    {selectedOrder.orderItems?.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-xs font-bold text-slate-700">
                        <div className="flex-1 pr-4">
                          <p className="text-slate-800 font-extrabold">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">₹{parseFloat(item.unitPrice).toFixed(2)} x {item.quantity}</p>
                        </div>
                        <span className="text-slate-900 font-black">₹{parseFloat(item.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Calculations Breakdowns */}
              <div className="space-y-2 text-xs text-slate-500 font-semibold bg-[#FAF8F6] p-4.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800">₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (5%)</span>
                  <span className="text-slate-800">₹{parseFloat(selectedOrder.tax).toFixed(2)}</span>
                </div>

                {/* Discount components */}
                {parseFloat(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-200/50 pt-2 mt-1">
                    <span>Discounts Deducted</span>
                    <span>-₹{parseFloat(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}

                {/* Coupon breakdown */}
                {selectedOrder.orderCoupons && selectedOrder.orderCoupons.length > 0 && (
                  <div className="flex justify-between text-emerald-600 text-[10px] italic pl-3">
                    <span>Coupon: {selectedOrder.orderCoupons[0].coupon?.code}</span>
                    <span>({selectedOrder.orderCoupons[0].coupon?.discountType === 'PERCENTAGE' ? `${parseFloat(selectedOrder.orderCoupons[0].coupon?.discountValue)}%` : `₹${parseFloat(selectedOrder.orderCoupons[0].coupon?.discountValue)}`})</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-2.5 border-t border-slate-200 mt-2">
                  <span>Grand Total</span>
                  <span className="text-[#8A583C] text-base font-black">₹{parseFloat(selectedOrder.grandTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-6 border-t border-slate-100 bg-[#FAF8F6] flex gap-3">
              {selectedOrder.status === 'DRAFT' && (
                <button
                  onClick={() => {
                    handleEditDraft(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-3 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/10"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Resume Ticket
                </button>
              )}
              {selectedOrder.status !== 'DRAFT' && (
                <button
                  onClick={() => alert('Simulating Print: Receipt sent to local printer.')}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="py-3 px-5 border border-slate-200 bg-white text-slate-505 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-800">Delete Draft Order?</h4>
              <p className="text-slate-400 text-xs mt-1">This will permanently delete this ticket ledger and free the dining table. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-550 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-950/10"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
