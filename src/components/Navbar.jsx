import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Users, LayoutDashboard, UserPlus, ArrowLeft, ClipboardList, CreditCard, Settings, CalendarCheck, Dumbbell } from 'lucide-react';
import { useGym } from '../context/GymContext';
import toast from 'react-hot-toast';
import GymLogo from './GymLogo';

export default function Navbar({ title, showBack }) {
  const { isAdminLoggedIn, adminLogout, getExpiringMembers, pendingRenewals } = useGym();
  const navigate = useNavigate();
  const location = useLocation();
  const expiring = getExpiringMembers();

  const handleLogout = async () => {
    await adminLogout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <>
      {/* Top Navbar */}
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
                <GymLogo size={40} />
                <span className="font-bold text-white hidden sm:block">Power Fitness</span>
              </Link>
            )}
            {title && (
              <span className="text-white font-semibold truncate">{title}</span>
            )}
          </div>

          {/* Right - Admin nav (desktop) */}
          {isAdminLoggedIn && (
            <div className="flex items-center gap-1">
              {/* Desktop: show all links */}
              <div className="hidden sm:flex items-center gap-1">
                <NavLink to="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" active={location.pathname === '/admin'} />
                <NavLink to="/admin/members" icon={<Users size={16} />} label="Members" active={location.pathname.startsWith('/admin/members')} badge={expiring.length} />
                <NavLink to="/admin/register" icon={<UserPlus size={16} />} label="Add" active={location.pathname === '/admin/register'} />
                <NavLink to="/admin/attendance" icon={<CalendarCheck size={16} />} label="Attendance" active={location.pathname === '/admin/attendance'} />
                <NavLink to="/admin/logs" icon={<ClipboardList size={16} />} label="Logs" active={location.pathname === '/admin/logs'} />
                <NavLink to="/admin/renewals" icon={<CreditCard size={16} />} label="Payments" active={location.pathname === '/admin/renewals'} badge={pendingRenewals?.length} />
                <NavLink to="/admin/instructors" icon={<Dumbbell size={16} />} label="Coaches" active={location.pathname === '/admin/instructors'} />
                <NavLink to="/admin/settings" icon={<Settings size={16} />} label="Settings" active={location.pathname === '/admin/settings'} />
              </div>
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

      {/* Mobile Bottom Nav */}
      {isAdminLoggedIn && (
        <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-slate-900/98 backdrop-blur-lg border-t border-slate-800">
          <div className="flex items-center justify-around h-16 px-1">
            <MobileNavLink
              to="/admin"
              icon={<LayoutDashboard size={21} />}
              label="Dashboard"
              active={location.pathname === '/admin'}
            />
            <MobileNavLink
              to="/admin/members"
              icon={<Users size={21} />}
              label="Members"
              active={location.pathname.startsWith('/admin/members')}
              badge={expiring.length}
            />
            {/* Center FAB — Add Member */}
            <Link
              to="/admin/register"
              className={`flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-2xl shadow-lg transition-all ${
                location.pathname === '/admin/register'
                  ? 'bg-orange-600 shadow-orange-500/40'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
              }`}
            >
              <UserPlus size={22} className="text-white" />
            </Link>
            <MobileNavLink
              to="/admin/renewals"
              icon={<CreditCard size={21} />}
              label="Payments"
              active={location.pathname === '/admin/renewals'}
              badge={pendingRenewals?.length}
            />
            <MobileNavLink
              to="/admin/instructors"
              icon={<Dumbbell size={21} />}
              label="Coaches"
              active={location.pathname === '/admin/instructors'}
            />
            <MobileNavLink
              to="/admin/settings"
              icon={<Settings size={21} />}
              label="More"
              active={['/admin/settings', '/admin/logs', '/admin/attendance'].includes(location.pathname)}
            />
          </div>
          {/* iOS safe area spacer */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      )}
    </>
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
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({ to, icon, label, active, badge }) {
  return (
    <Link
      to={to}
      className={`relative flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl transition-colors ${
        active ? 'text-orange-400' : 'text-slate-500'
      }`}
    >
      <div className={`p-1 rounded-lg transition-all ${active ? 'bg-orange-500/15' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-medium leading-none ${active ? 'text-orange-400' : 'text-slate-500'}`}>
        {label}
      </span>
      {badge > 0 && (
        <span className="absolute top-0.5 right-3 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}
