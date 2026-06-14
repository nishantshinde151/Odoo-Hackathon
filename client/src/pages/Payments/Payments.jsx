import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard, Smartphone, DollarSign, ArrowLeft, CheckCircle2,
  ChevronRight, Printer, Mail, Clock, User, Sparkles, Check, QrCode, X, Loader2
} from 'lucide-react';
import { getOrderById } from '../../services/orderService';
import { processPayment, sendEmailReceipt } from '../../services/paymentService';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('CASH'); // 'CASH' | 'CARD' | 'UPI'

  // Inputs
  const [cashReceived, setCashReceived] = useState('');
  const [cardRef, setCardRef] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'failed'
  const [emailInput, setEmailInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/pos');
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        if (data.status === 'PAID') {
          alert('This order has already been paid!');
          navigate('/pos');
          return;
        }
        setOrder(data);
        // Default cash received to grandTotal rounded up
        setCashReceived(Math.ceil(parseFloat(data.grandTotal)).toString());
      } catch (err) {
        console.error('Failed to load order for payment:', err);
        alert('Order not found or access unauthorized.');
        navigate('/pos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);


  if (loading || !order) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#8A583C] animate-spin" />
        <span className="text-slate-500 font-semibold text-sm">Loading billing summary...</span>
      </div>
    );
  }

  const grandTotal = parseFloat(order.grandTotal);
  const parsedCashReceived = parseFloat(cashReceived) || 0;
  const cashChange = Math.max(0, parsedCashReceived - grandTotal);
  const isCashValid = parsedCashReceived >= grandTotal;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validation
    let ref = '';
    if (activeTab === 'CARD') {
      if (!cardRef.trim()) {
        alert('Please enter Card transaction reference number.');
        return;
      }
      ref = cardRef.trim();
    } else if (activeTab === 'UPI') {
      if (!upiRef.trim()) {
        alert('Please enter UPI reference/UTR number.');
        return;
      }
      ref = upiRef.trim();
    } else if (activeTab === 'CASH') {
      if (!isCashValid) {
        alert('Received cash is less than total payable amount.');
        return;
      }
      ref = `CASH-REC-${parsedCashReceived.toFixed(2)}`;
    }

    const handleSendEmail = async (customEmail) => {
      const targetEmail = (typeof customEmail === 'string' ? customEmail : emailInput).trim() || order.customer?.email;
      if (!targetEmail) {
        alert('Please enter a valid email address.');
        return;
      }
      setEmailStatus('sending');
      try {
        const res = await sendEmailReceipt(order.id, targetEmail);
        setEmailStatus('sent');
        setIsSimulated(!!res.simulated);
        if (res.previewUrl) {
          setPreviewUrl(res.previewUrl);
        }
      } catch (err) {
        console.error(err);
        setEmailStatus('failed');
      }
    };

    setSubmitting(true);
    try {
      const payment = await processPayment({
        orderId: order.id,
        method: activeTab,
        amount: grandTotal,
        transactionReference: ref
      });

      setReceiptData({
        ...payment,
        orderNumber: order.orderNumber,
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax),
        discount: parseFloat(order.discount),
        grandTotal: grandTotal,
        orderItems: order.orderItems,
        table: order.table,
        customer: order.customer,
        cashReceived: activeTab === 'CASH' ? parsedCashReceived : null,
        changeReturned: activeTab === 'CASH' ? cashChange : null
      });

      // Auto-trigger email sending if customer has an email
      const customerEmail = order.customer?.email;
      if (customerEmail) {
        setEmailStatus('sending');
        sendEmailReceipt(order.id, customerEmail)
          .then((res) => {
            setEmailStatus('sent');
            setIsSimulated(!!res.simulated);
            if (res.previewUrl) {
              setPreviewUrl(res.previewUrl);
            }
          })
          .catch((err) => {
            console.error('Failed to auto-send email:', err);
            setEmailStatus('failed');
          });
      } else {
        setEmailStatus('idle');
      }

      setShowSuccessModal(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/pos');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm shrink-0">
        <button
          onClick={() => navigate('/pos')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#8A583C] px-3.5 py-2 hover:bg-[#FAF8F6] rounded-xl transition border border-slate-150/60"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Back to POS
        </button>
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm text-right">Ticket #{order.orderNumber}</h3>
          <span className="text-[10px] bg-[#8A583C]/10 text-[#8A583C] px-3 py-0.5 rounded-full font-bold uppercase tracking-wide mt-1 block text-right border border-[#8A583C]/10">
            Table {order.table?.tableNumber || 'Walk-in'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: ORDER INVOICE SUMMARY */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight border-b border-slate-50 pb-3">Billing Summary</h3>

          {/* Order Details */}
          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {order.orderItems?.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-xs font-bold text-slate-650">
                <div className="flex-1 pr-4">
                  <p className="text-slate-850 font-extrabold">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">₹{parseFloat(item.unitPrice).toFixed(2)} x {item.quantity}</p>
                </div>
                <span className="text-slate-800 font-black">₹{parseFloat(item.total).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Subtotals & Grand Total */}
          <div className="space-y-2 text-xs text-slate-500 font-semibold bg-[#FAF8F6] p-4.5 rounded-2xl border border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-800">₹{parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (5%)</span>
              <span className="text-slate-800">₹{parseFloat(order.tax).toFixed(2)}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-250/20 pt-2 mt-1">
                <span>Discounts</span>
                <span>-₹{parseFloat(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-2.5 border-t border-slate-200 mt-2">
              <span>Total Payable</span>
              <span className="text-[#8A583C] text-base font-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PAYMENT GATEWAY */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight border-b border-slate-50 pb-3">Payment Processing Gateway</h3>

          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'CASH', label: 'Cash Payment', icon: DollarSign },
              { id: 'CARD', label: 'Card Swipe', icon: CreditCard },
              { id: 'UPI', label: 'UPI QR Code', icon: Smartphone }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-3.5 rounded-2xl border font-bold text-xs transition duration-200 gap-1.5 ${isActive
                      ? 'bg-[#8A583C]/10 border-[#8A583C] text-[#8A583C]'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Actions */}
          <form onSubmit={handlePaymentSubmit} className="space-y-5">
            {/* CASH PAYMENT UI */}
            {activeTab === 'CASH' && (
              <div className="space-y-4 animate-fade-in bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash Tendered (Received) (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] font-semibold text-slate-805 transition"
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-bold pt-1">
                  <span className="text-slate-400 uppercase text-[9px] tracking-wider font-extrabold">Change to Return:</span>
                  {isCashValid ? (
                    <span className="text-emerald-600 text-lg font-black">₹{cashChange.toFixed(2)}</span>
                  ) : (
                    <span className="text-rose-500 text-xs italic">Insufficient cash received</span>
                  )}
                </div>
              </div>
            )}

            {/* CARD PAYMENT UI */}
            {activeTab === 'CARD' && (
              <div className="space-y-4 animate-fade-in bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Slip / Auth Reference ID</label>
                  <input
                    type="text"
                    required
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                    placeholder="Enter approval reference number..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] font-semibold text-slate-805 transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Swipe or tap the customer's card on the physical card terminal machine. Verify transaction success and enter the printed approval reference key above.
                </p>
              </div>
            )}

            {/* UPI QR PAYMENT UI */}
            {activeTab === 'UPI' && (
              <div className="space-y-4 animate-fade-in bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 flex flex-col items-center">
                {/* Visual Premium QR Code Block */}
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-md flex flex-col items-center max-w-[200px] w-full text-center">
                  <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center relative overflow-hidden mb-2 border border-slate-100">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `upi://pay?pa=nishantshinde151@okicici&pn=Caffine%20Cafe&am=${grandTotal.toFixed(2)}&cu=INR&tn=${order.orderNumber}`
                      )}`}
                      alt="UPI QR Code"
                      className="w-28 h-28 object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-bold">UPI AMOUNT</span>
                  <span className="text-[#8A583C] text-sm font-black mt-0.5">₹{grandTotal.toFixed(2)}</span>
                </div>


                <div className="w-full space-y-1.5 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI / UTR Transaction ID (12 Digits)</label>
                  <input
                    type="text"
                    required
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="Enter UTR transaction ID..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] font-semibold text-slate-850 transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal text-left w-full">
                  Present the dynamic QR code to the customer. When paid, verify the payment in your store console and enter the 12-digit UTR transaction reference number from their payment slip.
                </p>
              </div>
            )}

            {/* Confirm Checkout Button */}
            <button
              type="submit"
              disabled={submitting || (activeTab === 'CASH' && !isCashValid)}
              className="w-full py-3.5 bg-[#8A583C] hover:bg-[#73442A] disabled:opacity-55 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-900/10"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5" /> Confirm Payment & Close Invoice
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* SUCCESS OVERLAY MODAL / RECEIPT PRINT VIEW */}
      {showSuccessModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#FAF8F6] p-6 text-center border-b border-slate-100 flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Checkout Completed</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Payment Captured successfully</p>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto border-b border-slate-100 font-mono text-[11px] text-slate-650 bg-slate-50/30">
              <div className="text-center font-sans space-y-1 mb-4 border-b border-dashed border-slate-200 pb-3">
                <h4 className="font-extrabold text-slate-800 text-sm leading-tight">CAFFINE CAFE</h4>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Downtown Branch</p>
                <p className="text-[9px] text-slate-400 mt-1">Invoice #{receiptData.orderNumber}</p>
                <p className="text-[9px] text-slate-400">Date: {new Date(receiptData.paymentDate).toLocaleString()}</p>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pb-2.5 border-b border-dashed border-slate-200">
                {receiptData.orderItems?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product?.name} (x{item.quantity})</span>
                    <span>₹{parseFloat(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Math */}
              <div className="space-y-1.5 pb-2.5 border-b border-dashed border-slate-200 font-sans">
                <div className="flex justify-between text-[10px]">
                  <span>Subtotal</span>
                  <span>₹{receiptData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>GST Tax (5%)</span>
                  <span>₹{receiptData.tax.toFixed(2)}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-[10px] text-emerald-600 font-bold">
                    <span>Discounts Deducted</span>
                    <span>-₹{receiptData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-800 font-bold text-xs pt-1">
                  <span>Grand Total Paid</span>
                  <span>₹{receiptData.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-1 font-sans text-[10px]">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-bold text-slate-800">{receiptData.method}</span>
                </div>
                {receiptData.transactionReference && (
                  <div className="flex justify-between">
                    <span>Reference Key</span>
                    <span className="font-bold text-slate-800 truncate max-w-[180px]">{receiptData.transactionReference}</span>
                  </div>
                )}
                {receiptData.cashReceived !== null && (
                  <>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span>Cash Tendered</span>
                      <span>₹{receiptData.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-650 font-bold">
                      <span>Change returned</span>
                      <span>₹{receiptData.changeReturned.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Email receipt status and options */}
            <div className="px-6 pb-2 pt-4 bg-[#FAF8F6] border-t border-slate-100">
              {emailStatus === 'sending' && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-amber-600 bg-amber-50 rounded-xl border border-amber-100">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending email receipt...</span>
                </div>
              )}

              {emailStatus === 'sent' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                    <Check className="w-4 h-4" />
                    <span>{isSimulated ? 'Email receipt simulated in terminal logs!' : 'Email receipt sent successfully!'}</span>
                  </div>
                  {isSimulated && (
                    <p className="text-[10px] text-slate-500 text-center leading-tight">
                      (Ethereal SMTP test service is offline. The full HTML email receipt text has been printed to the server terminal logs.)
                    </p>
                  )}
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition border border-amber-200"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> View Sent Email (Ethereal Preview)
                    </a>
                  )}
                </div>
              )}

              {(emailStatus === 'idle' || emailStatus === 'failed') && (
                <div className="space-y-2">
                  {emailStatus === 'failed' && (
                    <p className="text-rose-600 text-[10px] font-bold text-center">Failed to send email. Try entering email manually below.</p>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendEmail(emailInput);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter customer email..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#8A583C] bg-white font-medium text-slate-800"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" /> Send Email
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Close actions */}
            <div className="p-6 pt-3 bg-[#FAF8F6] flex gap-3">
              <button
                onClick={handleCloseSuccess}
                className="w-full py-3 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/10"
              >
                <Check className="w-3.5 h-3.5" /> Finish & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
