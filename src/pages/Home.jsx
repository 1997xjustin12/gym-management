import { useNavigate } from 'react-router-dom';
import { Dumbbell, ShieldCheck, User } from 'lucide-react';
import { useGym } from '../context/GymContext';

export default function Home() {
  const navigate = useNavigate();
  const { isAdminLoggedIn } = useGym();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Logo */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Dumbbell size={40} className="text-white" />
          </div>
          <div className="absolute -inset-1 bg-orange-500/20 rounded-3xl blur-xl -z-10" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">
          POWER<span className="text-orange-500"> FITNESS</span>
        </h1>
        <p className="text-slate-400 text-lg mb-2">Gym Management System</p>
        <div className="w-12 h-1 bg-orange-500 rounded-full mx-auto mb-10" />

        {/* Portal Cards */}
        <div className="w-full max-w-sm space-y-4">
          {/* Admin Portal */}
          <button
            onClick={() => navigate(isAdminLoggedIn ? '/admin' : '/admin/login')}
            className="w-full group relative overflow-hidden bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/50 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                <ShieldCheck size={24} className="text-orange-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Admin Portal</h2>
                <p className="text-slate-400 text-sm">Manage members & memberships</p>
              </div>
              <div className="ml-auto text-slate-600 group-hover:text-orange-500 transition-colors text-xl">›</div>
            </div>
          </button>

          {/* Member Portal */}
          <button
            onClick={() => navigate('/member')}
            className="w-full group relative overflow-hidden bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-sky-500/50 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center group-hover:bg-sky-500/30 transition-colors">
                <User size={24} className="text-sky-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Member Portal</h2>
                <p className="text-slate-400 text-sm">Check your membership status</p>
              </div>
              <div className="ml-auto text-slate-600 group-hover:text-sky-500 transition-colors text-xl">›</div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-slate-600 text-xs pb-6">
        © {new Date().getFullYear()} Power Fitness Gym · All rights reserved
      </p>
    </div>
  );
}
