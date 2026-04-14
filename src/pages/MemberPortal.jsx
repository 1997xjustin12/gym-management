import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Dumbbell, ArrowLeft, User, Phone, Calendar,
  CheckCircle, AlertTriangle, XCircle, Clock, MapPin,
  CreditCard, Copy, ChevronRight, X, Upload, ImageIcon,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { formatDate, formatPhoneDisplay } from '../utils/helpers';

const PLAN_PRICE_KEY = {
  monthly:       'priceMonthly',
  quarterly:     'priceQuarterly',
  'semi-annual': 'priceSemiAnnual',
  annual:        'priceAnnual',
};

export default function MemberPortal() {
  const { findMembers, getMemberStatus, MEMBERSHIP_OPTIONS, settings, submitRenewalRequest, renewalRequests } = useGym();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null); // member object

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
        <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/40 rounded-2xl p-4">
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

        {/* Search */}
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
                <p className="text-slate-400 text-sm mt-1">Try a different name or phone number</p>
              </div>
            ) : (
              results.map((member) => {
                const { status, daysLeft } = getMemberStatus(member);
                const needsRenewal = status === 'expiring' || status === 'expired';
                const latestRequest = renewalRequests
                  .filter((r) => r.member_id === member.id)
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                return (
                  <div
                    key={member.id}
                    className={`bg-slate-800 rounded-2xl border overflow-hidden ${
                      status === 'expiring' ? 'border-orange-500/40'
                      : status === 'expired' ? 'border-red-500/30'
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

                    {/* Status & details */}
                    <div className="p-5 space-y-4">
                      <StatusDisplay member={member} />

                      <div className="grid grid-cols-2 gap-3">
                        <DetailCard icon={<TagIcon size={14} />} label="Plan" value={getMembershipLabel(member.membershipType)} />
                        <DetailCard
                          icon={<Clock size={14} />}
                          label="Days Left"
                          value={daysLeft >= 0 ? `${daysLeft} days` : 'Expired'}
                          valueClass={status === 'expired' ? 'text-red-400' : status === 'expiring' ? 'text-orange-400' : 'text-green-400'}
                        />
                        <DetailCard icon={<Calendar size={14} />} label="Start Date" value={formatDate(member.membershipStartDate)} />
                        <DetailCard
                          icon={<Calendar size={14} />}
                          label="End Date"
                          value={formatDate(member.membershipEndDate)}
                          valueClass={status !== 'active' ? 'text-red-400' : ''}
                        />
                      </div>

                      {/* Renewal notice */}
                      {needsRenewal && (
                        <div className={`rounded-xl p-3 space-y-2 ${
                          status === 'expiring'
                            ? 'bg-orange-500/10 border border-orange-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          <p className={`text-sm font-medium text-center ${status === 'expiring' ? 'text-orange-300' : 'text-red-300'}`}>
                            {status === 'expiring'
                              ? 'Please renew your membership before it expires!'
                              : 'Your membership has expired. Please re-enroll.'}
                          </p>
                          <div className="flex items-start gap-1.5 justify-center">
                            <MapPin size={12} className={`shrink-0 mt-0.5 ${status === 'expiring' ? 'text-orange-400' : 'text-red-400'}`} />
                            <p className={`text-xs ${status === 'expiring' ? 'text-orange-400/80' : 'text-red-400/80'}`}>
                              2nd Floor Fernandez Bldg, Saavedra St, Toril, Davao City
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Latest renewal request status */}
                      {latestRequest && (
                        <div className={`rounded-xl p-4 space-y-1 border ${
                          latestRequest.status === 'pending'
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : latestRequest.status === 'rejected'
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-green-500/10 border-green-500/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {latestRequest.status === 'pending' && <Clock size={14} className="text-orange-400" />}
                            {latestRequest.status === 'rejected' && <XCircle size={14} className="text-red-400" />}
                            {latestRequest.status === 'approved' && <CheckCircle size={14} className="text-green-400" />}
                            <p className={`text-sm font-semibold ${
                              latestRequest.status === 'pending' ? 'text-orange-300'
                              : latestRequest.status === 'rejected' ? 'text-red-300'
                              : 'text-green-300'
                            }`}>
                              Payment {latestRequest.status === 'pending' ? 'Pending Review'
                                : latestRequest.status === 'rejected' ? 'Rejected'
                                : 'Approved'}
                            </p>
                          </div>
                          {latestRequest.status === 'rejected' && latestRequest.admin_notes && (
                            <p className="text-red-400/80 text-xs pl-5">Reason: {latestRequest.admin_notes}</p>
                          )}
                          {latestRequest.status === 'pending' && (
                            <p className="text-orange-400/70 text-xs pl-5">Your payment is being reviewed by the admin.</p>
                          )}
                        </div>
                      )}

                      {/* Pay via GCash button */}
                      {needsRenewal && settings.gcashNumber && latestRequest?.status !== 'pending' && (
                        <button
                          onClick={() => setRenewTarget(member)}
                          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                          <CreditCard size={18} /> {latestRequest?.status === 'rejected' ? 'Resubmit Payment' : 'Pay via GCash'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* GCash Renewal Modal */}
      {renewTarget && (
        <RenewalModal
          member={renewTarget}
          settings={settings}
          MEMBERSHIP_OPTIONS={MEMBERSHIP_OPTIONS}
          submitRenewalRequest={submitRenewalRequest}
          onClose={() => setRenewTarget(null)}
        />
      )}
    </div>
  );
}

/* ── Renewal Modal ──────────────────────────────────────────── */
function RenewalModal({ member, settings, MEMBERSHIP_OPTIONS, submitRenewalRequest, onClose }) {
  const [step, setStep]           = useState('plan');   // plan | pay | done
  const [plan, setPlan]           = useState(MEMBERSHIP_OPTIONS[0].value);
  const [reference, setReference] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied]       = useState(false);
  const receiptInputRef           = useRef(null);

  const price = settings[PLAN_PRICE_KEY[plan]] || 0;
  const planLabel = MEMBERSHIP_OPTIONS.find((o) => o.value === plan)?.label || plan;

  const canSubmit = reference.trim() || receiptFile;

  const handleReceiptFile = (file) => {
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (receiptInputRef.current) receiptInputRef.current.value = '';
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(settings.gcashNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await submitRenewalRequest({
        memberId:       member.id,
        memberName:     member.name,
        contactNumber:  member.contactNumber,
        membershipType: plan,
        amount:         price,
        gcashReference: reference.trim(),
        receiptFile:    receiptFile,
      });
      setStep('done');
    } catch (err) {
      alert('Failed to submit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-green-400" />
            <h3 className="text-white font-semibold">Pay via GCash</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">

          {/* ── Step 1: Select Plan ── */}
          {step === 'plan' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Select a renewal plan for <span className="text-white font-semibold">{member.name}</span>:</p>

              <div className="space-y-2">
                {MEMBERSHIP_OPTIONS.map((opt) => {
                  const optPrice = settings[PLAN_PRICE_KEY[opt.value]] || 0;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        plan === opt.value
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-slate-600 bg-slate-700/40 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value={opt.value}
                          checked={plan === opt.value}
                          onChange={() => setPlan(opt.value)}
                          className="accent-green-500"
                        />
                        <span className={`font-medium ${plan === opt.value ? 'text-green-400' : 'text-white'}`}>
                          {opt.label}
                        </span>
                      </div>
                      <span className={`font-bold ${plan === opt.value ? 'text-green-400' : 'text-slate-300'}`}>
                        {optPrice > 0 ? `₱${optPrice.toLocaleString()}` : '—'}
                      </span>
                    </label>
                  );
                })}
              </div>

              {price === 0 && (
                <p className="text-orange-400 text-xs text-center">Price not set for this plan. Please visit the gym.</p>
              )}

              <button
                onClick={() => setStep('pay')}
                disabled={price === 0}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 'pay' && (
            <div className="space-y-4">
              {/* Amount banner */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">Amount to send</p>
                <p className="text-green-400 font-black text-3xl mt-1">₱{price.toLocaleString()}</p>
                <p className="text-slate-500 text-xs mt-0.5">{planLabel} renewal</p>
              </div>

              {/* GCash info */}
              <div className="bg-slate-700/50 rounded-xl p-4 space-y-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Send to</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-black text-xl tracking-widest">{settings.gcashNumber}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{settings.gcashName}</p>
                  </div>
                  <button
                    onClick={copyNumber}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                      copied ? 'bg-green-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                    }`}
                  >
                    <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {settings.gcashQrUrl && (
                  <div className="flex justify-center pt-1">
                    <img
                      src={settings.gcashQrUrl}
                      alt="GCash QR Code"
                      className="w-40 h-40 object-contain bg-white rounded-xl p-2"
                    />
                  </div>
                )}
              </div>

              {/* Reference number */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  GCash Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full bg-slate-700 border border-slate-600 focus:border-green-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-500 font-mono text-sm"
                />
                <p className="text-slate-500 text-xs mt-1">Found in GCash app → Transaction History</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-xs font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              {/* Receipt upload */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Upload Payment Screenshot
                </label>
                {receiptPreview ? (
                  <div className="relative">
                    <img
                      src={receiptPreview}
                      alt="Receipt"
                      className="w-full max-h-48 object-contain bg-slate-700 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => receiptInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 hover:border-green-500 rounded-xl p-5 text-center cursor-pointer transition-colors group"
                  >
                    <ImageIcon size={28} className="mx-auto text-slate-500 group-hover:text-green-400 mb-2 transition-colors" />
                    <p className="text-slate-400 text-sm">Tap to upload your GCash receipt</p>
                    <p className="text-slate-600 text-xs mt-0.5">JPG, PNG supported</p>
                  </div>
                )}
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleReceiptFile(e.target.files[0])}
                />
                <p className="text-slate-500 text-xs mt-1">Take a photo or upload a screenshot of your payment</p>
              </div>

              {!canSubmit && (
                <p className="text-orange-400 text-xs text-center">
                  Please enter a reference number or upload a receipt screenshot
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('plan')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Submit Payment'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Payment Submitted!</p>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Your payment request has been sent to the admin.<br />
                  Your membership will be renewed once verified.
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-left space-y-1">
                <p className="text-slate-400 text-xs">Summary</p>
                <p className="text-white text-sm font-medium">{member.name} · {planLabel}</p>
                <p className="text-green-400 font-bold">₱{price.toLocaleString()}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value, valueClass = 'text-white' }) {
  return (
    <div className="bg-slate-700/40 rounded-xl p-3">
      <p className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">{icon} {label}</p>
      <p className={`font-semibold text-sm ${valueClass}`}>{value}</p>
    </div>
  );
}

function TagIcon({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
