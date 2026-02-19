import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { scaleMetrics } from '../lib/scaleMetrics';
import { eventQueue } from '../lib/eventQueue';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

router.get('/health', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    service: 'kenya-wholesale-hub',
    strategy: 'kenya-local-wholesale-v1',
    timestamp: new Date().toISOString(),
  });
});

router.get('/listings', async (req: Request, res: Response) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('bulk_offerings')
      .select('*', { count: 'exact' })
      .eq('hub', 'wholesale')
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .order('posted_date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) query = query.eq('category', String(category));
    if (search) {
      query = query.or(`title.ilike.%${String(search)}%,description.ilike.%${String(search)}%,seller_name.ilike.%${String(search)}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      listings: data || [],
      total: count || 0,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch Kenya wholesale listings' });
  }
});

router.post('/listings', async (req: Request, res: Response) => {
  try {
    const {
      sellerId,
      title,
      description,
      category,
      quantity,
      unit,
      pricePerUnit,
      minOrderQuantity,
      sellerName,
      sellerPhone,
      sellerEmail,
      photos,
      videos,
    } = req.body;

    if (!sellerId || !title || !category || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        error: 'sellerId, title, category, quantity and pricePerUnit are required',
      });
    }

    const safePhotos = Array.isArray(photos) ? photos.slice(0, 10) : [];
    const safeVideos = Array.isArray(videos) ? videos.slice(0, 2) : [];

    const { data, error } = await supabase
      .from('bulk_offerings')
      .insert({
        seller_id: sellerId,
        seller_name: sellerName || 'Seller',
        seller_phone: sellerPhone || null,
        seller_email: sellerEmail || null,
        title,
        description: description || '',
        category,
        quantity_available: quantity,
        unit: unit || 'units',
        price_per_unit: pricePerUnit,
        min_order_quantity: minOrderQuantity || 1,
        total_value: Number(quantity) * Number(pricePerUnit),
        hub: 'wholesale',
        status: 'active',
        photos: safePhotos,
        videos: safeVideos,
        moderation_status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;

    eventQueue.emit('KENYA_WHOLESALE_LISTING_CREATED', 'api.kenyaWholesale.listings.create', {
      listingId: data.id,
      sellerId,
      category,
    });

    return res.status(201).json({ success: true, listing: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create listing' });
  }
});

router.get('/sellers/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    const { data: profile, error: profileError } = await supabase
      .from('bulk_seller_profiles')
      .select('*')
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data: listings, error: listingsError } = await supabase
      .from('bulk_offerings')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('hub', 'wholesale')
      .order('posted_date', { ascending: false });

    if (listingsError) throw listingsError;

    const { count: followersCount, error: followersError } = await supabase
      .from('bulk_seller_followers')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', sellerId);

    if (followersError) throw followersError;

    return res.json({
      success: true,
      seller: {
        ...profile,
        seller_id: sellerId,
        followers_count: followersCount || 0,
        products: listings || [],
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch seller page' });
  }
});

router.post('/sellers/profile', async (req: Request, res: Response) => {
  try {
    const {
      sellerId,
      sellerName,
      contactPhone,
      whatsappNumber,
      businessLocation,
    } = req.body;

    if (!sellerId || !sellerName) {
      return res.status(400).json({ success: false, error: 'sellerId and sellerName are required' });
    }

    const { data, error } = await supabase
      .from('bulk_seller_profiles')
      .upsert(
        {
          seller_id: sellerId,
          seller_name: sellerName,
          contact_phone: contactPhone || null,
          whatsapp_number: whatsappNumber || null,
          business_location: businessLocation || null,
          approval_status: 'pending',
        },
        { onConflict: 'seller_id' }
      )
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, sellerProfile: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to save seller profile' });
  }
});

router.post('/listings/:listingId/view', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { data: listing, error: fetchError } = await supabase
      .from('bulk_offerings')
      .select('views_count')
      .eq('id', listingId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const { data, error } = await supabase
      .from('bulk_offerings')
      .update({ views_count: (listing.views_count || 0) + 1 })
      .eq('id', listingId)
      .select('id, views_count')
      .single();

    if (error) throw error;

    return res.json({ success: true, listing: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to increment views' });
  }
});

router.get('/listings/:listingId/comments', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const includeAll = String(req.query.includeAll || '').toLowerCase() === 'true';

    let query = supabase
      .from('bulk_offering_comments')
      .select('*')
      .eq('offering_id', listingId)
      .order('created_at', { ascending: false });

    if (!includeAll) {
      query = query.eq('moderation_status', 'approved');
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json({ success: true, comments: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch comments' });
  }
});

router.post('/listings/:listingId/comments', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { commenterUserId, comment } = req.body;

    if (!commenterUserId || !comment) {
      return res.status(400).json({ success: false, error: 'commenterUserId and comment are required' });
    }

    const { data, error } = await supabase
      .from('bulk_offering_comments')
      .insert({
        offering_id: listingId,
        commenter_user_id: commenterUserId,
        comment,
        moderation_status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;

    eventQueue.emit('KENYA_WHOLESALE_COMMENT_CREATED', 'api.kenyaWholesale.comments.create', {
      listingId,
      commenterUserId,
      commentId: data.id,
    });

    return res.status(201).json({ success: true, comment: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create comment' });
  }
});

router.post('/sellers/:sellerId/follow', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const { followerUserId } = req.body;

    if (!followerUserId) {
      return res.status(400).json({ success: false, error: 'followerUserId is required' });
    }

    const { data, error } = await supabase
      .from('bulk_seller_followers')
      .upsert(
        {
          seller_id: sellerId,
          follower_user_id: followerUserId,
        },
        { onConflict: 'seller_id,follower_user_id' }
      )
      .select('*')
      .single();

    if (error) throw error;

    scaleMetrics.increment('kenyaWholesale.follow.create');

    return res.status(201).json({ success: true, follow: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to follow seller' });
  }
});

router.delete('/sellers/:sellerId/follow/:followerUserId', async (req: Request, res: Response) => {
  try {
    const { sellerId, followerUserId } = req.params;

    const { error } = await supabase
      .from('bulk_seller_followers')
      .delete()
      .eq('seller_id', sellerId)
      .eq('follower_user_id', followerUserId);

    if (error) throw error;

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to unfollow seller' });
  }
});

router.get('/sellers/:sellerId/followers/count', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    const { count, error } = await supabase
      .from('bulk_seller_followers')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', sellerId);

    if (error) throw error;

    return res.json({ success: true, count: count || 0 });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch followers count' });
  }
});

router.get('/sellers/:sellerId/followers/:userId/status', async (req: Request, res: Response) => {
  try {
    const { sellerId, userId } = req.params;

    const { data, error } = await supabase
      .from('bulk_seller_followers')
      .select('id')
      .eq('seller_id', sellerId)
      .eq('follower_user_id', userId)
      .maybeSingle();

    if (error) throw error;

    return res.json({
      success: true,
      isFollowing: Boolean(data),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to get follow status' });
  }
});

router.patch('/admin/sellers/:sellerId/status', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'approved', 'suspended', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('bulk_seller_profiles')
      .update({ approval_status: status, approval_notes: notes || null })
      .eq('seller_id', sellerId)
      .select('*')
      .single();

    if (error) throw error;

    eventQueue.emit('KENYA_WHOLESALE_SELLER_STATUS_UPDATED', 'api.kenyaWholesale.admin.sellerStatus', {
      sellerId,
      status,
    });

    return res.json({ success: true, sellerProfile: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update seller status' });
  }
});

router.patch('/admin/listings/:listingId/moderation', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { moderationStatus, moderationNotes } = req.body;

    if (!moderationStatus || !['pending', 'approved', 'rejected', 'suspended'].includes(moderationStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid moderationStatus' });
    }

    const { data, error } = await supabase
      .from('bulk_offerings')
      .update({ moderation_status: moderationStatus, moderation_notes: moderationNotes || null })
      .eq('id', listingId)
      .select('*')
      .single();

    if (error) throw error;

    return res.json({ success: true, listing: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to moderate listing' });
  }
});

router.patch('/admin/comments/:commentId/moderation', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { moderationStatus, moderationNotes } = req.body;

    if (!moderationStatus || !['pending', 'approved', 'rejected', 'suspended'].includes(moderationStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid moderationStatus' });
    }

    const { data, error } = await supabase
      .from('bulk_offering_comments')
      .update({ moderation_status: moderationStatus, moderation_notes: moderationNotes || null })
      .eq('id', commentId)
      .select('*')
      .single();

    if (error) throw error;

    return res.json({ success: true, comment: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to moderate comment' });
  }
});

export default router;
