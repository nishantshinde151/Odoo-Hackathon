import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Coffee, Activity, Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/pos');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: 'url("/bg.png")' }}
    >
      <div className="max-w-[420px] w-full bg-[#120a06]/95 border border-[#2a1a12] p-10 rounded-3xl shadow-2xl space-y-8 relative">
        {/* Status Dot */}
        <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-emerald-500"></div>

        <div className="text-center flex flex-col items-center">
          <div className="bg-[#e87c0a] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
             <Coffee className="text-white w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Caffine Cafe</h2>
          <p className="text-[#6b5a51] text-xs uppercase tracking-[0.2em] mt-2 font-medium">Point of Sale System</p>
        </div>
        
        <div className="space-y-1 mt-6">
            <h3 className="text-xl font-semibold text-white">Sign in to your shift</h3>
            <p className="text-[#8c7b72] text-sm">Select your role and enter your credentials to access the POS terminal.</p>
        </div>

        {successMessage && !error && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-3">
             <label className="block text-[10px] font-semibold text-[#6b5a51] uppercase tracking-wider">Staff Role</label>
             <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole('Staff')}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition ${role === 'Staff' ? 'bg-[#2a1a12] border-[#e87c0a] text-[#e87c0a]' : 'bg-[#1a110d] border-transparent text-[#6b5a51] hover:bg-[#2a1a12]'}`}
                >
                    <Coffee className="w-5 h-5 mb-2" />
                    <span className="text-xs font-semibold">Staff</span>
                </button>
                <button 
                  type="button"
                   onClick={() => setRole('Admin')}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition ${role === 'Admin' ? 'bg-[#2a1a12] border-[#e87c0a] text-[#e87c0a]' : 'bg-[#1a110d] border-transparent text-[#6b5a51] hover:bg-[#2a1a12]'}`}
                >
                    <Activity className="w-5 h-5 mb-2" />
                    <span className="text-xs font-semibold">Admin</span>
                </button>
                <button 
                  type="button"
                   onClick={() => setRole('Kitchen')}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition ${role === 'Kitchen' ? 'bg-[#2a1a12] border-[#e87c0a] text-[#e87c0a]' : 'bg-[#1a110d] border-transparent text-[#6b5a51] hover:bg-[#2a1a12]'}`}
                >
                    <Shield className="w-5 h-5 mb-2" />
                    <span className="text-xs font-semibold">kitchen staff</span>
                </button>
             </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-[#6b5a51] uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a51]" />
                <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@cafe.com"
                className="w-full pl-11 pr-4 py-3.5 bg-[#1a110d] border border-[#2a1a12] rounded-xl text-white placeholder-[#6b5a51] focus:outline-none focus:border-[#e87c0a] transition text-sm"
                />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6b5a51] uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a51]" />
                <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-11 py-3.5 bg-[#1a110d] border border-[#2a1a12] rounded-xl text-white placeholder-[#453a34] focus:outline-none focus:border-[#e87c0a] transition text-sm"
                />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b5a51] hover:text-[#e87c0a]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
              <label className="flex items-center text-[#6b5a51] text-xs cursor-pointer">
                  <input type="checkbox" className="mr-2 w-3.5 h-3.5 accent-[#e87c0a] bg-[#1a110d] border-[#2a1a12] rounded" />
                  Remember me
              </label>
              <a href="#" className="text-[#e87c0a] text-xs hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#e87c0a] hover:bg-[#d56b06] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Signing In...' : <>Sign In to Cafe <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-xs text-[#6b5a51] mt-6">
              Don't have an account? <Link to="/signup" className="text-[#e87c0a] hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>

       {/* Watermark N logo at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-lg border border-[#6b5a51]/30">
          <span className="text-[#6b5a51] text-xs font-semibold">N</span>
      </div>
    </div>
  );
}
