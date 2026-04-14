import { useState, useEffect, useRef } from 'react';
import { Save, Upload, X, Settings } from 'lucide-react';
import { useGym } from '../context/GymContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const PRICE_FIELDS = [
  { key: 'priceMonthly',    label: '1 Month' },
  { key: 'priceQuarterly',  label: '3 Months' },
  { key: 'priceSemiAnnual', label: '6 Months' },
  { key: 'priceAnnual',     label: '1 Year' },
];

export default function AdminSettings() {
  const { settings, saveSettings } = useGym();
  const [form, setForm] = useState({
    gcashNumber: '',
    gcashName: '',
    gcashQrUrl: null,
    gcashQrFile: null,
    gcashQrPreview: null,
    priceMonthly: '',
    priceQuarterly: '',
    priceSemiAnnual: '',
    priceAnnual: '',
  });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setForm((f) => ({
      ...f,
      gcashNumber:    settings.gcashNumber,
      gcashName:      settings.gcashName,
      gcashQrUrl:     settings.gcashQrUrl,
      priceMonthly:   settings.priceMonthly   || '',
      priceQuarterly: settings.priceQuarterly  || '',
      priceSemiAnnual:settings.priceSemiAnnual || '',
      priceAnnual:    settings.priceAnnual     || '',
    }));
  }, [settings]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleQrFile = (file) => {
    if (!file) return;
    set('gcashQrFile', file);
    set('gcashQrPreview', URL.createObjectURL(file));
  };

  const removeQr = () => {
    set('gcashQrFile', null);
    set('gcashQrPreview', null);
    set('gcashQrUrl', null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(form);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const qrDisplay = form.gcashQrPreview || form.gcashQrUrl;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <Settings size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 text-sm">GCash payment details &amp; membership prices</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* GCash details */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 space-y-4">
            <h2 className="text-white font-semibold text-base">GCash Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">GCash Number</label>
                <input
                  type="text"
                  value={form.gcashNumber}
                  onChange={(e) => set('gcashNumber', e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="w-full bg-slate-700 border border-slate-600 focus:border-green-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={form.gcashName}
                  onChange={(e) => set('gcashName', e.target.value)}
                  placeholder="Full name on GCash"
                  className="w-full bg-slate-700 border border-slate-600 focus:border-green-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>

            {/* QR Upload */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">GCash QR Code</label>
              <div className="flex items-start gap-4">
                {qrDisplay ? (
                  <div className="relative shrink-0">
                    <img
                      src={qrDisplay}
                      alt="GCash QR"
                      className="w-28 h-28 object-contain bg-white rounded-xl p-1.5"
                    />
                    <button
                      type="button"
                      onClick={removeQr}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ) : null}

                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-slate-600 hover:border-green-500 rounded-xl p-5 text-center cursor-pointer transition-colors group"
                >
                  <Upload size={22} className="mx-auto text-slate-500 group-hover:text-green-400 mb-2 transition-colors" />
                  <p className="text-slate-400 text-sm">
                    {qrDisplay ? 'Click to replace QR' : 'Upload your GCash QR code'}
                  </p>
                  <p className="text-slate-600 text-xs mt-0.5">PNG, JPG supported</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleQrFile(e.target.files[0])}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Membership Prices */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 space-y-4">
            <div>
              <h2 className="text-white font-semibold text-base">Membership Prices</h2>
              <p className="text-slate-500 text-xs mt-0.5">Set the amount members need to pay per plan</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {PRICE_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₱</span>
                    <input
                      type="number"
                      min="0"
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-700 border border-slate-600 focus:border-orange-500 text-white rounded-xl pl-7 pr-4 py-3 outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {saving
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save size={18} /> Save Settings</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
