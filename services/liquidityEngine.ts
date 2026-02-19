/**
 * Liquidity Engine - Billion-Dollar Marketplace Core
 * ===================================================
 * 
 * Tracks and optimizes marketplace liquidity:
 * 1. Seller Response SLA monitoring (target: <2 hours)
 * 2. Category supply/demand balance
 * 3. Smart buyer-seller matching
 * 4. Low-liquidity alerts and interventions
 * 
 * WHY THIS MATTERS:
 * - Fast seller response = 3x higher conversion
 * - Balanced supply/demand = lower bounce rate
 * - Smart matching = higher contact-to-sale rate
 */

import { createClient } from '@supabase/supabase-js';

const readEnv = (key: string): string => {
  const viteEnv = (typeof import.meta !== 'undefined' ? import.meta.env : undefined) as Record<string, string | undefined> | undefined;
  const processEnv = typeof process !== 'undefined' ? process.env : undefined;
  return viteEnv?.[key] || processEnv?.[key] || '';
};

const supabaseUrl = readEnv('VITE_SUPABASE_URL') || readEnv('SUPABASE_URL');
const supabaseKey = readEnv('VITE_SUPABASE_ANON_KEY') || readEnv('SUPABASE_ANON_KEY');
export const supabase = createClient(supabaseUrl, supabaseKey);

// ===================================
// TYPES
// ===================================

export interface SellerResponseMetrics {
  sellerId: string;
  sellerName: string;
  averageResponseTimeHours: number;
  responseRate: number; // % of inquiries responded to
  last7DaysInquiries: number;
  last7DaysResponses: number;
  slaViolations: number; // Inquiries not responded to in 2 hours
  tier: 'excellent' | 'good' | 'needs_improvement' | 'poor';
}

export interface CategoryLiquidity {
  category: string;
  activeListings: number;
  activeSellers: number;
  last7DaysInquiries: number;
  last7DaysContacts: number;
  demandSupplyRatio: number; // inquiries per listing (higher = underserved)
  liquidityScore: number; // 0-100 (higher = healthier)
  status: 'oversupplied' | 'balanced' | 'undersupplied' | 'critical';
  topSellerResponseTime: number; // hours
}

export interface BuyerInquiry {
  id: string;
  buyerId: string;
  listingId: string;
  sellerId: string;
  message: string;
  createdAt: string;
  respondedAt?: string;
  responseTimeHours?: number;
  status: 'pending' | 'responded' | 'converted' | 'abandoned';
}

export interface MatchedSeller {
  sellerId: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
  matchScore: number; // 0-100
  averageResponseTime: number;
  rating: number;
  matchReasons: string[];
}

// ===================================
// SELLER RESPONSE SLA TRACKING
// ===================================

/**
 * Track seller response time and SLA compliance
 * SLA Target: 2 hours for first response
 */
export const trackSellerResponse = async (
  inquiryId: string,
  sellerId: string
): Promise<{ success: boolean; responseTimeHours: number; metSLA: boolean }> => {
  try {
    const { data: inquiry, error } = await supabase
      .from('buyer_inquiries')
      .select('created_at')
      .eq('id', inquiryId)
      .single();

    if (error || !inquiry) {
      return { success: false, responseTimeHours: 0, metSLA: false };
    }

    const createdTime = new Date(inquiry.created_at).getTime();
    const respondedTime = Date.now();
    const responseTimeHours = (respondedTime - createdTime) / (1000 * 60 * 60);

    const metSLA = responseTimeHours <= 2; // 2-hour SLA

    // Update inquiry with response time
    await supabase
      .from('buyer_inquiries')
      .update({
        responded_at: new Date().toISOString(),
        response_time_hours: responseTimeHours,
        status: 'responded',
      })
      .eq('id', inquiryId);

    // Update seller metrics
    await updateSellerMetrics(sellerId);

    return {
      success: true,
      responseTimeHours,
      metSLA,
    };
  } catch (error) {
    console.error('Error tracking seller response:', error);
    return { success: false, responseTimeHours: 0, metSLA: false };
  }
};

/**
 * Get seller response metrics for the last 7 days
 */
export const getSellerResponseMetrics = async (
  sellerId: string
): Promise<SellerResponseMetrics | null> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all inquiries for this seller in last 7 days
    const { data: inquiries, error } = await supabase
      .from('buyer_inquiries')
      .select('*')
      .eq('seller_id', sellerId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error || !inquiries) {
      return null;
    }

    const totalInquiries = inquiries.length;
    const respondedInquiries = inquiries.filter((i) => i.responded_at);
    const totalResponses = respondedInquiries.length;

    // Calculate average response time (only for responded inquiries)
    const responseTimes = respondedInquiries
      .filter((i) => i.response_time_hours)
      .map((i) => i.response_time_hours);

    const averageResponseTimeHours =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

    const responseRate = totalInquiries > 0 ? (totalResponses / totalInquiries) * 100 : 0;

    // Count SLA violations (responses > 2 hours)
    const slaViolations = respondedInquiries.filter((i) => i.response_time_hours > 2).length;

    // Determine tier
    let tier: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    if (averageResponseTimeHours <= 1 && responseRate >= 90) {
      tier = 'excellent';
    } else if (averageResponseTimeHours <= 2 && responseRate >= 75) {
      tier = 'good';
    } else if (averageResponseTimeHours <= 4 && responseRate >= 50) {
      tier = 'needs_improvement';
    } else {
      tier = 'poor';
    }

    // Get seller name
    const { data: seller } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', sellerId)
      .single();

    return {
      sellerId,
      sellerName: seller?.full_name || 'Unknown',
      averageResponseTimeHours,
      responseRate,
      last7DaysInquiries: totalInquiries,
      last7DaysResponses: totalResponses,
      slaViolations,
      tier,
    };
  } catch (error) {
    console.error('Error getting seller metrics:', error);
    return null;
  }
};

/**
 * Update seller's aggregated metrics in profiles table
 */
const updateSellerMetrics = async (sellerId: string): Promise<void> => {
  const metrics = await getSellerResponseMetrics(sellerId);
  if (!metrics) return;

  await supabase
    .from('profiles')
    .update({
      avg_response_time_hours: metrics.averageResponseTimeHours,
      response_rate: metrics.responseRate,
      response_tier: metrics.tier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sellerId);
};

// ===================================
// CATEGORY LIQUIDITY MONITORING
// ===================================

/**
 * Calculate liquidity score for a category
 * Score = 100 when perfectly balanced (2-5 inquiries per listing)
 */
export const getCategoryLiquidity = async (
  category: string
): Promise<CategoryLiquidity | null> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Count active listings in category
    const { count: activeListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .eq('status', 'active');

    // Count unique active sellers
    const { data: sellers } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('category', category)
      .eq('status', 'active');

    const activeSellers = new Set(sellers?.map((s) => s.seller_id)).size;

    // Count inquiries in last 7 days
    const { data: inquiries } = await supabase
      .from('buyer_inquiries')
      .select('listing_id, seller_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .in(
        'listing_id',
        (await supabase.from('listings').select('id').eq('category', category)).data?.map((l) => l.id) || []
      );

    const last7DaysInquiries = inquiries?.length || 0;

    // Count actual contacts (inquiries that got a response)
    const last7DaysContacts = inquiries?.filter((i: any) => i.responded_at).length || 0;

    // Calculate demand/supply ratio
    const demandSupplyRatio = (activeListings || 1) > 0 ? last7DaysInquiries / (activeListings || 1) : 0;

    // Optimal ratio is 2-5 inquiries per listing per week
    // Score calculation:
    // - If ratio is 2-5: score = 100
    // - If ratio < 2: score = (ratio / 2) * 100 (oversupplied)
    // - If ratio > 5: score = 100 - ((ratio - 5) * 10) (undersupplied)

    let liquidityScore: number;
    let status: 'oversupplied' | 'balanced' | 'undersupplied' | 'critical';

    if (demandSupplyRatio >= 2 && demandSupplyRatio <= 5) {
      liquidityScore = 100;
      status = 'balanced';
    } else if (demandSupplyRatio < 2) {
      liquidityScore = (demandSupplyRatio / 2) * 100;
      status = demandSupplyRatio < 0.5 ? 'oversupplied' : 'balanced';
    } else {
      liquidityScore = Math.max(0, 100 - (demandSupplyRatio - 5) * 10);
      status = demandSupplyRatio > 10 ? 'critical' : 'undersupplied';
    }

    // Get average response time of top sellers in this category
    const { data: topSellers } = await supabase
      .from('profiles')
      .select('avg_response_time_hours')
      .in(
        'id',
        sellers?.map((s) => s.seller_id) || []
      )
      .order('avg_response_time_hours', { ascending: true })
      .limit(5);

    const topSellerResponseTime =
      topSellers && topSellers.length > 0
        ? topSellers.reduce((sum, s) => sum + (s.avg_response_time_hours || 0), 0) / topSellers.length
        : 0;

    return {
      category,
      activeListings: activeListings || 0,
      activeSellers,
      last7DaysInquiries,
      last7DaysContacts,
      demandSupplyRatio,
      liquidityScore,
      status,
      topSellerResponseTime,
    };
  } catch (error) {
    console.error('Error calculating category liquidity:', error);
    return null;
  }
};

/**
 * Get all categories with liquidity scores
 */
export const getAllCategoryLiquidity = async (): Promise<CategoryLiquidity[]> => {
  try {
    // Get all unique categories
    const { data: categories } = await supabase
      .from('listings')
      .select('category')
      .eq('status', 'active');

    const uniqueCategories = [...new Set(categories?.map((c) => c.category) || [])];

    const liquidityPromises = uniqueCategories.map((cat) => getCategoryLiquidity(cat));
    const liquidityResults = await Promise.all(liquidityPromises);

    return liquidityResults.filter((l) => l !== null) as CategoryLiquidity[];
  } catch (error) {
    console.error('Error getting all category liquidity:', error);
    return [];
  }
};

// ===================================
// SMART BUYER-SELLER MATCHING
// ===================================

/**
 * Match buyer inquiry with best available sellers
 * Factors:
 * - Response time (faster = higher score)
 * - Response rate (higher = higher score)
 * - Rating (higher = higher score)
 * - Availability (currently online = boost)
 * - Category expertise (more listings in category = boost)
 */
export const matchBuyerToSellers = async (
  category: string,
  county?: string,
  limit: number = 5
): Promise<MatchedSeller[]> => {
  try {
    // Get active listings in category (and county if specified)
    let query = supabase
      .from('listings')
      .select('id, title, seller_id, price, county')
      .eq('category', category)
      .eq('status', 'active');

    if (county) {
      query = query.eq('county', county);
    }

    const { data: listings } = await query;

    if (!listings || listings.length === 0) {
      return [];
    }

    // Get seller metrics for all sellers
    const sellerIds = [...new Set(listings.map((l) => l.seller_id))];

    const { data: sellers } = await supabase
      .from('profiles')
      .select('id, full_name, avg_response_time_hours, response_rate, average_rating, is_online')
      .in('id', sellerIds);

    if (!sellers) return [];

    // Calculate match score for each seller
    const scoredSellers = sellers.map((seller) => {
      const sellerListings = listings.filter((l) => l.seller_id === seller.id);
      const hasListings = sellerListings.length > 0;

      if (!hasListings) return null;

      // Scoring factors (0-100 each)
      const responseTimeScore = seller.avg_response_time_hours
        ? Math.max(0, 100 - seller.avg_response_time_hours * 20) // Faster = higher
        : 50;

      const responseRateScore = seller.response_rate || 50;

      const ratingScore = seller.average_rating ? (seller.average_rating / 5) * 100 : 50;

      const availabilityBoost = seller.is_online ? 20 : 0;

      const categoryExpertiseBoost = Math.min(20, sellerListings.length * 2); // More listings = more expertise

      // Weighted total score
      const matchScore =
        responseTimeScore * 0.3 +
        responseRateScore * 0.25 +
        ratingScore * 0.25 +
        availabilityBoost +
        categoryExpertiseBoost;

      const matchReasons: string[] = [];
      if (seller.avg_response_time_hours && seller.avg_response_time_hours <= 1) {
        matchReasons.push('Fast responder (<1 hour)');
      }
      if (seller.response_rate && seller.response_rate >= 90) {
        matchReasons.push('High response rate (90%+)');
      }
      if (seller.average_rating && seller.average_rating >= 4.5) {
        matchReasons.push('Top rated (4.5+ stars)');
      }
      if (seller.is_online) {
        matchReasons.push('Currently online');
      }
      if (sellerListings.length >= 5) {
        matchReasons.push(`Category expert (${sellerListings.length} listings)`);
      }

      return {
        sellerId: seller.id,
        sellerName: seller.full_name || 'Unknown',
        listingId: sellerListings[0].id, // First listing from this seller
        listingTitle: sellerListings[0].title,
        matchScore,
        averageResponseTime: seller.avg_response_time_hours || 0,
        rating: seller.average_rating || 0,
        matchReasons,
      };
    });

    // Filter nulls, sort by score, return top matches
    return scoredSellers
      .filter((s): s is MatchedSeller => s !== null)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error matching buyer to sellers:', error);
    return [];
  }
};

// ===================================
// LOW LIQUIDITY ALERTS
// ===================================

/**
 * Get categories that need intervention
 * Returns categories with low liquidity scores
 */
export const getLowLiquidityAlerts = async (): Promise<
  Array<{ category: string; issue: string; recommendation: string; urgency: 'high' | 'medium' | 'low' }>
> => {
  const categoryLiquidity = await getAllCategoryLiquidity();

  const alerts = categoryLiquidity
    .filter((cat) => cat.liquidityScore < 60 || cat.status === 'critical')
    .map((cat) => {
      let issue = '';
      let recommendation = '';
      let urgency: 'high' | 'medium' | 'low' = 'medium';

      if (cat.status === 'critical') {
        issue = `Critical demand (${cat.demandSupplyRatio.toFixed(1)} inquiries per listing)`;
        recommendation = 'URGENT: Recruit sellers or pause marketing for this category';
        urgency = 'high';
      } else if (cat.status === 'undersupplied') {
        issue = `High demand, low supply (${cat.activeListings} listings, ${cat.last7DaysInquiries} inquiries)`;
        recommendation = 'Recruit more sellers in this category';
        urgency = 'high';
      } else if (cat.status === 'oversupplied') {
        issue = `Too many listings, low demand (${cat.activeListings} listings, ${cat.last7DaysInquiries} inquiries)`;
        recommendation = 'Focus marketing on this category or limit new listings';
        urgency = 'low';
      }

      if (cat.topSellerResponseTime > 4) {
        issue += ` | Slow seller response (${cat.topSellerResponseTime.toFixed(1)}h avg)`;
        recommendation += ' | Coach sellers on faster response times';
        urgency = 'high';
      }

      return {
        category: cat.category,
        issue,
        recommendation,
        urgency,
      };
    });

  return alerts.sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
};

// ===================================
// EXPORTS
// ===================================

export default {
  trackSellerResponse,
  getSellerResponseMetrics,
  getCategoryLiquidity,
  getAllCategoryLiquidity,
  matchBuyerToSellers,
  getLowLiquidityAlerts,
};
