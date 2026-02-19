import { supabase } from '../src/lib/supabaseClient';
import { PamboReview } from '../types';
import { buildPaginationMeta, logServiceTiming } from './serviceObservability';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const clampPageSize = (value?: number) => {
  const parsed = Number.isFinite(value) ? Number(value) : DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE);
};

const normalizeOffset = (value?: number) => {
  const parsed = Number.isFinite(value) ? Number(value) : 0;
  return Math.max(parsed, 0);
};

interface CreateReviewInput extends Omit<PamboReview, 'id' | 'createdAt'> {
  status?: 'pending' | 'approved' | 'rejected';
}

/**
 * Create a review for a listing
 */
export const createReview = async (review: CreateReviewInput) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...review,
        status: review.status || 'pending',
        createdAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    // Update listing's average rating
    if (data?.[0]) {
      await updateListingRating(review.listingId);
    }

    return { success: true, review: data?.[0] };
  } catch (error) {
    console.error('Create review error:', error);
    return { success: false, error };
  }
};

/**
 * Get reviews for a listing
 */
export const getListingReviews = async (listingId: string, limit = 10, offset = 0) => {
  const startedAt = Date.now();
  try {
    const safeLimit = clampPageSize(limit);
    const safeOffset = normalizeOffset(offset);

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('listingId', listingId)
      .eq('status', 'approved')
      .order('createdAt', { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (error) throw error;

    logServiceTiming('reviews.getListingReviews', startedAt, {
      listingId,
      limit: safeLimit,
      offset: safeOffset,
      resultCount: (data || []).length,
    });

    return {
      success: true,
      reviews: data || [],
      total: count || 0,
      pagination: buildPaginationMeta(count || 0, safeLimit, safeOffset),
    };
  } catch (error) {
    console.error('Get listing reviews error:', error);
    return { success: false, error };
  }
};

/**
 * Get reviews for a seller
 */
export const getSellerReviews = async (sellerId: string, limit = 10, offset = 0) => {
  const startedAt = Date.now();
  try {
    const safeLimit = clampPageSize(limit);
    const safeOffset = normalizeOffset(offset);

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('sellerId', sellerId)
      .eq('status', 'approved')
      .order('createdAt', { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (error) throw error;

    logServiceTiming('reviews.getSellerReviews', startedAt, {
      sellerId,
      limit: safeLimit,
      offset: safeOffset,
      resultCount: (data || []).length,
    });

    return {
      success: true,
      reviews: data || [],
      total: count || 0,
      pagination: buildPaginationMeta(count || 0, safeLimit, safeOffset),
    };
  } catch (error) {
    console.error('Get seller reviews error:', error);
    return { success: false, error };
  }
};

export const getAllReviews = async (limit = 2000) => {
  const startedAt = Date.now();
  try {
    const safeLimit = clampPageSize(limit);

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .limit(safeLimit);

    if (error) throw error;

    logServiceTiming('reviews.getAllReviews', startedAt, {
      limit: safeLimit,
      resultCount: (data || []).length,
    });

    return {
      success: true,
      reviews: data || [],
      total: count || 0,
      pagination: buildPaginationMeta(count || 0, safeLimit, 0),
    };
  } catch (error) {
    console.error('Get all reviews error:', error);
    return { success: false, error };
  }
};

/**
 * Update listing's average rating based on reviews
 */
const updateListingRating = async (listingId: string) => {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('listingId', listingId)
      .eq('status', 'approved');

    if (!reviews || reviews.length === 0) {
      await supabase
        .from('listings')
        .update({
          rating: 0,
          reviewCount: 0,
        })
        .eq('id', listingId);
      return;
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await supabase
      .from('listings')
      .update({
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: reviews.length,
      })
      .eq('id', listingId);
  } catch (error) {
    console.error('Update listing rating error:', error);
  }
};

/**
 * Get seller's average rating
 */
export const getSellerAverageRating = async (sellerId: string) => {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('sellerId', sellerId)
      .eq('status', 'approved');

    if (!reviews || reviews.length === 0) {
      return { success: true, averageRating: 0, reviewCount: 0 };
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    return {
      success: true,
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length,
    };
  } catch (error) {
    console.error('Get seller average rating error:', error);
    return { success: false, error };
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId: string) => {
  try {
    const { data: review } = await supabase
      .from('reviews')
      .select('helpfulCount')
      .eq('id', reviewId)
      .single();

    if (!review) throw new Error('Review not found');

    const { data, error } = await supabase
      .from('reviews')
      .update({ helpfulCount: (review.helpfulCount || 0) + 1 })
      .eq('id', reviewId)
      .select();

    if (error) throw error;

    return { success: true, review: data?.[0] };
  } catch (error) {
    console.error('Mark review helpful error:', error);
    return { success: false, error };
  }
};

/**
 * Delete review (by buyer or admin)
 */
export const deleteReview = async (reviewId: string, listingId: string) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    // Recalculate listing rating
    await updateListingRating(listingId);

    return { success: true };
  } catch (error) {
    console.error('Delete review error:', error);
    return { success: false, error };
  }
};

/**
 * Get rating distribution for a listing
 */
export const getListingRatingDistribution = async (listingId: string) => {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('listingId', listingId);

    if (!reviews || reviews.length === 0) {
      return {
        success: true,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        total: 0,
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5;
      distribution[rating]++;
    });

    return {
      success: true,
      distribution,
      total: reviews.length,
    };
  } catch (error) {
    console.error('Get rating distribution error:', error);
    return { success: false, error };
  }
};

/**
 * Get reviews with buyer details
 */
export const getReviewsWithBuyerDetails = async (listingId: string) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        buyer:buyerId(id, name, avatar)
        `
      )
      .eq('listingId', listingId)
      .eq('status', 'approved')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return { success: true, reviews: reviews || [] };
  } catch (error) {
    console.error('Get reviews with buyer details error:', error);
    return { success: false, error };
  }
};

export const updateReviewStatus = async (reviewId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    const { data: currentReview, error: currentError } = await supabase
      .from('reviews')
      .select('listingId')
      .eq('id', reviewId)
      .single();

    if (currentError || !currentReview) throw currentError || new Error('Review not found');

    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', reviewId);

    if (error) throw error;

    await updateListingRating(currentReview.listingId);

    return { success: true };
  } catch (error) {
    console.error('Update review status error:', error);
    return { success: false, error };
  }
};
