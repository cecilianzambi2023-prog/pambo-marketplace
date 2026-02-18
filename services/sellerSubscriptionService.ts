/**
 * Seller Subscription Check Service
 * Prevents free users from posting listings
 * Only sellers with active subscriptions can post
 * Buyers can browse for free
 * 
 * ADMIN BYPASS: info@pambo.biz can post anything for testing
 */

import { supabase } from '../src/lib/supabaseClient';

// ============================================
// STATUS TYPES & INTERFACES
// ============================================

// Define the Status levels for our 6-in-1 Hub
export type SellerSubscriptionStatus = 'active' | 'expired' | 'pending' | 'none';

// Also ensure we have an interface if the code is looking for one
export interface SubscriptionDetails {
  status: SellerSubscriptionStatus;
  expiryDate: string | null;
  tier: 'mkulima' | 'starter' | 'pro' | 'enterprise' | 'none';
}

/**
 * Extended subscription status for detailed checks
 */
export interface SubscriptionCheckResult {
  isActive: boolean;
  tier?: 'free' | 'starter' | 'pro' | 'enterprise' | 'mkulima';
  expiresAt?: string;
  canPost: boolean;
  message: string;
}

/**
 * Check if a seller can post listings
 * ADMIN BYPASS: info@pambo.biz bypasses all checks
 * @param seller_id - The seller's ID
 * @param seller_email - The seller's email (for admin check)
 * @returns Subscription status and posting eligibility
 */
export const checkSellerSubscriptionStatus = async (seller_id: string, seller_email?: string): Promise<SubscriptionCheckResult> => {
  try {
    // ADMIN BYPASS: Allow info@pambo.biz to post freely
    if (seller_email === 'info@pambo.biz') {
      return {
        isActive: true,
        tier: 'enterprise',
        canPost: true,
        message: '✅ Admin bypass active - you can post anything for testing'
      };
    }

    // Fetch seller subscription from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, subscription_expires_at')
      .eq('id', seller_id)
      .single();

    if (error || !data) {
      return {
        isActive: false,
        tier: 'free',
        canPost: false,
        message: 'Seller profile not found'
      };
    }

    // Check if subscription is active
    const isActive = data.subscription_status === 'active';
    const hasExpired = data.subscription_expires_at 
      ? new Date(data.subscription_expires_at) < new Date()
      : false;

    const canPost = isActive && !hasExpired && data.subscription_tier !== 'free';

    return {
      isActive,
      tier: data.subscription_tier || 'free',
      expiresAt: data.subscription_expires_at,
      canPost,
      message: canPost
        ? '✅ You can post listings'
        : data.subscription_tier === 'free'
        ? '❌ Free users cannot post. Please subscribe to start selling.'
        : hasExpired
        ? '❌ Your subscription has expired. Please renew to continue selling.'
        : '❌ Your subscription is inactive. Please contact support.'
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isActive: false,
      tier: 'free',
      canPost: false,
      message: 'Error checking subscription status'
    };
  }
};

/**
 * Check if a seller can post listings (exported for use in components)
 * ADMIN BYPASS: info@pambo.biz can always post
 * Use this in your posting form/modal before allowing listing creation
 * @param seller_id - The seller's unique ID
 * @param seller_email - The seller's email address (for admin bypass check)
 * @returns true if seller can post, false otherwise
 */
export const canSellerPost = async (seller_id: string, seller_email?: string): Promise<boolean> => {
  // Quick admin check for testing
  if (seller_email === 'info@pambo.biz') {
    return true;
  }
  const status = await checkSellerSubscriptionStatus(seller_id, seller_email);
  return status.canPost;
};

// Export all functions and types for clean module interface
export default {
  checkSellerSubscriptionStatus,
  canSellerPost,
};

/**
 * Get subscription message for UI display
 */
export const getSubscriptionMessage = async (seller_id: string, seller_email?: string): Promise<string> => {
  const status = await checkSellerSubscriptionStatus(seller_id, seller_email);
  return status.message;
};

/**
 * Tier comparison for features
 */
export const isTierOrHigher = (userTier: string | undefined, requiredTier: string): boolean => {
  const tierRank = {
    free: 0,
    starter: 1,
    pro: 2,
    enterprise: 3,
    mkulima: 1 // Mkulima is a specialized tier
  };

  const userRank = tierRank[userTier as keyof typeof tierRank] || 0;
  const requiredRank = tierRank[requiredTier as keyof typeof tierRank] || 0;

  return userRank >= requiredRank;
};
