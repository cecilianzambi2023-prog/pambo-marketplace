import express, { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/auth/verify-token
 * Verify JWT token and return user info
 */
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Verify token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userId: user.id
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
 * POST /api/auth/get-user
 * Get authenticated user info
 */
router.post('/get-user', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/update-profile
 * Update user profile
 */
router.post('/update-profile', async (req: Request, res: Response) => {
  try {
    const { userId, firstName, lastName, bio, avatar, phone } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Update user profile
    const { data: user, error } = await supabase
      .from('users')
      .update({
        firstName,
        lastName,
        bio,
        avatar,
        phone,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;

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
 * POST /api/auth/seller-profile
 * Get seller profile
 */
router.post('/seller-profile', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Get seller profile
    const { data: profile, error } = await supabase
      .from('farmerProfiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Seller profile not found'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
