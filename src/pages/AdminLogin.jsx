import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useGym } from '../context/GymContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { adminLogin, isAdminLoggedIn } = useGym();
  const navigate = useNavigate();

  if (isAdminLoggedIn) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // brief delay for feel
    const ok = adminLogin(password);
    if (ok) {
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Dumbbell size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">
              POWER<span className="text-orange-500"> FITNESS</span>
            </h1>
            <p className="text-slate-400 text-xs">Admin Portal</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-slate-400 text-sm mb-8">Enter your admin password to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500 text-white rounded-xl pl-10 pr-12 py-3.5 outline-none transition-colors placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-slate-600 text-xs text-center mt-6">
          Default password: <span className="font-mono text-slate-500">admin123</span>
        </p>
      </div>
    </div>
  );
}
