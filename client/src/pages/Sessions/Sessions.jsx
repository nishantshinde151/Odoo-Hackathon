import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, User, Info, X, ClipboardList, CheckCircle2 } from 'lucide-react';
import { getSessions, getSessionSummary } from '../../services/sessionService';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedSessionId(id);
    setLoadingDetail(true);
    try {
      const data = await getSessionSummary(id);
      setSessionDetail(data);
    } catch (err) {
      alert('Failed to load session details.');
      setSelectedSessionId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedSessionId(null);
    setSessionDetail(null);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-[#8A583C] w-7 h-7" />
            POS Cashier Sessions
          </h2>
          <p className="text-slate-500 text-sm mt-1">Audit previous work shift sessions, opening controls, and actual drawer counts.</p>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#8A583C]" />
          <p className="font-semibold text-sm">Loading session history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-100 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold">No POS sessions have been recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Cashier</th>
                  <th className="px-6 py-4">Opened At</th>
                  <th className="px-6 py-4">Closed At</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Opening Balance</th>
                  <th className="px-6 py-4 text-right">Closing Drawer</th>
                  <th className="px-6 py-4 text-right">Sales Total</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {sessions.map((sess) => {
                  const isClosed = sess.status === 'CLOSED';
                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#8A583C]/10 rounded-full flex items-center justify-center text-[#8A583C]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{sess.userName || 'Staff Member'}</span>
                            <span className="text-[10px] text-slate-400 block font-semibold">{sess.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(sess.openingTime).toLocaleDateString()} at{' '}
                        {new Date(sess.openingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {isClosed ? (
                          <>
                            {new Date(sess.closingTime).toLocaleDateString()} at{' '}
                            {new Date(sess.closingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </>
                        ) : (
                          <span className="text-emerald-600 font-extrabold flex items-center gap-1 animate-pulse">
                            Active Session
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                          isClosed 
                            ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse'
                        }`}>
                          {sess.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">
                        ₹{sess.openingBalance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">
                        {sess.closingAmount !== null ? `₹${sess.closingAmount.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[#8A583C] text-sm">
                        ₹{sess.totalSales.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(sess.id)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-[#8A583C]/10 text-slate-600 hover:text-[#8A583C] rounded-xl font-bold border border-slate-200 transition flex items-center gap-1 mx-auto"
                        >
                          <Info className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Session Details Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-[#FAF8F6]">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Session Audit Details</h3>
                <p className="text-slate-400 text-xs mt-0.5">Session ID #{selectedSessionId}</p>
              </div>
              <button 
                onClick={handleCloseDetailModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#8A583C]" />
                <p className="font-semibold text-xs">Loading audit records...</p>
              </div>
            ) : sessionDetail ? (
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {/* Session Card Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider">Cashier Name</span>
                    <span className="text-slate-800 text-xs font-bold">{sessionDetail.user?.name || 'Staff Member'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider">Start Time</span>
                    <span className="text-slate-800 text-xs font-semibold">
                      {new Date(sessionDetail.openingTime).toLocaleDateString()} at{' '}
                      {new Date(sessionDetail.openingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider">Status</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase inline-block mt-0.5 ${
                      sessionDetail.status === 'CLOSED' ? 'bg-slate-150 text-slate-650' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {sessionDetail.status}
                    </span>
                  </div>
                </div>

                {/* Audit Calculations Grid */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">Drawer Audit Calculations</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3.5 bg-white border border-slate-100 rounded-2xl">
                      <span className="block text-slate-400 text-[9px] font-bold uppercase">Opening Cash</span>
                      <span className="text-slate-800 text-xs font-extrabold mt-1 block">₹{sessionDetail.openingBalance.toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 bg-white border border-slate-100 rounded-2xl">
                      <span className="block text-slate-400 text-[9px] font-bold uppercase">Expected Sales</span>
                      <span className="text-slate-800 text-xs font-extrabold mt-1 block">₹{sessionDetail.totalSales.toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 bg-white border border-slate-100 rounded-2xl">
                      <span className="block text-slate-400 text-[9px] font-bold uppercase">Expected Cash</span>
                      <span className="text-slate-800 text-xs font-extrabold mt-1 block">₹{sessionDetail.expectedAmount.toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 bg-[#FAF8F6] border border-[#8A583C]/10 rounded-2xl">
                      <span className="block text-[#8A583C] text-[9px] font-bold uppercase">Actual Drawer</span>
                      <span className="text-[#8A583C] text-xs font-black mt-1 block">
                        {sessionDetail.closingAmount !== null ? `₹${sessionDetail.closingAmount.toFixed(2)}` : '—'}
                      </span>
                    </div>
                  </div>
                  
                  {sessionDetail.discrepancy !== null && (
                    <div className={`mt-3 p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                      sessionDetail.discrepancy >= 0 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      <span>Session Cash Discrepancy:</span>
                      <span>
                        {sessionDetail.discrepancy >= 0 ? 'Surplus / Match (+' : 'Deficit (-'}
                        ₹{Math.abs(sessionDetail.discrepancy).toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Paid Transactions List */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">
                    Orders Audited ({sessionDetail.ordersCount})
                  </h4>
                  {sessionDetail.orders.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 rounded-xl">
                      No sales transactions recorded in this session.
                    </p>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase">
                            <th className="px-4 py-2.5">Order ID</th>
                            <th className="px-4 py-2.5">Table</th>
                            <th className="px-4 py-2.5">Customer</th>
                            <th className="px-4 py-2.5 text-right">Grand Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                          {sessionDetail.orders.map((ord) => (
                            <tr key={ord.id}>
                              <td className="px-4 py-2.5 font-bold text-slate-800">{ord.orderNumber}</td>
                              <td className="px-4 py-2.5">Table {ord.table?.tableNumber || 'Takeaway'}</td>
                              <td className="px-4 py-2.5">{ord.customer?.name || 'Walk-in'}</td>
                              <td className="px-4 py-2.5 text-right text-[#8A583C]">₹{parseFloat(ord.grandTotal).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="bg-[#FAF8F6] border-t border-slate-100 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseDetailModal}
                className="px-4 py-2.5 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-xs font-bold shadow-md shadow-amber-900/10 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
