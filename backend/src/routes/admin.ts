import express, { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Get total users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Get total listings
    const { count: listingCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact' });

    // Get total orders
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // Get total revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(10);

    // Get top sellers
    const { data: topSellers } = await supabase
      .from('orders')
      .select('sellerId')
      .order('createdAt', { ascending: false })
      .limit(100);

    const sellerCounts: { [key: string]: number } = {};
    topSellers?.forEach(order => {
      sellerCounts[order.sellerId] = (sellerCounts[order.sellerId] || 0) + 1;
    });

    const topSellersList = Object.entries(sellerCounts)
      .map(([sellerId, count]) => ({ sellerId, orderCount: count }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    res.json({
      success: true,
      dashboard: {
        totalUsers: userCount || 0,
        totalListings: listingCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue,
        recentOrders,
        topSellers: topSellersList
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, search } = req.query;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%,firstName.ilike.%${search}%,lastName.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      users,
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
 * PATCH /api/admin/users/:userId/ban
 * Ban a user
 */
router.patch('/users/:userId/ban', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Update user status
    const { data: user, error } = await supabase
      .from('users')
      .update({
        status: 'banned',
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;

    // Log admin action
    await supabase
      .from('adminLogs')
      .insert({
        action: 'user_banned',
        userId,
        reason,
        timestamp: new Date().toISOString()
      });

    res.json({
      success: true,
      user: user?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/admin/users/:userId/unban
 * Unban a user
 */
router.patch('/users/:userId/unban', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Update user status
    const { data: user, error } = await supabase
      .from('users')
      .update({
        status: 'active',
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;

    // Log admin action
    await supabase
      .from('adminLogs')
      .insert({
        action: 'user_unbanned',
        userId,
        timestamp: new Date().toISOString()
      });

    res.json({
      success: true,
      user: user?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/admin/listings/:listingId/remove
 * Remove a listing
 */
router.patch('/listings/:listingId/remove', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { reason } = req.body;

    // Update listing status
    const { data: listing, error } = await supabase
      .from('listings')
      .update({
        status: 'removed',
        updatedAt: new Date().toISOString()
      })
      .eq('id', listingId)
      .select();

    if (error) throw error;

    // Log admin action
    await supabase
      .from('adminLogs')
      .insert({
        action: 'listing_removed',
        listingId,
        reason,
        timestamp: new Date().toISOString()
      });

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
 * GET /api/admin/activity-logs
 * Get admin activity logs
 */
router.get('/activity-logs', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Get logs
    const { data: logs, error } = await supabase
      .from('adminLogs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      logs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/reports
 * Get reported content
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;

    let query = supabase
      .from('tickets')
      .select('*')
      .order('createdAt', { ascending: false });

    if (status) {
      query = query.eq('status', status as string);
    }

    const { data: reports, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      reports
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
