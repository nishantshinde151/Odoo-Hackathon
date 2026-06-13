import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Page Imports
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Categories from './pages/Categories/Categories.jsx';
import Products from './pages/Products/Products.jsx';
import Floors from './pages/Floors/Floors.jsx';
import Tables from './pages/Tables/Tables.jsx';
import Customers from './pages/Customers/Customers.jsx';
import Orders from './pages/Orders/Orders.jsx';
import POS from './pages/POS/POS.jsx';
import Kitchen from './pages/Kitchen/Kitchen.jsx';
import Payments from './pages/Payments/Payments.jsx';
import Reports from './pages/Reports/Reports.jsx';

const queryClient = new QueryClient();

// A simple main layout wrapping our pages
function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shadow-xl">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <span className="font-extrabold text-xl tracking-wider text-amber-500">Cafe POS</span>
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">POS-v1</span>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/dashboard" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Dashboard</Link>
            <Link to="/pos" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition font-semibold text-amber-400">POS Terminal</Link>
            <Link to="/kitchen" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Kitchen (KDS)</Link>
            <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase px-4">Menu & Setup</div>
            <Link to="/categories" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Categories</Link>
            <Link to="/products" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Products</Link>
            <Link to="/floors" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Floors</Link>
            <Link to="/tables" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Tables</Link>
            <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase px-4">Transactions</div>
            <Link to="/orders" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Orders</Link>
            <Link to="/payments" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Payments</Link>
            <Link to="/customers" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Customers</Link>
            <Link to="/reports" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Reports</Link>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <Link to="/login" className="block text-center w-full px-4 py-2 bg-slate-800 text-slate-300 hover:bg-rose-950 hover:text-rose-200 rounded-lg transition text-sm">Logout</Link>
        </div>
      </aside>

      {/* Main page content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">Cafe Terminal Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-500 font-medium">Session #42 (Active)</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/categories" element={<MainLayout><Categories /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/floors" element={<MainLayout><Floors /></MainLayout>} />
          <Route path="/tables" element={<MainLayout><Tables /></MainLayout>} />
          <Route path="/customers" element={<MainLayout><Customers /></MainLayout>} />
          <Route path="/orders" element={<MainLayout><Orders /></MainLayout>} />
          <Route path="/pos" element={<MainLayout><POS /></MainLayout>} />
          <Route path="/kitchen" element={<MainLayout><Kitchen /></MainLayout>} />
          <Route path="/payments" element={<MainLayout><Payments /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
