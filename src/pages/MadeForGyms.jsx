import { useState, useEffect, useRef } from 'react';
import {
  Dumbbell, Users, CreditCard, Bell, ClipboardList,
  Smartphone, ChevronRight, Check, Star, Menu, X,
  Zap, Shield, BarChart3, MessageCircle, ArrowRight,
  TrendingUp, Clock, Globe, UserCheck, Layers,
} from 'lucide-react';

/* ── Scroll-reveal hook ─────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated counter ───────────────────────────────────────── */
function Counter({ to, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, to]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Reveal wrapper ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
      }}
    >
      {children}
    </div>
  );
}

/* ── Data ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Users, color: '#38bdf8', glow: 'rgba(56,189,248,0.15)',
    title: 'Member Management',
    desc: 'Register, track, and manage every member — their plans, status, photos, and history in one clean dashboard.',
  },
  {
    icon: CreditCard, color: '#4ade80', glow: 'rgba(74,222,128,0.15)',
    title: 'GCash Payments',
    desc: 'Members pay directly from their phone. You get a notification and approve with one tap — zero friction.',
  },
  {
    icon: Bell, color: '#fb923c', glow: 'rgba(251,146,60,0.15)',
    title: 'Telegram Alerts',
    desc: 'Instant Telegram notifications for every new payment. Review receipts and approve without opening the app.',
  },
  {
    icon: Dumbbell, color: '#facc15', glow: 'rgba(250,204,21,0.15)',
    title: 'Coach Portal',
    desc: 'Assign coaches to members. Trainers log workout programs, meal plans, and session notes from their own portal.',
  },
  {
    icon: Smartphone, color: '#c084fc', glow: 'rgba(192,132,252,0.15)',
    title: 'Member Self-Service',
    desc: 'Members check membership status, view coach programs, and renew online — no app download, just a link.',
  },
  {
    icon: BarChart3, color: '#f472b6', glow: 'rgba(244,114,182,0.15)',
    title: 'Attendance & Logs',
    desc: 'Kiosk check-in, attendance history, and a full audit trail of every action taken in your gym.',
  },
];

const STEPS = [
  { num: '01', color: '#fb923c', title: 'Create Your Gym Account', desc: 'Set up your gym in minutes — add your GCash details, membership prices, and your Telegram bot.' },
  { num: '02', color: '#38bdf8', title: 'Onboard Your Team', desc: 'Add coaches with their own access codes and portals. They log in, you stay in control.' },
  { num: '03', color: '#4ade80', title: 'Members Go Digital', desc: 'Share the member portal link. Members check status, renew, and see their coach plans — all from their phone.' },
  { num: '04', color: '#c084fc', title: 'Run on Autopilot', desc: 'Payments, renewals, and reminders run automatically. You focus on growing, not admin work.' },
];

const TESTIMONIALS = [
  {
    name: 'Coach Renz',
    role: 'Owner, Iron Peak Gym — Davao City',
    avatar: 'R',
    color: '#fb923c',
    text: '"Before this, I was tracking renewals in a notebook. Now I just check Telegram. Game changer for our 120 members."',
    stars: 5,
  },
  {
    name: 'Ma\'am Liza',
    role: 'Owner, FitZone Fitness — Cebu',
    avatar: 'L',
    color: '#38bdf8',
    text: '"Our coaches love the portal. They add workout plans, members see it instantly. No more group chats for everything."',
    stars: 5,
  },
  {
    name: 'Sir Mark',
    role: 'Manager, PowerHouse Gym — Manila',
    avatar: 'M',
    color: '#4ade80',
    text: '"GCash collection used to be a nightmare. Now members submit their own receipts and I approve in one click."',
    stars: 5,
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '₱499',
    period: '/month',
    desc: 'For gyms just getting started.',
    highlight: false,
    color: '#38bdf8',
    features: [
      'Up to 100 members',
      'Member portal & check-in',
      'GCash payment requests',
      'Attendance tracking',
      'Activity logs',
    ],
  },
  {
    name: 'Pro',
    price: '₱999',
    period: '/month',
    desc: 'The full system for serious gyms.',
    highlight: true,
    color: '#fb923c',
    features: [
      'Unlimited members',
      'Telegram notifications',
      'Coach & trainer portal',
      'Workout & meal plan builder',
      'Coaching subscription pricing',
      'Custom promos & pricing',
      'Priority support',
    ],
  },
];

/* ── Main Component ─────────────────────────────────────────── */
export default function MadeForGyms() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/70 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">MadeForGyms</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                {l}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/admin/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium px-4 py-2">
              Log in
            </a>
            <a href="/admin/login"
              className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
              Get Started
            </a>
          </div>

          <button onClick={() => setMenuOpen((o) => !o)} className="md:hidden text-slate-400 hover:text-white p-1">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 px-5 py-5 space-y-4">
            {['Features', 'How it Works', 'Pricing'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMenuOpen(false)}
                className="block text-slate-300 hover:text-white font-medium py-1 transition-colors">
                {l}
              </a>
            ))}
            <a href="/admin/login"
              className="block text-center font-bold py-3.5 rounded-xl mt-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}>
              Get Started
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-20 text-center overflow-hidden">

        {/* Animated background orbs */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="hero-orb-1" />
          <div className="hero-orb-2" />
          <div className="hero-orb-3" />
          {/* Grid overlay */}
          <div className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold mb-8 animate-fade-in"
          style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)', color: '#fb923c' }}>
          <Zap size={12} />
          Purpose-built for Philippine Gyms
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter mb-6 animate-fade-in-up">
          The Operating System<br />
          <span className="gradient-text">for Gym Owners</span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          Stop managing your gym with group chats and notebooks.
          GCash payments, member tracking, coach portals — one platform, zero chaos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <a href="/admin/login"
            className="w-full sm:w-auto group flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 0 30px rgba(249,115,22,0.35)' }}>
            Start Your Gym
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/member"
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl text-base border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:-translate-y-0.5">
            <UserCheck size={18} className="text-slate-400" />
            See Member Portal
          </a>
        </div>

        <p className="text-slate-600 text-xs mt-6 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          Works on any device · No app install · GCash ready
        </p>

        {/* Floating stat chips */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          {[
            { icon: Globe, label: 'Web-based', sub: 'Any browser' },
            { icon: CreditCard, label: 'GCash Ready', sub: 'Built-in payments' },
            { icon: Bell, label: 'Telegram Alerts', sub: 'Instant notifications' },
            { icon: Clock, label: '24/7 Portal', sub: 'Members self-serve' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm">
              <Icon size={16} className="text-orange-400 shrink-0" />
              <div className="text-left">
                <p className="text-white text-xs font-bold leading-tight">{label}</p>
                <p className="text-slate-600 text-[10px]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="py-16 px-5 border-y border-white/5" style={{ background: 'linear-gradient(180deg, rgba(249,115,22,0.03) 0%, transparent 100%)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: 500, suffix: '+', label: 'Members Managed' },
            { value: 98,  suffix: '%', label: 'Payment Success Rate' },
            { value: 10,  suffix: 'x', label: 'Faster Renewals' },
            { value: 24,  suffix: '/7', label: 'Member Self-Service' },
          ].map(({ value, suffix, label }) => (
            <Reveal key={label}>
              <div className="p-5">
                <p className="text-4xl sm:text-5xl font-black mb-1"
                  style={{ background: 'linear-gradient(135deg, #fb923c, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="py-28 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#fb923c' }}>Features</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
              Built for how gyms<br />actually operate
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Not generic business software. Every feature was designed around the real daily problems gym owners face.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, glow, title, desc }, i) => (
              <Reveal key={title} delay={i * 80} className="h-full">
                <div
                  className="group relative h-full p-6 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden"
                  style={{ '--glow': glow }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${glow}, transparent 70%)` }} />

                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: `${glow}`, border: `1px solid ${color}25` }}>
                      <Icon size={22} style={{ color }} />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Telegram Highlight ──────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 flex flex-col sm:flex-row items-center gap-10"
              style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, rgba(99,102,241,0.06) 100%)', border: '1px solid rgba(56,189,248,0.15)' }}>

              {/* BG glow */}
              <div className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)' }} />

              {/* Mock Telegram card */}
              <div className="shrink-0 w-full sm:w-72">
                <div className="rounded-2xl p-4 text-sm"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                  <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #0088cc, #00c6ff)' }}>🤖</div>
                    <div>
                      <p className="text-white text-xs font-bold">GymOS Bot</p>
                      <p className="text-slate-500 text-[10px]">just now</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
                    💳 <span className="text-white font-bold">New Payment Request</span><br /><br />
                    👤 <span className="text-slate-400">Member:</span> Juan dela Cruz<br />
                    📋 <span className="text-slate-400">Plan:</span> 1 Month<br />
                    💰 <span className="text-slate-400">Amount:</span> <span className="text-green-400 font-bold">₱500</span><br />
                    🔖 <span className="text-slate-400">Ref:</span> 12345678901
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                      ✓ Approve
                    </div>
                    <div className="flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                      ✗ Reject
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#38bdf8' }}>Telegram Integration</p>
                <h3 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                  Approve payments<br />without opening the app
                </h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Every GCash submission lands directly in your Telegram — with the member's name, amount, plan, and proof. Tap approve. Done.
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {['Instant notification', 'One-tap approve', 'View receipt', 'No login needed'].map((t) => (
                    <span key={t} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it Works ────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#4ade80' }}>How it Works</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
              Set up in an afternoon.<br />Run forever.
            </h2>
          </Reveal>

          <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute left-8 top-8 bottom-8 w-px hidden md:block" style={{ background: 'linear-gradient(180deg, rgba(249,115,22,0.5), rgba(192,132,252,0.1))' }} />

            {STEPS.map(({ num, color, title, desc }, i) => (
              <Reveal key={num} delay={i * 100}>
                <div className="flex items-start gap-6 p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                    {num}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1.5">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8" style={{ background: 'linear-gradient(180deg, transparent, rgba(249,115,22,0.03), transparent)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#c084fc' }}>Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              Gym owners love it
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, avatar, color, text, stars }, i) => (
              <Reveal key={name} delay={i * 100} className="h-full">
                <div className="h-full p-6 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12 transition-all flex flex-col">
                  <div className="flex mb-4">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={14} fill="#fb923c" className="text-orange-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-5">{text}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                      style={{ background: `${color}20`, color }}>
                      {avatar}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{name}</p>
                      <p className="text-slate-500 text-xs">{role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#fbbf24' }}>Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
              Simple pricing,<br />serious results
            </h2>
            <p className="text-slate-400">One gym, one price. No hidden fees, no per-member charges.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLANS.map(({ name, price, period, desc, highlight, color, features }, i) => (
              <Reveal key={name} delay={i * 100} className="h-full">
                <div className="relative h-full rounded-2xl p-7 flex flex-col overflow-hidden"
                  style={{
                    background: highlight ? `linear-gradient(135deg, rgba(249,115,22,0.08), rgba(245,158,11,0.04))` : 'rgba(255,255,255,0.02)',
                    border: highlight ? '1px solid rgba(249,115,22,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: highlight ? '0 0 60px rgba(249,115,22,0.1)' : 'none',
                  }}>

                  {highlight && (
                    <div className="absolute top-4 right-4 text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>
                      Most Popular
                    </div>
                  )}

                  {/* BG glow for Pro */}
                  {highlight && <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />}

                  <div className="relative">
                    <p className="text-slate-400 text-sm font-medium mb-2">{name}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-5xl font-black" style={{ color: highlight ? '#fb923c' : 'white' }}>{price}</span>
                      <span className="text-slate-500 text-sm mb-2">{period}</span>
                    </div>
                    <p className="text-slate-500 text-xs mb-6">{desc}</p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Check size={15} className="mt-0.5 shrink-0" style={{ color }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <a href="/admin/login"
                      className="block text-center font-bold py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5"
                      style={highlight
                        ? { background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
                      }>
                      Get Started
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Need a custom setup for multiple branches?{' '}
              <a href="mailto:hello@madeforgyms.com" className="text-orange-400 hover:text-orange-300 transition-colors">
                Contact us →
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-28 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden py-20 px-8">
              {/* BG */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(245,158,11,0.05) 50%, rgba(192,132,252,0.08) 100%)', border: '1px solid rgba(249,115,22,0.2)' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)' }} />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
                  style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}>
                  <Dumbbell size={30} className="text-white" />
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
                  Your gym deserves<br />
                  <span className="gradient-text">better software</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
                  Join gym owners who've left the group chats and notebooks behind.
                  Modern management starts today.
                </p>

                <a href="/admin/login"
                  className="group inline-flex items-center gap-2 font-bold px-10 py-5 rounded-2xl text-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 0 40px rgba(249,115,22,0.35)' }}>
                  Start Managing Your Gym
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}>
                <Dumbbell size={18} className="text-white" />
              </div>
              <div>
                <p className="font-black text-base leading-tight">MadeForGyms</p>
                <p className="text-slate-600 text-xs">madeforgyms.com</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/admin/login" className="hover:text-white transition-colors">Admin Login</a>
              <a href="/member" className="hover:text-white transition-colors">Member Portal</a>
              <a href="/coach" className="hover:text-white transition-colors">Coach Portal</a>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} MadeForGyms. All rights reserved.</p>
            <p className="text-slate-700 text-xs">Built for Philippine gym owners 🇵🇭</p>
          </div>
        </div>
      </footer>

      {/* ── Global styles ────────────────────────────────────── */}
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #fb923c 0%, #fbbf24 50%, #fb923c 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s linear infinite;
        }

        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .hero-orb-1 {
          position: absolute;
          top: -10%;
          left: -5%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%);
          animation: orb-float 10s ease-in-out infinite;
        }

        .hero-orb-2 {
          position: absolute;
          bottom: -10%;
          right: -5%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%);
          animation: orb-float 13s ease-in-out infinite reverse;
        }

        .hero-orb-3 {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(56,189,248,0.04) 0%, transparent 70%);
          animation: orb-float 15s ease-in-out infinite;
        }

        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.03); }
          66% { transform: translate(-15px, 15px) scale(0.97); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease forwards;
        }

        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
}
