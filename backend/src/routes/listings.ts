import express, { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * POST /api/listings
 * Create a new listing
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      images,
      category,
      sellerId,
      hub,
      location,
      condition,
      tags
    } = req.body;

    if (!title || !price || !sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, price, sellerId'
      });
    }

    // Create listing
    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        price,
        images,
        category,
        sellerId,
        hub: hub || 'marketplace',
        location,
        condition,
        tags,
        status: 'active',
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      listing: listing?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/listings/:id
 * Get a single listing by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get listing
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    res.json({
      success: true,
      listing
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/listings/hub/:hub
 * Get listings by hub
 */
router.get('/hub/:hub', async (req: Request, res: Response) => {
  try {
    const { hub } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get listings
    const { data: listings, error, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('hub', hub)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      listings,
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/listings/seller/:sellerId
 * Get listings by seller
 */
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    // Get listings
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .eq('sellerId', sellerId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      listings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/listings/:id
 * Update a listing
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update listing
    const { data: listing, error } = await supabase
      .from('listings')
      .update({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      listing: listing?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/listings/:id
 * Delete a listing
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete listing
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Listing deleted'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/listings/search/query
 * Search listings
 */
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { hub, limit = 20 } = req.query;

    let q = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (hub) {
      q = q.eq('hub', hub as string);
    }

    const { data: listings, error } = await q
      .limit(Number(limit));

    if (error) throw error;

    res.json({
      success: true,
      listings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
