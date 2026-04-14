import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, LogOut, Users, LayoutDashboard, UserPlus, ArrowLeft, ClipboardList } from 'lucide-react';
import { useGym } from '../context/GymContext';
import toast from 'react-hot-toast';

export default function Navbar({ title, showBack }) {
  const { isAdminLoggedIn, adminLogout, getExpiringMembers } = useGym();
  const navigate = useNavigate();
  const location = useLocation();
  const expiring = getExpiringMembers();

  const handleLogout = async () => {
    await adminLogout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-white p-1"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <Link to={isAdminLoggedIn ? '/admin' : '/'} className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Dumbbell size={16} className="text-white" />
              </div>
              <span className="font-bold text-white hidden sm:block">Power Fitness</span>
            </Link>
          )}
          {title && (
            <span className="text-white font-semibold truncate">{title}</span>
          )}
        </div>

        {/* Right - Admin nav */}
        {isAdminLoggedIn && (
          <div className="flex items-center gap-1">
            <NavLink to="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" active={location.pathname === '/admin'} />
            <NavLink to="/admin/members" icon={<Users size={16} />} label="Members" active={location.pathname === '/admin/members'} badge={expiring.length} />
            <NavLink to="/admin/register" icon={<UserPlus size={16} />} label="Add" active={location.pathname === '/admin/register'} />
            <NavLink to="/admin/logs" icon={<ClipboardList size={16} />} label="Logs" active={location.pathname === '/admin/logs'} />
            <button
              onClick={handleLogout}
              className="ml-1 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active, badge }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-orange-500/20 text-orange-400'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
          {badge}
        </span>
      )}
    </Link>
  );
}
