import { useState, useEffect, useRef } from 'react';
import { Save, Upload, X, Settings, Send, Plus, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
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
    priceStudent: '',
    studentDurationDays: '30',
    telegramChatId: '',
    telegramBotToken: '',
    siteUrl: '',
    promos: [],
  });
  const [saving, setSaving] = useState(false);
  const [newPromo, setNewPromo] = useState({ name: '', price: '', duration_days: '' });
  const [addingPromo, setAddingPromo] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setForm((f) => ({
      ...f,
      gcashNumber:    settings.gcashNumber,
      gcashName:      settings.gcashName,
      gcashQrUrl:     settings.gcashQrUrl,
      priceMonthly:       settings.priceMonthly       || '',
      priceQuarterly:     settings.priceQuarterly     || '',
      priceSemiAnnual:    settings.priceSemiAnnual    || '',
      priceAnnual:        settings.priceAnnual        || '',
      priceStudent:       settings.priceStudent       || '',
      studentDurationDays: settings.studentDurationDays || '30',
      telegramChatId:   settings.telegramChatId   || '',
      telegramBotToken: settings.telegramBotToken || '',
      siteUrl:          settings.siteUrl          || '',
      promos:           settings.promos           || [],
    }));
  }, [settings]);

  const addPromo = () => {
    const name = newPromo.name.trim();
    const price = Number(newPromo.price);
    const duration_days = Number(newPromo.duration_days);
    if (!name || !price || !duration_days) return;
    const promo = { id: crypto.randomUUID(), name, price, duration_days, active: true };
    setForm((f) => ({ ...f, promos: [...f.promos, promo] }));
    setNewPromo({ name: '', price: '', duration_days: '' });
    setAddingPromo(false);
  };

  const togglePromo = (id) => {
    setForm((f) => ({
      ...f,
      promos: f.promos.map((p) => p.id === id ? { ...p, active: !p.active } : p),
    }));
  };

  const deletePromo = (id) => {
    setForm((f) => ({ ...f, promos: f.promos.filter((p) => p.id !== id) }));
  };

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

            {/* Student Membership */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-sky-500/20 rounded flex items-center justify-center">
                  <span className="text-sky-400 text-xs font-black">S</span>
                </div>
                <p className="text-slate-300 text-sm font-semibold">Student Membership</p>
                <span className="text-slate-500 text-xs">— always available</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₱</span>
                    <input
                      type="number"
                      min="0"
                      value={form.priceStudent}
                      onChange={(e) => set('priceStudent', e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-700 border border-slate-600 focus:border-sky-500 text-white rounded-xl pl-7 pr-4 py-3 outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5">Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.studentDurationDays}
                    onChange={(e) => set('studentDurationDays', e.target.value)}
                    placeholder="30"
                    className="w-full bg-slate-700 border border-slate-600 focus:border-sky-500 text-white rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                  />
                </div>
              </div>
              <p className="text-slate-600 text-xs">
                Shown as a permanent plan option. Members must present a valid student ID.
              </p>
            </div>
          </div>

          {/* Telegram Notifications */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Send size={16} className="text-sky-400" />
              <h2 className="text-white font-semibold text-base">Telegram Notifications</h2>
            </div>
            <p className="text-slate-500 text-xs -mt-2">
              Get notified via Telegram when a member submits a payment request.
            </p>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Bot Token</label>
              <input
                type="text"
                value={form.telegramBotToken}
                onChange={(e) => set('telegramBotToken', e.target.value)}
                placeholder="e.g. 7123456789:AAFxyz..."
                className="w-full bg-slate-700 border border-slate-600 focus:border-sky-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-500 text-sm font-mono"
              />
              <p className="text-slate-500 text-xs mt-1.5">Get this from @BotFather on Telegram</p>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Chat ID</label>
              <input
                type="text"
                value={form.telegramChatId}
                onChange={(e) => set('telegramChatId', e.target.value)}
                placeholder="e.g. 123456789"
                className="w-full bg-slate-700 border border-slate-600 focus:border-sky-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-500 text-sm font-mono"
              />
              <p className="text-slate-500 text-xs mt-1.5">
                Message your bot, then open{' '}
                <span className="text-sky-400 font-mono">api.telegram.org/bot&#123;TOKEN&#125;/getUpdates</span>
              </p>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Admin Panel URL</label>
              <input
                type="text"
                value={form.siteUrl}
                onChange={(e) => set('siteUrl', e.target.value)}
                placeholder="e.g. https://your-site.vercel.app"
                className="w-full bg-slate-700 border border-slate-600 focus:border-sky-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-500 text-sm"
              />
              <p className="text-slate-500 text-xs mt-1.5">Used to generate the link in Telegram notifications</p>
            </div>
            {form.telegramBotToken && form.telegramChatId && (
              <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-xl px-3 py-2">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
                <p className="text-sky-300 text-xs">Notifications active → Chat ID: <span className="font-mono font-bold">{form.telegramChatId}</span></p>
              </div>
            )}
          </div>

          {/* Special Promos */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-purple-400" />
                <h2 className="text-white font-semibold text-base">Special Promos</h2>
              </div>
              <button
                type="button"
                onClick={() => setAddingPromo((v) => !v)}
                className="flex items-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus size={13} /> Add Promo
              </button>
            </div>
            <p className="text-slate-500 text-xs -mt-2">
              Student discounts, anniversary promos, etc. Appear alongside standard plans.
            </p>

            {/* Add promo form */}
            {addingPromo && (
              <div className="bg-slate-700/50 rounded-xl p-4 space-y-3 border border-slate-600">
                <p className="text-slate-300 text-sm font-medium">New Promo</p>
                <input
                  type="text"
                  value={newPromo.name}
                  onChange={(e) => setNewPromo((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Promo name (e.g. Student Promo)"
                  className="w-full bg-slate-700 border border-slate-600 focus:border-purple-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors placeholder:text-slate-500 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                    <input
                      type="number"
                      min="0"
                      value={newPromo.price}
                      onChange={(e) => setNewPromo((p) => ({ ...p, price: e.target.value }))}
                      placeholder="Price"
                      className="w-full bg-slate-700 border border-slate-600 focus:border-purple-500 text-white rounded-xl pl-7 pr-4 py-2.5 outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={newPromo.duration_days}
                      onChange={(e) => setNewPromo((p) => ({ ...p, duration_days: e.target.value }))}
                      placeholder="Duration (days)"
                      className="w-full bg-slate-700 border border-slate-600 focus:border-purple-500 text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setAddingPromo(false); setNewPromo({ name: '', price: '', duration_days: '' }); }}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addPromo}
                    disabled={!newPromo.name.trim() || !newPromo.price || !newPromo.duration_days}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Promo list */}
            {form.promos.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-2">No promos yet</p>
            ) : (
              <div className="space-y-2">
                {form.promos.map((promo) => (
                  <div key={promo.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${promo.active ? 'border-purple-500/30 bg-purple-500/5' : 'border-slate-600 bg-slate-700/30 opacity-60'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{promo.name}</p>
                      <p className="text-slate-400 text-xs">₱{Number(promo.price).toLocaleString()} · {promo.duration_days} days</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePromo(promo.id)}
                      className="text-slate-400 hover:text-purple-300 transition-colors"
                      title={promo.active ? 'Disable promo' : 'Enable promo'}
                    >
                      {promo.active
                        ? <ToggleRight size={22} className="text-purple-400" />
                        : <ToggleLeft size={22} />
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePromo(promo.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete promo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
