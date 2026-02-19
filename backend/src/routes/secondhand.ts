import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { scaleMetrics } from '../lib/scaleMetrics';
import { eventQueue } from '../lib/eventQueue';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const slugify = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

router.get('/health', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    service: 'secondhand-hub',
    strategy: 'kenya-secondhand-v1',
    timestamp: new Date().toISOString(),
  });
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('secondhand_categories')
      .select('*')
      .eq('is_active', true)
      .order('group_name', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return res.json({ success: true, categories: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch categories' });
  }
});

router.get('/listings', async (req: Request, res: Response) => {
  try {
    const { category, search, condition, county, city, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('secondhand_listings')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) query = query.eq('category', String(category));
    if (condition) query = query.eq('condition', String(condition));
    if (county) query = query.eq('county', String(county));
    if (city) query = query.eq('city', String(city));
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
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch listings' });
  }
});

router.post('/listings', async (req: Request, res: Response) => {
  try {
    const {
      sellerId,
      sellerName,
      sellerPhone,
      sellerWhatsapp,
      sellerEmail,
      title,
      description,
      price,
      condition,
      category,
      county,
      city,
      photos,
      videos,
    } = req.body;

    if (!sellerId || !title || price === undefined || price === null || !condition) {
      return res.status(400).json({
        success: false,
        error: 'sellerId, title, price, and condition are required',
      });
    }

    const safePhotos = Array.isArray(photos) ? photos.slice(0, 10) : [];
    const safeVideos = Array.isArray(videos) ? videos.slice(0, 2) : [];

    const { data, error } = await supabase
      .from('secondhand_listings')
      .insert({
        seller_id: sellerId,
        seller_name: sellerName || 'Seller',
        seller_phone: sellerPhone || null,
        seller_whatsapp: sellerWhatsapp || null,
        seller_email: sellerEmail || null,
        title,
        description: description || '',
        price,
        condition,
        category: category || null,
        county: county || null,
        city: city || null,
        photos: safePhotos,
        videos: safeVideos,
        status: 'active',
        moderation_status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;

    eventQueue.emit('SECONDHAND_LISTING_CREATED', 'api.secondhand.listings.create', {
      listingId: data.id,
      sellerId,
      category,
    });

    return res.status(201).json({ success: true, listing: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create listing' });
  }
});

router.post('/sellers/profile', async (req: Request, res: Response) => {
  try {
    const { sellerId, sellerName, contactPhone, whatsappNumber, email, county, city } = req.body;

    if (!sellerId || !sellerName) {
      return res.status(400).json({ success: false, error: 'sellerId and sellerName are required' });
    }

    const { data, error } = await supabase
      .from('secondhand_seller_profiles')
      .upsert(
        {
          seller_id: sellerId,
          seller_name: sellerName,
          contact_phone: contactPhone || null,
          whatsapp_number: whatsappNumber || null,
          email: email || null,
          county: county || null,
          city: city || null,
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

router.get('/sellers/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    const { data: profile, error: profileError } = await supabase
      .from('secondhand_seller_profiles')
      .select('*')
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data: listings, error: listingsError } = await supabase
      .from('secondhand_listings')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (listingsError) throw listingsError;

    const totalViews = (listings || []).reduce((sum, item) => sum + (item.views_count || 0), 0);

    return res.json({
      success: true,
      seller: {
        ...profile,
        seller_id: sellerId,
        total_views: totalViews,
        listings: listings || [],
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch seller page' });
  }
});

router.post('/listings/:listingId/view', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { data: listing, error: fetchError } = await supabase
      .from('secondhand_listings')
      .select('views_count')
      .eq('id', listingId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const { data, error } = await supabase
      .from('secondhand_listings')
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
      .from('secondhand_listing_comments')
      .select('*')
      .eq('listing_id', listingId)
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
      .from('secondhand_listing_comments')
      .insert({
        listing_id: listingId,
        commenter_user_id: commenterUserId,
        comment,
        moderation_status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;

    eventQueue.emit('SECONDHAND_COMMENT_CREATED', 'api.secondhand.comments.create', {
      listingId,
      commenterUserId,
      commentId: data.id,
    });

    return res.status(201).json({ success: true, comment: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create comment' });
  }
});

router.post('/listings/:listingId/favorites', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const { data, error } = await supabase
      .from('secondhand_listing_favorites')
      .upsert(
        {
          listing_id: listingId,
          user_id: userId,
        },
        { onConflict: 'listing_id,user_id' }
      )
      .select('*')
      .single();

    if (error) throw error;

    scaleMetrics.increment('secondhand.favorites.add');

    return res.status(201).json({ success: true, favorite: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to favorite listing' });
  }
});

router.delete('/listings/:listingId/favorites/:userId', async (req: Request, res: Response) => {
  try {
    const { listingId, userId } = req.params;

    const { error } = await supabase
      .from('secondhand_listing_favorites')
      .delete()
      .eq('listing_id', listingId)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to remove favorite' });
  }
});

router.get('/listings/:listingId/favorites/:userId/status', async (req: Request, res: Response) => {
  try {
    const { listingId, userId } = req.params;

    const { data, error } = await supabase
      .from('secondhand_listing_favorites')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    return res.json({ success: true, isFavorite: Boolean(data) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to get favorite status' });
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
      .from('secondhand_seller_profiles')
      .update({ approval_status: status, approval_notes: notes || null })
      .eq('seller_id', sellerId)
      .select('*')
      .single();

    if (error) throw error;

    eventQueue.emit('SECONDHAND_SELLER_STATUS_UPDATED', 'api.secondhand.admin.sellerStatus', {
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
      .from('secondhand_listings')
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
      .from('secondhand_listing_comments')
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

router.post('/admin/categories', async (req: Request, res: Response) => {
  try {
    const { name, slug, groupName, sortOrder = 0, isActive = true } = req.body;

    if (!name || !groupName) {
      return res.status(400).json({ success: false, error: 'name and groupName are required' });
    }

    const derivedSlug = slugify(slug || name);
    if (!derivedSlug) {
      return res.status(400).json({ success: false, error: 'Invalid slug' });
    }

    const { data, error } = await supabase
      .from('secondhand_categories')
      .insert({
        name,
        slug: derivedSlug,
        group_name: groupName,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, category: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create category' });
  }
});

router.patch('/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, groupName, sortOrder, isActive } = req.body;

    const payload: Record<string, any> = {};
    if (name !== undefined) payload.name = name;
    if (groupName !== undefined) payload.group_name = groupName;
    if (sortOrder !== undefined) payload.sort_order = sortOrder;
    if (isActive !== undefined) payload.is_active = isActive;
    if (slug !== undefined || name !== undefined) {
      const derivedSlug = slugify(slug || name || '');
      if (!derivedSlug) {
        return res.status(400).json({ success: false, error: 'Invalid slug' });
      }
      payload.slug = derivedSlug;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ success: false, error: 'No update fields supplied' });
    }

    const { data, error } = await supabase
      .from('secondhand_categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return res.json({ success: true, category: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update category' });
  }
});

router.delete('/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('secondhand_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete category' });
  }
});

export default router;
