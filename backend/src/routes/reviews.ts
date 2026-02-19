import express, { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/reviews
 * Create a review
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      listingId,
      buyerId,
      sellerId,
      rating,
      comment,
      images
    } = req.body;

    if (!listingId || !buyerId || !sellerId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        listingId,
        buyerId,
        sellerId,
        rating,
        comment,
        images,
        helpful: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      review: review?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reviews/listing/:listingId
 * Get reviews for a listing
 */
router.get('/listing/:listingId', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get reviews
    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('listingId', listingId)
      .order('createdAt', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    // Calculate average rating
    const { data: ratingData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('listingId', listingId);

    const avgRating = ratingData && ratingData.length > 0
      ? (ratingData.reduce((sum, r) => sum + r.rating, 0) / ratingData.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      reviews,
      total: count,
      averageRating: avgRating
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reviews/seller/:sellerId
 * Get reviews for a seller
 */
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    // Get reviews
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('sellerId', sellerId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    reviews?.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    // Calculate average rating
    const avgRating = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      reviews,
      averageRating: avgRating,
      total: reviews?.length || 0,
      ratingDistribution
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reviews/:id/helpful
 * Mark review as helpful
 */
router.post('/:id/helpful', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get current helpful count
    const { data: review, error: getError } = await supabase
      .from('reviews')
      .select('helpful')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Increment helpful count
    const { data: updated, error: updateError } = await supabase
      .from('reviews')
      .update({
        helpful: (review?.helpful || 0) + 1,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    res.json({
      success: true,
      review: updated?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/reviews/:id
 * Update a review
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;

    // Update review
    const { data: review, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment,
        images,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      review: review?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
