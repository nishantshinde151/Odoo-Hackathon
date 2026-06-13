import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

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

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-white text-sm">Loading session...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Admin Only Route Guard
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-white text-sm">Loading session...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'ADMIN') {
    return <Navigate to="/pos" replace />;
  }
  
  return children;
}

// Main Layout with Role-based Sidebar
function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

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
            {isAdmin && (
              <Link to="/dashboard" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Dashboard</Link>
            )}
            <Link to="/pos" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition font-semibold text-amber-400">POS Terminal</Link>
            <Link to="/kitchen" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Kitchen (KDS)</Link>
            
            {isAdmin && (
              <>
                <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase px-4">Menu & Setup</div>
                <Link to="/categories" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Categories</Link>
                <Link to="/products" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Products</Link>
                <Link to="/floors" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Floors</Link>
                <Link to="/tables" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Tables</Link>
              </>
            )}

            <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase px-4">Transactions</div>
            <Link to="/orders" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Orders</Link>
            <Link to="/payments" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Payments</Link>
            <Link to="/customers" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Customers</Link>
            
            {isAdmin && (
              <Link to="/reports" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">Reports</Link>
            )}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="block text-center w-full px-4 py-2 bg-slate-850 hover:bg-rose-950 text-slate-300 hover:text-rose-200 rounded-lg transition text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main page content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">Cafe Terminal Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600 font-semibold">{user?.email || 'Offline'} ({user?.role || 'Guest'})</span>
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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={<AdminRoute><MainLayout><Dashboard /></MainLayout></AdminRoute>} />
            <Route path="/categories" element={<AdminRoute><MainLayout><Categories /></MainLayout></AdminRoute>} />
            <Route path="/products" element={<AdminRoute><MainLayout><Products /></MainLayout></AdminRoute>} />
            <Route path="/floors" element={<AdminRoute><MainLayout><Floors /></MainLayout></AdminRoute>} />
            <Route path="/tables" element={<AdminRoute><MainLayout><Tables /></MainLayout></AdminRoute>} />
            <Route path="/reports" element={<AdminRoute><MainLayout><Reports /></MainLayout></AdminRoute>} />

            <Route path="/customers" element={<ProtectedRoute><MainLayout><Customers /></MainLayout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><MainLayout><Orders /></MainLayout></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><MainLayout><POS /></MainLayout></ProtectedRoute>} />
            <Route path="/kitchen" element={<ProtectedRoute><MainLayout><Kitchen /></MainLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><MainLayout><Payments /></MainLayout></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
