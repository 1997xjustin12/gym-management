import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Dumbbell, ArrowLeft, User, Phone, Calendar, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { formatDate, formatPhoneDisplay } from '../utils/helpers';

export default function MemberPortal() {
  const { findMembers, getMemberStatus, MEMBERSHIP_OPTIONS } = useGym();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = findMembers(query);
    setResults(found);
    setSearched(true);
  };

  const getMembershipLabel = (type) =>
    MEMBERSHIP_OPTIONS.find((o) => o.value === type)?.label || type;

  const StatusDisplay = ({ member }) => {
    const { status, daysLeft } = getMemberStatus(member);
    if (status === 'active') {
      return (
        <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div>
            <p className="text-green-400 font-bold text-lg">Active</p>
            <p className="text-slate-400 text-sm">{daysLeft} days remaining</p>
          </div>
        </div>
      );
    }
    if (status === 'expiring') {
      return (
        <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/40 rounded-2xl p-4 animate-pulse-slow">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-orange-400" />
          </div>
          <div>
            <p className="text-orange-400 font-bold text-lg">Active</p>
            <p className="text-slate-400 text-sm">
              Expires in <strong className="text-orange-300">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> — please renew soon!
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
          <XCircle size={24} className="text-red-400" />
        </div>
        <div>
          <p className="text-red-400 font-bold text-lg">Expired</p>
          <p className="text-slate-400 text-sm">Membership ended {Math.abs(daysLeft)} days ago</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white p-1">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Member Portal</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        {/* Hero */}
        {!searched && (
          <div className="text-center pt-4">
            <div className="w-16 h-16 bg-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-sky-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Membership</h1>
            <p className="text-slate-400 text-sm">
              Enter your name or contact number to view your membership status
            </p>
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or phone number..."
              className="w-full bg-slate-800 border border-slate-700 focus:border-sky-500/60 text-white rounded-2xl pl-12 pr-4 py-4 outline-none transition-colors placeholder:text-slate-600 text-base"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl transition-colors text-base"
          >
            Search Membership
          </button>
        </form>

        {/* Results */}
        {searched && results !== null && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-slate-600" />
                </div>
                <p className="text-white font-semibold text-lg">No member found</p>
                <p className="text-slate-400 text-sm mt-1">
                  Try a different name or phone number
                </p>
              </div>
            ) : (
              results.map((member) => {
                const { status, daysLeft } = getMemberStatus(member);
                return (
                  <div
                    key={member.id}
                    className={`bg-slate-800 rounded-2xl border overflow-hidden ${
                      status === 'expiring'
                        ? 'border-orange-500/40'
                        : status === 'expired'
                        ? 'border-red-500/30'
                        : 'border-slate-700/50'
                    }`}
                  >
                    {/* Member header */}
                    <div className="flex items-center gap-4 p-5 border-b border-slate-700/50">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-700 shrink-0">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sky-400 font-black text-2xl">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-white font-bold text-xl">{member.name}</h2>
                        <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} />
                          {formatPhoneDisplay(member.contactNumber)}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="p-5 space-y-4">
                      <StatusDisplay member={member} />

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <DetailCard
                          icon={<Tag size={14} />}
                          label="Plan"
                          value={getMembershipLabel(member.membershipType)}
                        />
                        <DetailCard
                          icon={<Clock size={14} />}
                          label="Days Left"
                          value={daysLeft >= 0 ? `${daysLeft} days` : 'Expired'}
                          valueClass={
                            status === 'expired' ? 'text-red-400' :
                            status === 'expiring' ? 'text-orange-400' : 'text-green-400'
                          }
                        />
                        <DetailCard
                          icon={<Calendar size={14} />}
                          label="Start Date"
                          value={formatDate(member.membershipStartDate)}
                        />
                        <DetailCard
                          icon={<Calendar size={14} />}
                          label="End Date"
                          value={formatDate(member.membershipEndDate)}
                          valueClass={status !== 'active' ? 'text-red-400' : ''}
                        />
                      </div>

                      {/* Expiry message */}
                      {status === 'expiring' && (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-center">
                          <p className="text-orange-300 text-sm font-medium">
                            Please visit the gym to renew your membership!
                          </p>
                        </div>
                      )}
                      {status === 'expired' && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                          <p className="text-red-300 text-sm font-medium">
                            Your membership has expired. Visit the gym to re-enroll.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value, valueClass = 'text-white' }) {
  return (
    <div className="bg-slate-700/40 rounded-xl p-3">
      <p className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
        {icon} {label}
      </p>
      <p className={`font-semibold text-sm ${valueClass}`}>{value}</p>
    </div>
  );
}

function Tag({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
