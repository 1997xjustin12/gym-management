import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { differenceInDays, addDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const GymContext = createContext();

export const MEMBERSHIP_OPTIONS = [
  { value: 'monthly', label: '1 Month', days: 30 },
  { value: 'quarterly', label: '3 Months', days: 90 },
  { value: 'semi-annual', label: '6 Months', days: 180 },
  { value: 'annual', label: '1 Year', days: 365 },
];

const MEMBERSHIP_DAYS = Object.fromEntries(
  MEMBERSHIP_OPTIONS.map((o) => [o.value, o.days])
);

const toMember = (row) => ({
  id: row.id,
  name: row.name,
  contactNumber: row.contact_number,
  photo: row.photo_url || null,
  membershipType: row.membership_type,
  membershipStartDate: row.membership_start_date,
  membershipEndDate: row.membership_end_date,
  notes: row.notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSettings = (row) => ({
  gcashNumber: row.gcash_number || '',
  gcashName: row.gcash_name || '',
  gcashQrUrl: row.gcash_qr_url || null,
  priceMonthly: Number(row.price_monthly) || 0,
  priceQuarterly: Number(row.price_quarterly) || 0,
  priceSemiAnnual: Number(row.price_semi_annual) || 0,
  priceAnnual: Number(row.price_annual) || 0,
  priceStudent: Number(row.price_student) || 0,
  telegramChatId: row.telegram_chat_id || '',
  telegramBotToken: row.telegram_bot_token || '',
  siteUrl: row.site_url || '',
  lastBackupAt: row.last_backup_at || null,
  promos: Array.isArray(row.promos) ? row.promos : [],
});

const isBase64 = (str) => typeof str === 'string' && str.startsWith('data:');

const uploadPhoto = async (base64DataUrl, memberId) => {
  const res = await fetch(base64DataUrl);
  const blob = await res.blob();
  const path = `${memberId}/photo.jpg`;
  const { error } = await supabase.storage
    .from('member-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('member-photos').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
};

const removePhoto = async (memberId) => {
  await supabase.storage.from('member-photos').remove([`${memberId}/photo.jpg`]);
};

export function GymProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [settings, setSettings] = useState({
    gcashNumber: '',
    gcashName: '',
    gcashQrUrl: null,
    priceMonthly: 0,
    priceQuarterly: 0,
    priceSemiAnnual: 0,
    priceAnnual: 0,
    priceStudent: 0,
    telegramChatId: '',
    telegramBotToken: '',
    siteUrl: '',
    lastBackupAt: null,
    promos: [],
  });
  const [renewalRequests, setRenewalRequests] = useState([]);

  // ── Auth ─────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdminLoggedIn(!!session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load members ─────────────────────────────────────────────
  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMembers((data || []).map(toMember));
    } catch (err) {
      console.error('Failed to load members:', err);
      toast.error('Could not load members. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // ── Real-time: members ────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('members_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        loadMembers();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadMembers]);

  // ── Load settings ─────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gym_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(toSettings(data));
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (formData) => {
    let gcashQrUrl = formData.gcashQrUrl;

    if (formData.gcashQrFile) {
      const file = formData.gcashQrFile;
      const { error: upErr } = await supabase.storage
        .from('member-photos')
        .upload('settings/gcash-qr.png', file, { contentType: file.type, upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('member-photos').getPublicUrl('settings/gcash-qr.png');
      gcashQrUrl = `${data.publicUrl}?v=${Date.now()}`;
    }

    const { error } = await supabase.from('gym_settings').upsert({
      id: 'default',
      gcash_number: formData.gcashNumber,
      gcash_name: formData.gcashName,
      gcash_qr_url: gcashQrUrl,
      price_monthly: Number(formData.priceMonthly) || 0,
      price_quarterly: Number(formData.priceQuarterly) || 0,
      price_semi_annual: Number(formData.priceSemiAnnual) || 0,
      price_annual: Number(formData.priceAnnual) || 0,
      price_student: Number(formData.priceStudent) || 0,
      telegram_chat_id: formData.telegramChatId || '',
      telegram_bot_token: formData.telegramBotToken || '',
      site_url: formData.siteUrl || '',
      promos: formData.promos || [],
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    await loadSettings();
  };

  const recordBackup = async () => {
    const now = new Date().toISOString();
    await supabase.from('gym_settings').upsert({ id: 'default', last_backup_at: now });
    setSettings((prev) => ({ ...prev, lastBackupAt: now }));
  };

  // ── Load renewal requests ─────────────────────────────────────
  const loadRenewalRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('renewal_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRenewalRequests(data || []);
    } catch (err) {
      console.error('Failed to load renewal requests:', err);
    }
  }, []);

  useEffect(() => {
    loadRenewalRequests();
  }, [loadRenewalRequests]);

  // ── Real-time: renewal requests ───────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('renewal_requests_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'renewal_requests' }, () => {
        loadRenewalRequests();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadRenewalRequests]);

  const submitRenewalRequest = async (payload) => {
    let receiptUrl = null;

    if (payload.receiptFile) {
      const file = payload.receiptFile;
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `receipts/${Date.now()}-${payload.memberId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('member-photos')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('member-photos').getPublicUrl(path);
      receiptUrl = data.publicUrl;
    }

    const { error } = await supabase.from('renewal_requests').insert([{
      member_id: payload.memberId,
      member_name: payload.memberName,
      contact_number: payload.contactNumber,
      membership_type: payload.membershipType,
      amount: payload.amount,
      gcash_reference: payload.gcashReference || '',
      receipt_url: receiptUrl,
      duration_days: payload.durationDays || null,
      status: 'pending',
    }]);
    if (error) throw error;
  };

  const approveRenewalRequest = async (request) => {
    const today = new Date().toISOString().split('T')[0];
    const days = request.duration_days || getTypeDays(request.membership_type);
    const endDate = addDays(new Date(today), days).toISOString().split('T')[0];

    // Directly update membership dates — skip name duplicate check
    const { data, error: memberErr } = await supabase
      .from('members')
      .update({
        membership_type: request.membership_type,
        membership_start_date: today,
        membership_end_date: endDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.member_id)
      .select()
      .single();
    if (memberErr) throw memberErr;

    setMembers((prev) => prev.map((m) => (m.id === request.member_id ? toMember(data) : m)));

    const { error: reqErr } = await supabase
      .from('renewal_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', request.id);
    if (reqErr) throw reqErr;

    await logAction(
      'PAYMENT_APPROVED',
      `Approved GCash payment ₱${request.amount} — renewed ${request.membership_type} for: ${request.member_name}`,
      request.member_name,
      request.member_id,
    );
    await loadRenewalRequests();
  };

  const rejectRenewalRequest = async (id, notes = '') => {
    const request = renewalRequests.find((r) => r.id === id);
    const { error } = await supabase
      .from('renewal_requests')
      .update({ status: 'rejected', admin_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;

    await logAction(
      'PAYMENT_REJECTED',
      `Rejected GCash payment for: ${request?.member_name}`,
      request?.member_name,
      request?.member_id,
    );
    await loadRenewalRequests();
  };

  // ── Helpers ───────────────────────────────────────────────────
  const getTypeDays = (membershipType) =>
    MEMBERSHIP_DAYS[membershipType]
    || (membershipType === 'student' ? 30 : null)
    || settings.promos.find((p) => p.name === membershipType)?.duration_days
    || 30;

  const calculateEndDate = (startDate, membershipType) => {
    const days = getTypeDays(membershipType);
    return addDays(new Date(startDate), days).toISOString().split('T')[0];
  };

  const logAction = async (action, description, memberName = null, memberId = null) => {
    try {
      await supabase.from('activity_logs').insert([{
        action,
        description,
        member_name: memberName,
        member_id: memberId,
      }]);
    } catch (err) {
      console.error('Log failed:', err);
    }
  };

  const isNameTaken = (name, excludeId = null) => {
    const normalized = name.trim().toLowerCase();
    return members.some(
      (m) => m.name.trim().toLowerCase() === normalized && m.id !== excludeId
    );
  };

  // ── CRUD ─────────────────────────────────────────────────────
  const addMember = async (formData) => {
    if (isNameTaken(formData.name)) {
      throw new Error(`A member named "${formData.name}" already exists.`);
    }
    const endDate = calculateEndDate(formData.membershipStartDate, formData.membershipType);
    const { data: inserted, error: insertError } = await supabase
      .from('members')
      .insert([{
        name: formData.name,
        contact_number: formData.contactNumber,
        photo_url: null,
        membership_type: formData.membershipType,
        membership_start_date: formData.membershipStartDate,
        membership_end_date: endDate,
        notes: formData.notes || '',
      }])
      .select()
      .single();
    if (insertError) throw insertError;

    let photoUrl = null;
    if (isBase64(formData.photo)) {
      photoUrl = await uploadPhoto(formData.photo, inserted.id);
      await supabase
        .from('members')
        .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq('id', inserted.id);
      inserted.photo_url = photoUrl;
    }

    const member = toMember(inserted);
    setMembers((prev) => [member, ...prev]);
    await logAction('MEMBER_ADDED', `Registered new member: ${member.name}`, member.name, member.id);
    return member;
  };

  const updateMember = async (id, formData) => {
    if (isNameTaken(formData.name, id)) {
      throw new Error(`A member named "${formData.name}" already exists.`);
    }
    const existing = members.find((m) => m.id === id);
    const startDate = formData.membershipStartDate ?? existing?.membershipStartDate;
    const membershipType = formData.membershipType ?? existing?.membershipType;
    const endDate = calculateEndDate(startDate, membershipType);

    let photoUrl;
    if (isBase64(formData.photo)) {
      photoUrl = await uploadPhoto(formData.photo, id);
    } else if (!formData.photo && existing?.photo) {
      await removePhoto(id);
      photoUrl = null;
    } else {
      photoUrl = formData.photo ?? null;
    }

    const { data, error } = await supabase
      .from('members')
      .update({
        name: formData.name,
        contact_number: formData.contactNumber,
        photo_url: photoUrl,
        membership_type: membershipType,
        membership_start_date: startDate,
        membership_end_date: endDate,
        notes: formData.notes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const updated = toMember(data);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    const isRenewal = existing?.membershipStartDate !== startDate;
    if (isRenewal) {
      await logAction('MEMBERSHIP_RENEWED', `Renewed membership for: ${updated.name}`, updated.name, id);
    } else {
      await logAction('MEMBER_UPDATED', `Updated member info: ${updated.name}`, updated.name, id);
    }
    return updated;
  };

  const renewMember = async (id, membershipType, paymentMethod, durationDays) => {
    const today = new Date().toISOString().split('T')[0];
    const days = durationDays || getTypeDays(membershipType);
    const endDate = addDays(new Date(today), days).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('members')
      .update({
        membership_type: membershipType,
        membership_start_date: today,
        membership_end_date: endDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const updated = toMember(data);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    await logAction(
      'MEMBERSHIP_RENEWED',
      `Admin accepted ${paymentMethod} payment — renewed ${membershipType} for: ${updated.name}`,
      updated.name,
      id,
    );
    return updated;
  };

  const deleteMember = async (id) => {
    const member = members.find((m) => m.id === id);
    await removePhoto(id);
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    await logAction('MEMBER_DELETED', `Removed member: ${member?.name}`, member?.name, id);
  };

  const getMemberById = (id) => members.find((m) => m.id === id);

  const findMembers = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return members.filter(
      (m) => m.contactNumber.includes(q) || m.name.toLowerCase().includes(q)
    );
  };

  const getMemberStatus = (member) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(member.membershipEndDate);
    end.setHours(0, 0, 0, 0);
    const daysLeft = differenceInDays(end, today);
    if (daysLeft < 0) return { status: 'expired', daysLeft, label: 'Expired', color: 'red' };
    if (daysLeft <= 5) return { status: 'expiring', daysLeft, label: 'Active', color: 'orange' };
    return { status: 'active', daysLeft, label: 'Active', color: 'green' };
  };

  const getExpiringMembers = () =>
    members.filter((m) => getMemberStatus(m).status === 'expiring');

  const adminLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
  };

  const pendingRenewals = renewalRequests.filter((r) => r.status === 'pending');

  return (
    <GymContext.Provider
      value={{
        members,
        loading,
        authLoading,
        isAdminLoggedIn,
        addMember,
        updateMember,
        deleteMember,
        getMemberById,
        findMembers,
        getMemberStatus,
        getExpiringMembers,
        adminLogin,
        adminLogout,
        logAction,
        MEMBERSHIP_OPTIONS,
        renewMember,
        refreshMembers: loadMembers,
        // Settings
        settings,
        saveSettings,
        recordBackup,
        // Renewal requests
        renewalRequests,
        pendingRenewals,
        loadRenewalRequests,
        submitRenewalRequest,
        approveRenewalRequest,
        rejectRenewalRequest,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => useContext(GymContext);
