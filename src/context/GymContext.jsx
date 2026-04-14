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

// Convert Supabase snake_case row → camelCase for the app
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

// Upload a base64 photo to Supabase Storage, return public URL
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

// Remove photo from Storage (silent – don't throw if missing)
const removePhoto = async (memberId) => {
  await supabase.storage.from('member-photos').remove([`${memberId}/photo.jpg`]);
};

export function GymProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    () => sessionStorage.getItem('gym_admin') === 'true'
  );

  // ── Load all members from Supabase ──────────────────────────
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

  // ── Helpers ─────────────────────────────────────────────────
  const calculateEndDate = (startDate, membershipType) => {
    const days = MEMBERSHIP_DAYS[membershipType] || 30;
    return addDays(new Date(startDate), days).toISOString().split('T')[0];
  };

  // ── Add member ───────────────────────────────────────────────
  const addMember = async (formData) => {
    const endDate = calculateEndDate(
      formData.membershipStartDate,
      formData.membershipType
    );

    // Insert first to get the generated UUID
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

    // Upload photo now that we have the ID
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
    return member;
  };

  // ── Update member ────────────────────────────────────────────
  const updateMember = async (id, formData) => {
    const existing = members.find((m) => m.id === id);
    const startDate = formData.membershipStartDate ?? existing?.membershipStartDate;
    const membershipType = formData.membershipType ?? existing?.membershipType;
    const endDate = calculateEndDate(startDate, membershipType);

    // Resolve photo
    let photoUrl;
    if (isBase64(formData.photo)) {
      // New capture → upload
      photoUrl = await uploadPhoto(formData.photo, id);
    } else if (!formData.photo && existing?.photo) {
      // Photo removed → delete from storage
      await removePhoto(id);
      photoUrl = null;
    } else {
      // Unchanged URL or still null
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
    return updated;
  };

  // ── Delete member ────────────────────────────────────────────
  const deleteMember = async (id) => {
    await removePhoto(id);

    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;

    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // ── Lookup helpers ───────────────────────────────────────────
  const getMemberById = (id) => members.find((m) => m.id === id);

  const findMembers = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return members.filter(
      (m) =>
        m.contactNumber.includes(q) ||
        m.name.toLowerCase().includes(q)
    );
  };

  const getMemberStatus = (member) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(member.membershipEndDate);
    end.setHours(0, 0, 0, 0);
    const daysLeft = differenceInDays(end, today);

    if (daysLeft < 0)
      return { status: 'expired', daysLeft, label: 'Expired', color: 'red' };
    if (daysLeft <= 5)
      return { status: 'expiring', daysLeft, label: `${daysLeft}d left`, color: 'orange' };
    return { status: 'active', daysLeft, label: 'Active', color: 'green' };
  };

  const getExpiringMembers = () =>
    members.filter((m) => getMemberStatus(m).status === 'expiring');

  // ── Admin auth ───────────────────────────────────────────────
  const adminLogin = (password) => {
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('gym_admin', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('gym_admin');
  };

  return (
    <GymContext.Provider
      value={{
        members,
        loading,
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
        MEMBERSHIP_OPTIONS,
        refreshMembers: loadMembers,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => useContext(GymContext);
