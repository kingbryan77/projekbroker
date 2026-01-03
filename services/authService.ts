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
  };
};

export const register = async (userData: Omit<User, 'id' | 'username' | 'isAdmin' | 'isVerified' | 'balance' | 'notifications' | 'profilePictureUrl'> & { password: string }): Promise<User | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError || !authData.user) {
      console.error('Registration auth error:', authError?.message);
      return null;
    }

    const userId = authData.user.id;
    const username = userData.email.split('@')[0].toLowerCase();

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
          balance: 13000000,
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Registration profile error:', profileError?.message);
      return null;
    }

    return mapProfileToUser(profileData, authData.user);
  } catch (e) {
    console.error('Registration exception:', e);
    return null;
  }
};

export const adminCreateUser = async (userData: Omit<User, 'id' | 'username' | 'notifications'> & { password: string }): Promise<User | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError || !authData.user) throw authError;

    const userId = authData.user.id;
    const username = userData.email.split('@')[0].toLowerCase();

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: userData.email,
          full_name: userData.fullName,
          username: username,
          phone_number: userData.phoneNumber,
          is_admin: userData.isAdmin,
          is_verified: userData.isVerified,
          balance: userData.balance,
        }
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    return mapProfileToUser(profileData, authData.user);
  } catch (e) {
    console.error('Admin user creation exception:', e);
    return null;
  }
};

export const login = async (identifier: string, passwordAttempt: string): Promise<User | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: passwordAttempt,
    });

    if (authError || !authData.user) {
      console.error('Login error:', authError?.message);
      return null;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError?.message);
      return null;
    }

    return mapProfileToUser(profileData, authData.user);
  } catch (e) {
    console.error('Login exception:', e);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
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
};

export const verifyEmail = async (email: string): Promise<boolean> => {
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
    .select('*');

  if (error) {
    console.error("Error fetching all users", error?.message);
    return [];
  }
  
  return profiles.map((p: any) => ({
    id: p.id,
    email: p.email || 'hidden@email.com',
    fullName: p.full_name,
    username: p.username,
    phoneNumber: p.phone_number,
    isAdmin: p.is_admin,
    isVerified: p.is_verified,
    balance: p.balance,
    notifications: [],
    profilePictureUrl: p.profile_picture_url
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