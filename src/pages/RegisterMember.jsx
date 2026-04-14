import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, User, Phone, Calendar, Tag, FileText, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useGym } from '../context/GymContext';
import Navbar from '../components/Navbar';
import CameraCapture from '../components/CameraCapture';
import { MEMBERSHIP_OPTIONS } from '../context/GymContext';
import toast from 'react-hot-toast';

const today = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
  name: '',
  contactNumber: '',
  membershipType: 'monthly',
  membershipStartDate: today(),
  notes: '',
  photo: null,
};

export default function RegisterMember() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addMember, updateMember, getMemberById } = useGym();

  const [form, setForm] = useState(EMPTY_FORM);
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const member = getMemberById(id);
      if (member) {
        setForm({
          name: member.name,
          contactNumber: member.contactNumber,
          membershipType: member.membershipType,
          membershipStartDate: member.membershipStartDate,
          notes: member.notes || '',
          photo: member.photo || null,
        });
      } else {
        toast.error('Member not found');
        navigate('/admin/members');
      }
    }
  }, [id, isEdit]); // eslint-disable-line

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.contactNumber.trim()) return toast.error('Contact number is required');

    setSaving(true);
    try {
      if (isEdit) {
        await updateMember(id, form);
        toast.success('Member updated!');
      } else {
        await addMember(form);
        toast.success('Member registered!');
      }
      navigate('/admin/members');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = () => {
    set('membershipStartDate', today());
    toast.success('Start date updated to today!');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title={isEdit ? 'Edit Member' : 'Register Member'} showBack />

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo section */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                {form.photo ? (
                  <img src={form.photo} alt="Member" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-600" />
                )}
              </div>
              {form.photo && (
                <button
                  type="button"
                  onClick={() => set('photo', null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Camera size={16} /> {form.photo ? 'Retake Photo' : 'Take Photo'}
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Name */}
            <FormField label="Full Name" icon={<User size={15} />}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Juan dela Cruz"
                required
                className="input-field"
              />
            </FormField>

            {/* Contact */}
            <FormField label="Contact Number" icon={<Phone size={15} />}>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => set('contactNumber', e.target.value)}
                placeholder="e.g. 09171234567"
                required
                className="input-field"
              />
            </FormField>

            {/* Membership Type */}
            <FormField label="Membership Plan" icon={<Tag size={15} />}>
              <select
                value={form.membershipType}
                onChange={(e) => set('membershipType', e.target.value)}
                className="input-field"
              >
                {MEMBERSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.days} days)
                  </option>
                ))}
              </select>
            </FormField>

            {/* Start Date */}
            <FormField label="Membership Start Date" icon={<Calendar size={15} />}>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={form.membershipStartDate}
                  onChange={(e) => set('membershipStartDate', e.target.value)}
                  required
                  className="input-field flex-1"
                />
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleRenew}
                    title="Set to today (renew)"
                    className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-3 rounded-xl text-sm font-medium transition-colors shrink-0"
                  >
                    <RefreshCw size={14} /> Renew
                  </button>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-1.5">
                {isEdit ? 'Click "Renew" to restart membership from today' : 'Date when membership begins'}
              </p>
            </FormField>

            {/* Notes */}
            <FormField label="Notes (optional)" icon={<FileText size={15} />}>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="input-field resize-none"
              />
            </FormField>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors text-base"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} /> {isEdit ? 'Save Changes' : 'Register Member'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={(photo) => set('photo', photo)}
          onClose={() => setShowCamera(false)}
        />
      )}

      <style>{`
        .input-field {
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          color: #f1f5f9;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          outline: none;
          font-size: 0.875rem;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: rgba(249, 115, 22, 0.6);
        }
        .input-field::placeholder {
          color: #475569;
        }
        .input-field option {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
}

function FormField({ label, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-slate-300 text-sm font-medium mb-2">
        <span className="text-slate-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
