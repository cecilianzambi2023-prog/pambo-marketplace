import { supabase } from '../src/lib/supabaseClient';
import { User } from '../types';

/**
 * Sign up a new user
 * 
 * Flow:
 * 1. Create auth user with email/password
 * 2. Insert profile row with matching user ID
 * 3. Return success for onboarding redirect
 * 
 * @param email - User email
 * @param password - User password
 * @param userData - Must include 'name' and 'phone' for full_name and phone_number
 */
export const signUp = async (email: string, password: string, userData: Partial<User>) => {
  try {
    // STEP 1: Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('Failed to create auth user');
    }

    const userId = authData.user.id;

    // STEP 2: Insert matching user row
    // ID MUST MATCH: data.user.id from auth signup
    const { error: dbError, data: profileData } = await supabase
      .from('users')
      .insert({
        id: userId,  // ← This MUST match the auth user ID
        email,
        name: userData.name || '',  // ← From form: User's full name
        phone: userData.phone || null,  // ← From form: User's phone number
        avatar: userData.avatar || null,
        role: userData.role || 'buyer',
        verified: false,
        account_status: 'active',
        join_date: new Date().toISOString(),
        bio: userData.bio || null,
        following: [],
      })
      .select();

    if (dbError) throw dbError;

    // STEP 3: Success - ready for onboarding redirect
    return {
      success: true,
      user: authData.user,
      userId,  // ← Can use this for onboarding navigation
      message: 'Profile created successfully. Redirecting to onboarding...',
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error };
  }
};

/**
 * Sign in user
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;

    return { success: true, user: data?.[0] };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error };
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, user: data };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error };
  }
};

/**
 * Get seller profile with verification status
 */
export const getSellerProfile = async (sellerId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sellerId)
      .in('role', ['seller', 'wholesaler', 'service_provider'])
      .single();

    if (error) throw error;

    // Get seller's listing count and average rating
    const { data: listingStats } = await supabase
      .from('listings')
      .select('id, rating')
      .eq('sellerId', sellerId)
      .eq('status', 'active');

    const avgRating = listingStats && listingStats.length > 0
      ? (listingStats.reduce((sum, item) => sum + (item.rating || 0), 0) / listingStats.length).toFixed(1)
      : 0;

    return {
      success: true,
      seller: {
        ...data,
        listingCount: listingStats?.length || 0,
        averageRating: avgRating,
      },
    };
  } catch (error) {
    console.error('Get seller profile error:', error);
    return { success: false, error };
  }
};

/**
 * Verify email (after signup)
 */
export const verifyEmail = async (token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error };
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error };
  }
};

/**
 * Follow a seller
 */
export const followSeller = async (buyerId: string, sellerId: string) => {
  try {
    const { data: user } = await supabase
      .from('profiles')
      .select('following')
      .eq('id', buyerId)
      .single();

    const following = user?.following || [];
    if (!following.includes(sellerId)) {
      following.push(sellerId);
    }

    const { error } = await supabase
      .from('profiles')
      .update({ following })
      .eq('id', buyerId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Follow seller error:', error);
    return { success: false, error };
  }
};

/**
 * Unfollow a seller
 */
export const unfollowSeller = async (buyerId: string, sellerId: string) => {
  try {
    const { data: user } = await supabase
      .from('profiles')
      .select('following')
      .eq('id', buyerId)
      .single();

    let following = user?.following || [];
    following = following.filter((id: string) => id !== sellerId);

    const { error } = await supabase
      .from('profiles')
      .update({ following })
      .eq('id', buyerId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Unfollow seller error:', error);
    return { success: false, error };
  }
};
