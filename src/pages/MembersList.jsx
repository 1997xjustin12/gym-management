import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, UserPlus, Pencil, MessageSquare, Trash2, X, Download } from 'lucide-react';
import { useGym } from '../context/GymContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import SMSModal from '../components/SMSModal';
import { formatDate, formatPhoneDisplay } from '../utils/helpers';
import { exportMembersToExcel } from '../utils/exportExcel';
import toast from 'react-hot-toast';

const FILTERS = ['all', 'active', 'expiring', 'expired'];
// 'active' filter includes expiring members since they are still active

export default function MembersList() {
  const { members, getMemberStatus, deleteMember } = useGym();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [smsTarget, setSmsTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const { status } = getMemberStatus(m);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && (status === 'active' || status === 'expiring')) ||
        (filter !== 'active' && status === filter);
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.contactNumber.includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [members, filter, query, getMemberStatus]);

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (member) => {
    setDeleting(true);
    try {
      await deleteMember(member.id);
      toast.success(`${member.name} removed`);
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove member. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Members" />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">All Members</h1>
            <p className="text-slate-400 text-sm">{filtered.length} of {members.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                exportMembersToExcel(members);
                toast.success('Excel file downloaded!');
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              title="Export to Excel"
            >
              <Download size={16} />
              <span className="hidden sm:block">Export</span>
            </button>
            <button
              onClick={() => navigate('/admin/register')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <UserPlus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or number..."
            className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500/60 text-white rounded-xl pl-10 pr-10 py-3 outline-none transition-colors placeholder:text-slate-600 text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map((f) => {
            const count = members.filter((m) => {
              const s = getMemberStatus(m).status;
              if (f === 'all') return true;
              if (f === 'active') return s === 'active' || s === 'expiring';
              return s === f;
            }).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  filter === f
                    ? f === 'expiring'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Members List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No members found</p>
            <p className="text-slate-600 text-sm mt-1">Try changing your search or filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((member) => {
              const statusInfo = getMemberStatus(member);
              return (
                <div
                  key={member.id}
                  className={`bg-slate-800 rounded-2xl border transition-all ${
                    statusInfo.status === 'expiring'
                      ? 'border-orange-500/40 shadow-sm shadow-orange-500/10'
                      : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 p-3.5">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${
                          statusInfo.status === 'expiring' ? 'text-orange-400' :
                          statusInfo.status === 'expired' ? 'text-red-400' : 'text-sky-400'
                        }`}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">{member.name}</p>
                        <StatusBadge status={statusInfo.status} label={statusInfo.label} />
                      </div>
                      <p className="text-slate-400 text-xs">{formatPhoneDisplay(member.contactNumber)}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {member.membershipType} · Ends {formatDate(member.membershipEndDate)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {statusInfo.status === 'expiring' && (
                        <button
                          onClick={() => setSmsTarget({ member, daysLeft: statusInfo.daysLeft })}
                          className="w-8 h-8 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 rounded-lg flex items-center justify-center transition-colors"
                          title="Send SMS"
                        >
                          <MessageSquare size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/admin/members/${member.id}/edit`)}
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(member)}
                        className="w-8 h-8 bg-slate-700 hover:bg-red-500/30 text-slate-400 hover:text-red-400 rounded-lg flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expiry warning bar */}
                  {statusInfo.status === 'expiring' && (
                    <div className="px-3.5 pb-3 pt-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-orange-400/70">Expiry progress</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${Math.max(5, ((5 - statusInfo.daysLeft) / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SMS Modal */}
      {smsTarget && (
        <SMSModal
          member={smsTarget.member}
          daysLeft={smsTarget.daysLeft}
          onClose={() => setSmsTarget(null)}
        />
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-700">
            <h3 className="text-white font-bold text-lg mb-2">Remove Member?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to remove <strong className="text-white">{confirmDelete.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {deleting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
