import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Reports() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get('/api/reports/sales', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiveData(response.data);
      } catch (err) {
        console.error('Failed to fetch sales reports data.', err);
        setError('Failed to fetch live database records. Please ensure server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  // Format currency helper
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  const handlePrint = (title, headers, rows) => {
    setPrintData({ title, headers, rows });
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleDownloadCSV = (title, headers, rows) => {
    // Generate CSV content
    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-10 h-10 border-4 text-[#8A583C] animate-spin" />
        <span className="text-slate-400 font-semibold text-sm">Generating reports audit...</span>
      </div>
    );
  }

  // Mappings
  const salesTrends = liveData?.salesTrends || [
    { day: 'Mon', value: '₹0.00' },
    { day: 'Tue', value: '₹0.00' },
    { day: 'Wed', value: '₹0.00' },
    { day: 'Thu', value: '₹0.00' },
    { day: 'Fri', value: '₹0.00' },
    { day: 'Sat', value: '₹0.00' },
    { day: 'Sun', value: '₹0.00' }
  ];

  const topProducts = liveData?.topProducts || [];
  const employees = liveData?.employees || [];

  const reportsList = [
    { 
      title: 'Daily Sales Trend', 
      type: 'Sales', 
      format: 'PDF / Excel',
      icon: <TrendingUp className="text-[#8A583C] w-7 h-7" />,
      headers: ['Day of Week', 'Daily Sales Revenue'],
      rows: salesTrends.map(t => [t.day, t.value]),
      hasExcel: true
    },
    { 
      title: 'Top-Selling Products', 
      type: 'Inventory', 
      format: 'PDF / Excel',
      icon: <BarChart3 className="text-[#8A583C] w-7 h-7" />,
      headers: ['Product Name', 'Units Sold', 'Popularity percentage'],
      rows: topProducts.length > 0 
        ? topProducts.map(p => [p.name, `${p.count} units`, p.percent])
        : [['No products sold yet', '0 units', '0%']],
      hasExcel: true
    },
    { 
      title: 'Employee Performance Logs', 
      type: 'Audit', 
      format: 'PDF / Excel',
      icon: <Users className="text-[#8A583C] w-7 h-7" />,
      headers: ['Performance Rank', 'Staff Member Name', 'Orders Fulfilled', 'Sales Ledger Total'],
      rows: employees.length > 0
        ? employees.map(e => [e.rank.toString(), e.name, `${e.orders} orders`, formatINR(e.sales)])
        : [['1', 'No records found', '0 orders', '₹0.00']],
      hasExcel: true
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Printing Media Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body > * {
            visibility: hidden !important;
          }
          #print-section, #print-section * {
            visibility: visible !important;
          }
          #print-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Calendar className="text-[#8A583C] w-7 h-7" />
            Business Reports Centre
          </h2>
          <p className="text-slate-500 text-sm mt-1">Generate and download financial ledgers, product catalog logs, and cashier performance data.</p>
        </div>
      </div>

      {error && (
        <div className="p-4.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List of Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((rep, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-48 hover:shadow-md transition duration-300">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-extrabold text-[#8A583C] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#FAF6F0]">{rep.type}</span>
                <div className="p-2 bg-[#FAF8F6] rounded-xl">
                  {rep.icon}
                </div>
              </div>
              <h3 className="font-extrabold text-base text-slate-800 mt-3">{rep.title}</h3>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-50 pt-3.5 mt-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rep.format}</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handlePrint(rep.title, rep.headers, rep.rows)}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-[#8A583C] hover:text-white rounded-xl text-xs font-bold text-[#8A583C] transition flex items-center gap-1 border border-amber-50"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF
                </button>
                {rep.hasExcel && (
                  <button 
                    onClick={() => handleDownloadCSV(rep.title, rep.headers, rep.rows)}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-650 transition flex items-center gap-1 border border-slate-100"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden Print Section container rendered when printing */}
      {printData && (
        <div id="print-section" className="hidden p-10 font-sans text-slate-800">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{printData.title}</h1>
              <p className="text-xs text-slate-400 mt-1">Smart Cafe POS Audit Ledger</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Generated On</span>
              <span className="text-xs font-semibold text-slate-700">{new Date().toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Dynamic SVG Visual Charts */}
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center">
            <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-4">Report Visualization Chart</h3>
            {(() => {
              const parseValue = (valStr) => {
                const cleaned = valStr.toString().replace(/[₹,]/g, '').trim();
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
              };
              const parseUnits = (valStr) => {
                const cleaned = valStr.toString().replace(/[^0-9.]/g, '').trim();
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
              };

              if (printData.title === 'Daily Sales Trend') {
                const maxVal = Math.max(...printData.rows.map(row => parseValue(row[1])), 1);
                return (
                  <svg width="460" height="180" className="mx-auto">
                    <line x1="30" y1="20" x2="430" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="30" y1="75" x2="430" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="30" y1="130" x2="430" y2="130" stroke="#CBD5E1" strokeWidth="1.5" />
                    
                    {printData.rows.map((row, i) => {
                      const val = parseValue(row[1]);
                      const barHeight = (val / maxVal) * 100;
                      const x = 45 + i * 55;
                      const y = 130 - barHeight;
                      return (
                        <g key={i}>
                          <rect x={x} y={y} width={25} height={barHeight} fill="#8A583C" rx="3" />
                          <text x={x + 12.5} y={y - 6} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155">{row[1]}</text>
                          <text x={x + 12.5} y="145" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#64748B">{row[0]}</text>
                        </g>
                      );
                    })}
                  </svg>
                );
              }

              if (printData.title === 'Top-Selling Products') {
                const validRows = printData.rows.filter(row => row[0] !== 'No products sold yet');
                if (validRows.length === 0) return <p className="text-xs text-slate-400 italic">No visual data available</p>;
                const maxUnits = Math.max(...validRows.map(row => parseUnits(row[1])), 1);
                return (
                  <svg width="460" height={40 + validRows.length * 30} className="mx-auto">
                    {validRows.map((row, i) => {
                      const units = parseUnits(row[1]);
                      const barWidth = (units / maxUnits) * 260;
                      const y = 15 + i * 30;
                      return (
                        <g key={i}>
                          <text x="15" y={y + 9} fontSize="9" fontWeight="bold" fill="#334155" textAnchor="start">{row[0]}</text>
                          <rect x="140" y={y} width="260" height="10" fill="#F1F5F9" rx="3.5" />
                          <rect x="140" y={y} width={barWidth} height="10" fill="#8A583C" rx="3.5" />
                          <text x={145 + barWidth} y={y + 8} fontSize="8" fontWeight="bold" fill="#334155">{row[1]} ({row[2]})</text>
                        </g>
                      );
                    })}
                  </svg>
                );
              }

              if (printData.title === 'Employee Performance Logs') {
                const validRows = printData.rows.filter(row => row[1] !== 'No records found');
                if (validRows.length === 0) return <p className="text-xs text-slate-400 italic">No visual data available</p>;
                const maxSales = Math.max(...validRows.map(row => parseValue(row[3])), 1);
                return (
                  <svg width="460" height={40 + validRows.length * 30} className="mx-auto">
                    {validRows.map((row, i) => {
                      const sales = parseValue(row[3]);
                      const barWidth = (sales / maxSales) * 260;
                      const y = 15 + i * 30;
                      return (
                        <g key={i}>
                          <text x="15" y={y + 9} fontSize="9" fontWeight="bold" fill="#334155" textAnchor="start">{row[1]}</text>
                          <rect x="140" y={y} width="260" height="10" fill="#F1F5F9" rx="3.5" />
                          <rect x="140" y={y} width={barWidth} height="10" fill="#8A583C" rx="3.5" />
                          <text x={145 + barWidth} y={y + 8} fontSize="8" fontWeight="bold" fill="#334155">{row[3]} ({row[2]})</text>
                        </g>
                      );
                    })}
                  </svg>
                );
              }

              return null;
            })()}
          </div>

          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                {printData.headers.map((h, i) => (
                  <th key={i} className="p-3 border border-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {printData.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 text-xs font-semibold text-slate-700">
                  {row.map((val, j) => (
                    <td key={j} className="p-3 border border-slate-100">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">
            End of Generated Report • Cafe POS System Auditing
          </div>
        </div>
      )}
    </div>
  );
}
