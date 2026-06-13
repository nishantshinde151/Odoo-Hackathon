import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Coffee, Layers, BarChart3, Users, Settings, LogOut, Bell, Search, Database, FolderKanban } from 'lucide-react';

// Page Imports
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Employees from './pages/Employees/Employees.jsx';
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
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard': return 'Admin Dashboard';
      case '/products': return 'Products Catalog';
      case '/categories': return 'Product Categories';
      case '/employees': return 'Staff Management';
      case '/floors': return 'Floor Plan';
      case '/tables': return 'Tables Setup';
      case '/reports': return 'Business Reports';
      case '/pos': return 'Point of Sale';
      case '/kitchen': return 'Kitchen Display';
      case '/orders': return 'Orders Ledger';
      case '/payments': return 'Payments List';
      case '/customers': return 'Customer Registry';
      default: return 'Smart Cafe';
    }
  };

  const headerTabs = isAdmin ? [
    { name: 'Dashboard', to: '/dashboard' },
    { name: 'Orders', to: '/orders' },
    { name: 'Tables', to: '/tables' },
    { name: 'Inventory', to: '/products' }
  ] : [
    { name: 'POS Terminal', to: '/pos' },
    { name: 'Orders', to: '/orders' },
    { name: 'Kitchen', to: '/kitchen' }
  ];

  const adminLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', to: '/categories', icon: FolderKanban },
    { name: 'Products', to: '/products', icon: Coffee },
    { name: 'Floor Plan', to: '/floors', icon: Layers },
    { name: 'Reports', to: '/reports', icon: BarChart3 },
    { name: 'Staff', to: '/employees', icon: Users },
    { name: 'Settings', to: '/tables', icon: Settings }
  ];

  const employeeLinks = [
    { name: 'POS Terminal', to: '/pos', icon: LayoutDashboard },
    { name: 'Kitchen (KDS)', to: '/kitchen', icon: Layers },
    { name: 'Orders', to: '/orders', icon: BarChart3 },
    { name: 'Payments', to: '/payments', icon: Coffee },
    { name: 'Customers', to: '/customers', icon: Users }
  ];

  const sidebarLinks = isAdmin ? adminLinks : employeeLinks;

  return (
    <div className="flex h-screen bg-[#FAF8F6] font-sans overflow-hidden">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-[#231510] text-[#D9C3B0] flex flex-col justify-between shadow-2xl border-r border-[#3E271D] shrink-0 z-10">
        <div>
          {/* Logo Section */}
          <div className="p-5 border-b border-[#3E271D] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8A583C] flex items-center justify-center text-white shadow-md">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide text-white block leading-tight">Smart Cafe Admin</span>
              <span className="text-[#8B7368] text-[11px] font-semibold block uppercase">Downtown Branch</span>
            </div>
          </div>

          <div className="p-4">
            <div className="text-[10px] font-bold tracking-wider text-[#8B7368] uppercase px-4 mb-2">Main Menu</div>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = location.pathname === link.to;
                const IconComponent = link.icon;
                return (
                  <Link 
                    key={link.name}
                    to={link.to} 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                      isActive 
                        ? 'bg-[#3F281F] text-white font-semibold shadow-sm' 
                        : 'text-[#A0887D] hover:bg-[#3F281F]/40 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-[#8B7368]'}`} />
                    <span className="text-sm">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#3E271D]">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-transparent hover:bg-rose-950/20 text-[#A0887D] hover:text-rose-400 rounded-xl transition text-sm font-semibold"
          >
            <LogOut className="w-5 h-5 text-[#8B7368] hover:text-rose-450" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main page content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">{getPageTitle(location.pathname)}</h1>
            
            {/* Header Navigation Tabs */}
            <div className="flex items-center gap-6 ml-10 border-l border-gray-250 pl-10">
              {headerTabs.map((tab) => {
                const isActive = location.pathname === tab.to;
                return (
                  <Link 
                    key={tab.name} 
                    to={tab.to} 
                    className={`text-sm font-semibold pb-1.5 border-b-2 transition ${
                      isActive 
                        ? 'text-[#8A583C] border-[#8A583C]' 
                        : 'text-gray-400 border-transparent hover:text-gray-600'
                    }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-5">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Settings Gear */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition">
              <Settings className="w-5 h-5" />
            </button>

            {/* Avatar & User Name */}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-250">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">
                  {user?.name && user.name !== 'Staff Member' 
                    ? user.name 
                    : (user?.email 
                      ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) 
                      : (user?.role === 'ADMIN' ? 'Administrator' : 'Staff Member'))
                  }
                </p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{user?.role || 'Admin'}</p>
              </div>
              <img 
                className="w-10 h-10 rounded-full object-cover border border-[#8A583C]/20 p-0.5" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=facearea&facepad=2" 
                alt="Profile Avatar" 
              />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="flex-1 overflow-auto p-8 bg-[#FAF8F6]">
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
            <Route path="/employees" element={<AdminRoute><MainLayout><Employees /></MainLayout></AdminRoute>} />
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
