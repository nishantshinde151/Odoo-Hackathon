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
      className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: 'url("/bg.png")' }}
    >
      <div className="max-w-[460px] w-full bg-[#120a06]/95 border border-[#2a1a12] px-8 py-6 rounded-2xl shadow-2xl space-y-4 relative">
        {/* Status Dot */}
        <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-emerald-500"></div>

        <div className="text-center flex flex-col items-center">
          <div className="bg-[#e87c0a] w-10 h-10 rounded-lg flex items-center justify-center mb-2">
             <Coffee className="text-white w-5 h-5" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Caffine Cafe</h2>
          <p className="text-[#6b5a51] text-[10px] uppercase tracking-[0.2em] mt-1 font-medium">Point of Sale System</p>
        </div>
        
        <div className="space-y-0.5 mt-2">
            <h3 className="text-lg font-semibold text-white">Sign in to your shift</h3>
            <p className="text-[#8c7b72] text-xs">Select your role and enter credentials to access terminal.</p>
        </div>

        {successMessage && !error && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-2 px-3.5 rounded-lg text-xs font-semibold">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 py-2 px-3.5 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
             <label className="block text-[10px] font-semibold text-[#6b5a51] uppercase tracking-wider">Staff Role</label>
             <div className="grid grid-cols-3 gap-2.5">
                <button 
                  type="button"
                  onClick={() => setRole('Staff')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition ${role === 'Staff' ? 'bg-[#2a1a12] border-[#e87c0a] text-[#e87c0a]' : 'bg-[#1a110d] border-transparent text-[#6b5a51] hover:bg-[#2a1a12]'}`}
                >
                    <Coffee className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-semibold">Staff</span>
                </button>
                <button 
                  type="button"
                   onClick={() => setRole('Admin')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition ${role === 'Admin' ? 'bg-[#2a1a12] border-[#e87c0a] text-[#e87c0a]' : 'bg-[#1a110d] border-transparent text-[#6b5a51] hover:bg-[#2a1a12]'}`}
                >
                    <Activity className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-semibold">Admin</span>
                </button>
                <button 
                  type="button"
                   onClick={() => setRole('Kitchen')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition ${role === 'Kitchen' ? 'bg-[#2a1a12] border-[#e87c0a] text-[#e87c0a]' : 'bg-[#1a110d] border-transparent text-[#6b5a51] hover:bg-[#2a1a12]'}`}
                >
                    <Shield className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-semibold">Kitchen</span>
                </button>
             </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#6b5a51] uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a51]" />
                <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@cafe.com"
                className="w-full pl-11 pr-4 py-2.5 bg-[#1a110d] border border-[#2a1a12] rounded-xl text-white placeholder-[#6b5a51] focus:outline-none focus:border-[#e87c0a] transition text-sm"
                />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6b5a51] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a51]" />
                <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-11 py-2.5 bg-[#1a110d] border border-[#2a1a12] rounded-xl text-white placeholder-[#453a34] focus:outline-none focus:border-[#e87c0a] transition text-sm"
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
            className="w-full py-3 bg-[#e87c0a] hover:bg-[#d56b06] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Signing In...' : <>Sign In to Cafe <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-xs text-[#6b5a51] mt-4">
              Don't have an account? <Link to="/signup" className="text-[#e87c0a] hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>

       {/* Watermark N logo at bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-7 h-7 rounded-lg border border-[#6b5a51]/30">
          <span className="text-[#6b5a51] text-[10px] font-semibold">N</span>
      </div>
    </div>
  );
}
