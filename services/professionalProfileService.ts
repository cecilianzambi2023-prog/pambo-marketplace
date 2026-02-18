/**
 * professionalProfileService.ts
 * ==============================
 * 
 * Service layer for professional profiles.
 * Handles fetching professional details, managing follows, and portfolios.
 */

import { supabase } from '@/lib/supabase';
import {
  ProfessionalDetailView,
  ProfessionalProfile,
  PortfolioMedia,
  ProfessionalSubcategory,
  FollowStats,
  FollowActionResponse,
  SearchProfessionalsFilter,
} from '@/types/professionalProfileTypes';

// ========================================================
// FETCH PROFESSIONAL PROFILE
// ========================================================

/**
 * Get full professional profile by ID
 * Includes: basic info, subcategories, portfolio, follower stats, subscription status
 */
export async function getProfessionalProfile(
  professionalId: string,
  currentUserId?: string
): Promise<ProfessionalDetailView> {
  try {
    // 1. Fetch professional profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', professionalId)
      .single();

    if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);

    // 2. Fetch subscription status (for Verified Pro badge)
    const { data: subscription } = await supabase
      .from('subscription_tiers')
      .select('status, tier')
      .eq('user_id', professionalId)
      .single();

    // 3. Fetch subcategories (what they specifically offer)
    const { data: subcategories = [] } = await supabase
      .from('professional_subcategories')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_active', true);

    // 4. Fetch portfolio (images + videos, max 10)
    const { data: portfolioMedia = [] } = await supabase
      .from('professional_portfolios')
      .select('*')
      .eq('professional_id', professionalId)
      .order('display_order', { ascending: true });

    // 5. Fetch follower count
    const { count: followerCount = 0 } = await supabase
      .from('followers')
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId);

    // 6. Check if current user is following (if logged in)
    let isFollowing = false;
    if (currentUserId) {
      const { data: followRecord } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('professional_id', professionalId)
        .single();
      isFollowing = !!followRecord;
    }

    return {
      ...profile,
      subscription_status: subscription?.status || 'inactive',
      subscription_tier: subscription?.tier,
      is_verified: subscription?.status === 'active',
      verification_badge: getVerificationBadge(subscription?.tier),
      follower_count: followerCount,
      subcategories,
      portfolio: {
        id: `portfolio-${professionalId}`,
        professional_id: professionalId,
        media_items: portfolioMedia,
        total_items: portfolioMedia.length,
      },
      follow_stats: {
        is_following: isFollowing,
        total_followers: followerCount,
      },
    };
  } catch (err) {
    console.error('Error fetching professional profile:', err);
    throw err;
  }
}

// ========================================================
// DYNAMIC ROUTING: FETCH BY URL SLUG
// ========================================================

/**
 * Get professional by name slug and category
 * Example: /professionals/john-kamau or /professionals/mamas-sofa-cleaning
 */
export async function getProfessionalBySlug(
  slug: string,
  currentUserId?: string
): Promise<ProfessionalDetailView | null> {
  try {
    // Try to match by full_name (converted to slug)
    const searchName = slug.replace(/-/g, ' ');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${searchName}%`)
      .single();

    if (error || !profile) return null;

    return getProfessionalProfile(profile.id, currentUserId);
  } catch (err) {
    console.error('Error fetching professional by slug:', err);
    return null;
  }
}

// ========================================================
// FOLLOW/UNFOLLOW SYSTEM
// ========================================================

/**
 * Follow a professional (real-time update)
 * Adds follower_id to followers table
 */
export async function followProfessional(
  followerId: string,
  professionalId: string
): Promise<FollowActionResponse> {
  try {
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: followerId,
        professional_id: professionalId,
      });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - already following
        return {
          success: false,
          is_following: true,
          new_follower_count: 0,
          error: 'Already following this professional',
        };
      }
      throw error;
    }

    // Fetch updated follower count
    const { count: followerCount = 0 } = await supabase
      .from('followers')
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId);

    // Update professional's follower_count in listings (if applicable)
    await updateProfessionalFollowerCount(professionalId, followerCount);

    return {
      success: true,
      is_following: true,
      new_follower_count: followerCount,
    };
  } catch (err) {
    console.error('Error following professional:', err);
    return {
      success: false,
      is_following: false,
      new_follower_count: 0,
      error: err instanceof Error ? err.message : 'Failed to follow',
    };
  }
}

/**
 * Unfollow a professional
 */
export async function unfollowProfessional(
  followerId: string,
  professionalId: string
): Promise<FollowActionResponse> {
  try {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('professional_id', professionalId);

    if (error) throw error;

    // Fetch updated follower count
    const { count: followerCount = 0 } = await supabase
      .from('followers')
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId);

    // Update professional's follower_count in listings
    await updateProfessionalFollowerCount(professionalId, followerCount);

    return {
      success: true,
      is_following: false,
      new_follower_count: followerCount,
    };
  } catch (err) {
    console.error('Error unfollowing professional:', err);
    return {
      success: false,
      is_following: true,
      new_follower_count: 0,
      error: err instanceof Error ? err.message : 'Failed to unfollow',
    };
  }
}

// ========================================================
// PORTFOLIO & GALLERY MANAGEMENT
// ========================================================

/**
 * Get portfolio media (images + videos)
 * Max 10 items per professional
 */
export async function getProfessionalPortfolio(
  professionalId: string
): Promise<PortfolioMedia[]> {
  try {
    const { data: media = [], error } = await supabase
      .from('professional_portfolios')
      .select('*')
      .eq('professional_id', professionalId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return media;
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    return [];
  }
}

/**
 * Add media to portfolio (image or video)
 * Enforces max 10 items
 */
export async function addPortfolioMedia(
  professionalId: string,
  media: Omit<PortfolioMedia, 'id' | 'created_at'>
): Promise<PortfolioMedia | null> {
  try {
    // Check if professional already has 10 items
    const { count: currentCount = 0 } = await supabase
      .from('professional_portfolios')
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId);

    if (currentCount >= 10) {
      throw new Error('Portfolio is full (max 10 items). Delete some items first.');
    }

    const { data, error } = await supabase
      .from('professional_portfolios')
      .insert({
        ...media,
        professional_id: professionalId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error adding portfolio media:', err);
    return null;
  }
}

/**
 * Delete media from portfolio
 */
export async function deletePortfolioMedia(mediaId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('professional_portfolios')
      .delete()
      .eq('id', mediaId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting portfolio media:', err);
    return false;
  }
}

/**
 * Update portfolio display order (reorder gallery)
 */
export async function reorderPortfolio(
  professionalId: string,
  mediaIds: string[]
): Promise<boolean> {
  try {
    const updates = mediaIds.map((id, index) => ({
      id,
      professional_id: professionalId,
      display_order: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('professional_portfolios')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error('Error reordering portfolio:', err);
    return false;
  }
}

// ========================================================
// SUB-CATEGORIES (WHAT THEY SPECIFICALLY OFFER)
// ========================================================

/**
 * Get subcategories for a professional
 * Example: "Sofa Cleaning", "Carpet Cleaning", "Office Cleaning"
 */
export async function getProfessionalSubcategories(
  professionalId: string
): Promise<ProfessionalSubcategory[]> {
  try {
    const { data: subcategories = [], error } = await supabase
      .from('professional_subcategories')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_active', true);

    if (error) throw error;
    return subcategories;
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    return [];
  }
}

/**
 * Add a subcategory that professional offers
 */
export async function addProfessionalSubcategory(
  professionalId: string,
  subcategory: Omit<ProfessionalSubcategory, 'id' | 'created_at'>
): Promise<ProfessionalSubcategory | null> {
  try {
    const { data, error } = await supabase
      .from('professional_subcategories')
      .insert({
        ...subcategory,
        professional_id: professionalId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error adding subcategory:', err);
    return null;
  }
}

// ========================================================
// SEARCH & FILTER
// ========================================================

/**
 * Search professionals by filters
 */
export async function searchProfessionals(
  filters: SearchProfessionalsFilter,
  currentUserId?: string
): Promise<ProfessionalProfile[]> {
  try {
    let query = supabase.from('profiles').select('*');

    // Search by name/title
    if (filters.search_query) {
      query = query.ilike('full_name', `%${filters.search_query}%`);
    }

    // Filter by county
    if (filters.county_id) {
      query = query.eq('county_id', filters.county_id);
    }

    // Add sorting
    const sortColumnMap: Record<string, string> = {
      rating: 'rating',
      followers: 'follower_count',
      recent: 'created_at',
      price_low: 'price_per_hour',
      price_high: 'price_per_hour',
    };

    const sortColumn = sortColumnMap[filters.sort_by || 'recent'] || 'created_at';
    const ascending = filters.sort_by === 'price_low';

    query = query.order(sortColumn, { ascending });

    // Pagination
    const page = filters.page || 1;
    const perPage = filters.per_page || 20;
    const from = (page - 1) * perPage;

    query = query.range(from, from + perPage - 1);

    const { data: professionals = [], error } = await query;

    if (error) throw error;

    return professionals;
  } catch (err) {
    console.error('Error searching professionals:', err);
    return [];
  }
}

// ========================================================
// HELPER FUNCTIONS
// ========================================================

/**
 * Determine verification badge based on subscription tier
 */
function getVerificationBadge(
  tier?: string
): 'bronze' | 'silver' | 'gold' | 'platinum' | undefined {
  if (!tier) return undefined;

  const tierMap: Record<string, 'bronze' | 'silver' | 'gold' | 'platinum'> = {
    starter: 'bronze',
    basic: 'bronze',
    professional: 'silver',
    pro: 'gold',
    premium: 'platinum',
    enterprise: 'platinum',
  };

  return tierMap[tier.toLowerCase()] || 'bronze';
}

/**
 * Update follower count in listings table (for card display)
 */
async function updateProfessionalFollowerCount(
  professionalId: string,
  newCount: number
): Promise<void> {
  try {
    await supabase
      .from('listings')
      .update({ follower_count: newCount })
      .eq('seller_id', professionalId)
      .eq('hub', 'services');
  } catch (err) {
    console.error('Error updating follower count:', err);
    // Non-critical error, don't throw
  }
}

/**
 * Real-time subscription to professional updates
 */
export function subscribeToProfessionalUpdates(
  professionalId: string,
  callback: (data: any) => void
) {
  return supabase
    .channel(`professional-${professionalId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'followers',
        filter: `professional_id=eq.${professionalId}`,
      },
      (payload) => callback(payload)
    )
    .subscribe();
}
