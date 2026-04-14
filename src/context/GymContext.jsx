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
  return data.publicUrl;
};

const removePhoto = async (memberId) => {
  await supabase.storage.from('member-photos').remove([`${memberId}/photo.jpg`]);
};

export function GymProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // ── Auth: check session on mount and listen to changes ──────
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

  const calculateEndDate = (startDate, membershipType) => {
    const days = MEMBERSHIP_DAYS[membershipType] || 30;
    return addDays(new Date(startDate), days).toISOString().split('T')[0];
  };

  // ── Activity logging ─────────────────────────────────────────
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

  // ── Duplicate name check ─────────────────────────────────────
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

  // ── Auth ─────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
  };

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
        refreshMembers: loadMembers,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => useContext(GymContext);
