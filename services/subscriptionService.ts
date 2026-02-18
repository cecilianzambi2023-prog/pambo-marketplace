/**
 * Subscription Service - Revenue Core
 * Handles subscriptions, payments, and access control
 */

import { supabase } from '../src/lib/supabaseClient';

export const subscriptionService = {
  /**
   * Create subscription for user
   */
  async createSubscription(
    userId: string,
    hub: string,
    plan: 'mkulima' | 'starter' | 'pro' | 'enterprise'
  ) {
    const planPricing = {
      mkulima: 1500,    // 1 YEAR special offer
      starter: 3500,    // Monthly
      pro: 5000,        // Monthly (changed from 7000)
      enterprise: 9000, // Monthly (changed from 14000)
    };

    const planPeriods = {
      mkulima: 365,     // 1 year
      starter: 30,      // Monthly
      pro: 30,          // Monthly
      enterprise: 30,   // Monthly
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        userId,
        hub,
        plan,
        monthlyPrice: planPricing[plan],
        status: 'pending_payment', // Requires M-Pesa payment
        billingCycle: plan === 'mkulima' ? 'yearly' : 'monthly',
        nextBillingDate: new Date(Date.now() + planPeriods[plan] * 24 * 60 * 60 * 1000),
        createdAt: new Date().toISOString(),
      })
      .select();

    return { data: data?.[0], error };
  },

  /**
   * Activate subscription after payment
   */
  async activateSubscription(subscriptionId: string, transactionId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        transactionId,
        activatedAt: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select();

    return { data: data?.[0], error };
  },

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string, hub: string): Promise<boolean> {
    if (hub === 'farmer') return true; // Farmer hub is free

    const { data } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('userId', userId)
      .eq('hub', hub)
      .eq('status', 'active')
      .single();

    return !!data;
  },

  /**
   * Get user subscription details
   */
  async getUserSubscriptions(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    return { data, error };
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select();

    return { data: data?.[0], error };
  },

  /**
   * Renew subscription
   */
  async renewSubscription(subscriptionId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'pending_payment',
        lastRenewalDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .eq('id', subscriptionId)
      .select();

    return { data: data?.[0], error };
  },
};

/**
 * Verification Service - Trust & Safety
 */
export const verificationService = {
  /**
   * Verify user identity (KYC)
   */
  async verifyIdentity(
    userId: string,
    idNumber: string,
    idType: 'national_id' | 'passport' | 'drivers_license',
    fullName: string
  ) {
    const { data, error } = await supabase
      .from('user_verification')
      .upsert(
        {
          userId,
          idType,
          idNumber: idNumber.slice(-4), // Store last 4 digits only
          fullName,
          status: 'pending',
          verifiedAt: null,
          createdAt: new Date().toISOString(),
        },
        { onConflict: 'userId' }
      )
      .select();

    return { data: data?.[0], error };
  },

  /**
   * Verify phone number
   */
  async verifyPhoneNumber(userId: string, phone: string, code: string) {
    // In production, verify SMS code
    const { data, error } = await supabase
      .from('user_verification')
      .update({
        phoneVerified: true,
        phone,
        phoneVerifiedAt: new Date().toISOString(),
      })
      .eq('userId', userId)
      .select();

    return { data: data?.[0], error };
  },

  /**
   * Get verification status
   */
  async getVerificationStatus(userId: string) {
    const { data, error } = await supabase
      .from('user_verification')
      .select('*')
      .eq('userId', userId)
      .single();

    return { data, error };
  },

  /**
   * Mark as verified (admin only)
   */
  async markVerified(userId: string) {
    const { data, error } = await supabase
      .from('user_verification')
      .update({
        status: 'verified',
        verifiedAt: new Date().toISOString(),
      })
      .eq('userId', userId)
      .select();

    return { data: data?.[0], error };
  },
};

/**
 * Premium Features Service
 */
export const premiumService = {
  /**
   * Get premium features for subscription tier
   */
  getPremiumFeatures(plan: string) {
    const features = {
      starter: {
        listings: 10,
        images: 5,
        featured: 0,
        analytics: 'basic',
        apiAccess: false,
        supportPriority: 'standard',
        showBadge: true,
      },
      pro: {
        listings: 50,
        images: 20,
        featured: 5,
        analytics: 'advanced',
        apiAccess: true,
        supportPriority: 'priority',
        showBadge: true,
        automations: 5,
      },
      enterprise: {
        listings: 500,
        images: 100,
        featured: 50,
        analytics: 'full',
        apiAccess: true,
        supportPriority: 'dedicated',
        showBadge: true,
        automations: 50,
        customBranding: true,
        dedicatedAccount: true,
      },
    };

    return features[plan as keyof typeof features] || features.starter;
  },

  /**
   * Check if user can create new listing
   */
  async canCreateListing(userId: string): Promise<boolean> {
    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('userId', userId)
      .eq('status', 'active')
      .single();

    if (!subscription) return false;

    // Get user's current listings
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('sellerId', userId)
      .eq('status', 'active');

    const features = this.getPremiumFeatures(subscription.plan);
    return (count || 0) < features.listings;
  },

  /**
   * Track feature usage
   */
  async trackUsage(userId: string, feature: string, count: number = 1) {
    const { data, error } = await supabase
      .from('feature_usage')
      .insert({
        userId,
        feature,
        count,
        date: new Date().toISOString(),
      });

    return { data, error };
  },
};

/**
 * Revenue Tracking Service
 */
export const revenueService = {
  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(startDate?: Date, endDate?: Date) {
    let query = supabase
      .from('subscriptions')
      .select('monthlyPrice, status, createdAt');

    if (startDate) {
      query = query.gte('createdAt', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('createdAt', endDate.toISOString());
    }

    const { data } = await query;

    const activeRevenue = data
      ?.filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.monthlyPrice, 0) || 0;

    const totalRevenue = data?.reduce((sum, s) => sum + s.monthlyPrice, 0) || 0;

    return {
      activeSubscriptions: data?.filter((s) => s.status === 'active').length || 0,
      totalSubscriptions: data?.length || 0,
      monthlyRecurring: activeRevenue,
      totalGenerated: totalRevenue,
    };
  },

  /**
   * Get total subscription revenue
   */
  async getTotalRevenue(period: 'day' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate = new Date();

    if (period === 'day') {
      startDate.setDate(now.getDate() - 1);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get subscription revenue only
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('monthlyPrice')
      .eq('status', 'active')
      .gte('createdAt', startDate.toISOString());

    const totalRevenue =
      subscriptions?.reduce((sum, s) => sum + s.monthlyPrice, 0) || 0;

    return {
      totalRevenue,
      period,
    };
  },
};
