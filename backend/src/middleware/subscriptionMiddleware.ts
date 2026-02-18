/**
 * Subscription Verification Middleware
 * Checks if user has active subscription before accessing premium features
 */

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * Check if user has active subscription for a hub
 * Apply to: POST /api/listings (to check if can create)
 */
export const requireSubscription = (hub: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || req.query.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID required'
        });
      }

      // Farmer hub is always free
      if (hub === 'farmer') {
        return next();
      }

      // Check subscription
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('id, plan, status')
        .eq('userId', userId)
        .eq('hub', hub)
        .eq('status', 'active')
        .single();

      if (error || !subscription) {
        return res.status(403).json({
          success: false,
          error: `No active subscription for ${hub}. Upgrade to continue.`,
          requiresSubscription: true,
          hub
        });
      }

      // Attach subscription info to request
      (req as any).subscription = subscription;
      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  };
};

/**
 * Check listing limit based on subscription plan
 * Apply to: POST /api/listings
 */
export const checkListingLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.sellerId || req.body.userId;
    const hub = req.body.hub || 'marketplace';

    if (!userId) return next();

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('userId', userId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Active subscription required to create listings'
      });
    }

    // Plan limits
    const planLimits: { [key: string]: number } = {
      starter: 10,
      pro: 50,
      enterprise: 500
    };

    const limit = planLimits[subscription.plan] || 10;

    // Count current active listings
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('sellerId', userId)
      .eq('status', 'active');

    if ((count || 0) >= limit) {
      return res.status(403).json({
        success: false,
        error: `Listing limit reached for ${subscription.plan.toUpperCase()} plan (${limit} max)`,
        current: count,
        limit,
        upgrade: `Upgrade to Pro (${limit * 5} listings) or Enterprise (${limit * 50} listings)`
      });
    }

    // Attach info
    (req as any).subscription = subscription;
    (req as any).listingCount = count;
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * Check image upload limit based on subscription plan
 * Apply to: File upload endpoint
 */
export const checkImageLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.userId;

    if (!userId) return next();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('userId', userId)
      .eq('status', 'active')
      .single();

    const imageLimits: { [key: string]: number } = {
      starter: 5,
      pro: 20,
      enterprise: 100
    };

    const limit = imageLimits[subscription?.plan || 'starter'] || 5;

    // Check current usage
    const { count } = await supabase
      .from('feature_usage')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .eq('feature', 'images_uploaded')
      .gte('date', new Date().toISOString().split('T')[0]);

    if ((count || 0) >= limit) {
      return res.status(403).json({
        success: false,
        error: `Daily image limit reached (${limit} per day)`,
        current: count,
        limit
      });
    }

    (req as any).imageLimit = limit - (count || 0);
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * Track feature usage
 * Call after successful action: trackUsage(userId, feature)
 */
export const trackUsage = async (userId: string, feature: string, count: number = 1) => {
  try {
    await supabase
      .from('feature_usage')
      .insert({
        userId,
        feature,
        count,
        date: new Date().toISOString().split('T')[0]
      });
  } catch (err) {
    console.error('Failed to track usage:', err);
  }
};

/**
 * Verify seller identity before payment
 */
export const verifySellerKYC = async (sellerId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('user_verification')
      .select('status')
      .eq('userId', sellerId)
      .eq('status', 'verified')
      .single();

    return !!data;
  } catch {
    return false;
  }
};

/**
 * Generate trust badge info
 */
export const getTrustBadge = async (sellerId: string) => {
  try {
    const { data: badge } = await supabase
      .from('seller_badges')
      .select('*')
      .eq('sellerId', sellerId)
      .single();

    if (!badge) return null;

    return {
      level: badge.trustLevel,
      score: badge.trustScore,
      rating: badge.averageRating,
      reviews: badge.totalReviews,
      verified: badge.identityVerified,
      isPremium: badge.isPremiumSeller,
      icon: {
        'bronze': '🥉',
        'silver': '🥈',
        'gold': '🥇',
        'platinum': '💎'
      }[badge.trustLevel]
    };
  } catch {
    return null;
  }
};

/**
 * Update trust score based on actions
 */
export const updateTrustScore = async (sellerId: string) => {
  try {
    // Get seller data
    const { data: verification } = await supabase
      .from('user_verification')
      .select('*')
      .eq('userId', sellerId)
      .single();

    const { data: listing } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('sellerId', sellerId)
      .eq('status', 'active');

    const { data: review } = await supabase
      .from('reviews')
      .select('rating')
      .eq('sellerId', sellerId);

    // Calculate score
    let score = 0;

    // Verification (up to 300 points)
    if (verification?.status === 'verified') score += 100;
    if (verification?.phoneVerified) score += 100;
    if (verification?.bankVerified) score += 100;

    // Activity (up to 400 points)
    const listings = listing?.[0] || 0;
    score += Math.min(100, (listings / 50) * 100); // Max 100 for 50+ listings

    // Rating (up to 300 points)
    if (review && review.length > 0) {
      const avgRating = review.reduce((sum, r) => sum + r.rating, 0) / review.length;
      score += avgRating * 60; // 5 stars = 300 points
    }

    // Determine level
    let level = 'bronze';
    if (score >= 800) level = 'platinum';
    else if (score >= 500) level = 'gold';
    else if (score >= 100) level = 'silver';

    // Update badge
    await supabase
      .from('seller_badges')
      .upsert({
        sellerId,
        trustScore: score,
        trustLevel: level,
        identityVerified: verification?.status === 'verified',
        phoneVerified: verification?.phoneVerified,
        bankVerified: verification?.bankVerified,
        totalReviews: review?.length || 0,
        averageRating: review?.length 
          ? review.reduce((sum, r) => sum + r.rating, 0) / review.length 
          : 0,
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'sellerId'
      });

    return { score, level };
  } catch (err) {
    console.error('Failed to update trust score:', err);
    return null;
  }
};

export default {
  requireSubscription,
  checkListingLimit,
  checkImageLimit,
  trackUsage,
  verifySellerKYC,
  getTrustBadge,
  updateTrustScore
};
