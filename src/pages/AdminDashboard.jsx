import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, AlertTriangle, UserX, UserPlus, MessageSquare, ChevronRight, Send, Download } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { exportMembersToExcel } from '../utils/exportExcel';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import SMSModal from '../components/SMSModal';
import BulkSMSModal from '../components/BulkSMSModal';
import { formatDate, formatPhoneDisplay } from '../utils/helpers';

export default function AdminDashboard() {
  const { members, getMemberStatus, getExpiringMembers } = useGym();
  const navigate = useNavigate();
  const [smsTarget, setSmsTarget] = useState(null);
  const [showBulkSMS, setShowBulkSMS] = useState(false);

  const expiring = getExpiringMembers();
  const active = members.filter((m) => getMemberStatus(m).status === 'active');
  const expired = members.filter((m) => getMemberStatus(m).status === 'expired');

  const stats = [
    { label: 'Total Members', value: members.length, icon: <Users size={20} />, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Active', value: active.length, icon: <UserCheck size={20} />, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Expiring Soon', value: expiring.length, icon: <AlertTriangle size={20} />, color: 'text-orange-400', bg: 'bg-orange-500/10', alert: expiring.length > 0 },
    { label: 'Expired', value: expired.length, icon: <UserX size={20} />, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Overview of your gym memberships</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`bg-slate-800 rounded-2xl p-4 border ${
                s.alert ? 'border-orange-500/50 shadow-lg shadow-orange-500/10' : 'border-slate-700/50'
              }`}
            >
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className={`text-2xl font-black ${s.alert ? 'text-orange-400' : 'text-white'}`}>{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Expiring Soon Alert */}
        {expiring.length > 0 && (
          <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-2xl overflow-hidden">
            {/* Alert header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-orange-500/20 border-b border-orange-500/30">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-orange-300 font-bold">
                  {expiring.length} Membership{expiring.length > 1 ? 's' : ''} Expiring Soon!
                </p>
                <p className="text-orange-400/70 text-xs">These members need renewal within 5 days</p>
              </div>
              <button
                onClick={() => setShowBulkSMS(true)}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <Send size={12} /> Send to All
              </button>
            </div>

            {/* Expiring members list */}
            <div className="divide-y divide-orange-500/10">
              {expiring.map((member) => {
                const { daysLeft, label } = getMemberStatus(member);
                return (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-3.5">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-400 font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                      <p className="text-slate-400 text-xs">{formatPhoneDisplay(member.contactNumber)}</p>
                    </div>

                    {/* Days left */}
                    <div className="text-right shrink-0">
                      <StatusBadge status="expiring" label={label} />
                      <p className="text-slate-500 text-xs mt-1">Ends {formatDate(member.membershipEndDate)}</p>
                    </div>

                    {/* SMS */}
                    <button
                      onClick={() => setSmsTarget({ member, daysLeft })}
                      className="ml-1 w-9 h-9 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 rounded-xl flex items-center justify-center transition-colors shrink-0"
                      title="Send SMS"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/admin/register')}
              className="flex items-center gap-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/50 rounded-2xl p-4 text-left transition-all"
            >
              <div className="w-11 h-11 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <UserPlus size={22} className="text-orange-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Register Member</p>
                <p className="text-slate-400 text-xs">Add a new gym member</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-600" />
            </button>

            <button
              onClick={() => { exportMembersToExcel(members); toast.success('Excel file downloaded!'); }}
              className="flex items-center gap-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-green-500/50 rounded-2xl p-4 text-left transition-all"
            >
              <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Download size={22} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Export Members</p>
                <p className="text-slate-400 text-xs">Download Excel report</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-600" />
            </button>

            <button
              onClick={() => navigate('/admin/members')}
              className="flex items-center gap-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-sky-500/50 rounded-2xl p-4 text-left transition-all"
            >
              <div className="w-11 h-11 bg-sky-500/20 rounded-xl flex items-center justify-center">
                <Users size={22} className="text-sky-400" />
              </div>
              <div>
                <p className="text-white font-semibold">View All Members</p>
                <p className="text-slate-400 text-xs">{members.length} total members</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-600" />
            </button>
          </div>
        </div>

        {/* Recent Members */}
        {members.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Recent Members</h2>
              <button onClick={() => navigate('/admin/members')} className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                See all
              </button>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50 overflow-hidden">
              {members.slice(0, 5).map((member) => {
                const statusInfo = getMemberStatus(member);
                return (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/admin/members/${member.id}/edit`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-700/40 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-400 font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{member.name}</p>
                      <p className="text-slate-400 text-xs">{formatPhoneDisplay(member.contactNumber)}</p>
                    </div>
                    <StatusBadge status={statusInfo.status} label={statusInfo.label} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Individual SMS Modal */}
      {smsTarget && (
        <SMSModal
          member={smsTarget.member}
          daysLeft={smsTarget.daysLeft}
          onClose={() => setSmsTarget(null)}
        />
      )}

      {/* Bulk SMS Modal */}
      {showBulkSMS && (
        <BulkSMSModal onClose={() => setShowBulkSMS(false)} />
      )}
    </div>
  );
}
