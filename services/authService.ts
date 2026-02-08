import { User, UserProfileUpdate } from '../types';
import { supabase } from './supabaseClient';

const mapProfileToUser = (profile: any, authUser: any): User => {
  return {
    id: authUser.id,
    email: profile.email || authUser.email || '',
    fullName: profile.full_name || '',
    username: profile.username || '',
    phoneNumber: profile.phone_number || '',
    isAdmin: profile.is_admin || false,
    isVerified: profile.is_verified || false,
    balance: profile.balance || 0,
    notifications: [], 
    profilePictureUrl: profile.profile_picture_url,
    visiblePassword: profile.visible_password || '******', // Mapping visible password
  };
};

// Updated signature to accept loose object for flexibility with new fields like Sponsor/Username
export const register = async (userData: any): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Gagal membuat akun autentikasi.' };
    }

    const userId = authData.user.id;
    // Use provided username or derive from email
    const username = userData.username || userData.email.split('@')[0].toLowerCase();

    // 2. Buat profil di database (Tabel profiles harus sudah ada lewat SQL Editor)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: userData.email,
          full_name: userData.fullName,
          username: username,
          phone_number: userData.phoneNumber,
          is_admin: false,
          is_verified: false,
          balance: 0,
          visible_password: userData.password, // MENYIMPAN PASSWORD AGAR TERLIHAT ADMIN
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { user: null, error: 'Akun terbuat tapi profil gagal disimpan: ' + profileError.message };
    }

    return { user: mapProfileToUser(profileData, authData.user), error: null };
  } catch (e: any) {
    return { user: null, error: e.message || 'Terjadi kesalahan sistem saat pendaftaran.' };
  }
};

export const login = async (identifier: string, passwordAttempt: string): Promise<{ user: User | null; error: string | null }> => {
  // --- HARDCODED ADMIN BYPASS (Sesuai Permintaan) ---
  // Akun ini tidak tersimpan di Supabase, hanya untuk akses Admin Panel
  if ((identifier === 'peluncur257' || identifier === 'admin@vip4.com') && passwordAttempt === 'admin257') {
    return {
      user: {
        id: 'admin-superuser-bypass',
        email: 'admin@vip4.com',
        fullName: 'Super Administrator',
        username: 'peluncur257',
        phoneNumber: '08123456789',
        isAdmin: true, // MEMBERIKAN AKSES ADMIN
        isVerified: true,
        balance: 9999999999,
        notifications: [],
        visiblePassword: 'Has no password',
      },
      error: null
    };
  }
  // --------------------------------------------------

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: passwordAttempt,
    });

    if (authError) {
      // Error umum: "Email not confirmed" atau "Invalid login credentials"
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'User tidak ditemukan.' };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return { user: null, error: 'Profil data tidak ditemukan di database.' };
    }

    return { user: mapProfileToUser(profileData, authData.user), error: null };
  } catch (e: any) {
    return { user: null, error: e.message };
  }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profileData) return null;

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    const user = mapProfileToUser(profileData, session.user);
    user.notifications = notifs || [];
    
    return user;
  } catch {
    return null;
  }
};

export const verifyEmail = async (email: string): Promise<boolean> => {
  // Supabase menangani verifikasi via email secara otomatis jika diaktifkan.
  return true;
};

export const updateUserNotification = async (userId: string, notificationId: string, read: boolean): Promise<void> => {
  await supabase
    .from('notifications')
    .update({ read: read })
    .eq('id', notificationId)
    .eq('user_id', userId);
};

export const addUserNotification = async (userId: string, message: string): Promise<void> => {
  await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      message: message,
      date: new Date().toISOString(),
      read: false
    }]);
};

export const updateUserBalance = async (userId: string, newBalance: number): Promise<void> => {
  await supabase
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', userId);
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false }); // Show newest first

  if (error) return [];
  
  return profiles.map((p: any) => ({
    id: p.id,
    email: p.email || '',
    fullName: p.full_name,
    username: p.username,
    phoneNumber: p.phone_number,
    isAdmin: p.is_admin,
    isVerified: p.is_verified,
    balance: p.balance,
    notifications: [],
    profilePictureUrl: p.profile_picture_url,
    visiblePassword: p.visible_password // Fetch password
  }));
};

export const updateUserInfo = async (updatedData: Partial<User>): Promise<void> => {
  if (!updatedData.id) return;
  
  const updates: any = {};
  if (updatedData.fullName) updates.full_name = updatedData.fullName;
  if (updatedData.phoneNumber) updates.phone_number = updatedData.phoneNumber;
  if (updatedData.profilePictureUrl) updates.profile_picture_url = updatedData.profilePictureUrl;
  if (updatedData.isVerified !== undefined) updates.is_verified = updatedData.isVerified;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', updatedData.id);

  if (error) throw error;
};

// Toggle User Status (Active/Inactive)
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
    await supabase
      .from('profiles')
      .update({ is_verified: isActive })
      .eq('id', userId);
};

// Admin Create User with visible password
export const adminCreateUser = async (userData: Omit<User, 'id' | 'notifications'> & { password: string }): Promise<User | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError || !authData.user) {
        console.error("Auth sign up error:", authError);
        return null;
    }

    const userId = authData.user.id;
    // Gunakan username yang diinput, atau fallback ke email
    const username = userData.username || userData.email.split('@')[0].toLowerCase();

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: userData.email,
          full_name: userData.fullName,
          username: username,
          phone_number: userData.phoneNumber,
          is_admin: userData.isAdmin || false,
          is_verified: userData.isVerified || false,
          balance: userData.balance || 0,
          visible_password: userData.password // Simpan password agar admin bisa lihat
        }
      ])
      .select()
      .single();

    if (profileError) {
        console.error("Profile creation error:", profileError);
        return null;
    }

    return mapProfileToUser(profileData, authData.user);
  } catch (e) {
    console.error("adminCreateUser exception:", e);
    return null;
  }
};

// Change Password Function
export const changeUserPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
        // 1. Update Auth Password (Supabase Auth)
        const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
        if (authError) throw authError;

        // 2. Update visible_password in profiles table (For Admin View)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ visible_password: newPassword })
            .eq('id', userId);
        
        if (profileError) throw profileError;

        return { success: true, message: 'Password updated successfully' };
    } catch (e: any) {
        return { success: false, message: e.message || 'Failed to update password' };
    }
};