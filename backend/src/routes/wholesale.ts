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
    service: 'wholesale',
    strategy: 'global-wholesale-mvp-v1',
    timestamp: new Date().toISOString(),
  });
});

router.post('/suppliers/apply', async (req: Request, res: Response) => {
  try {
    const { userId, businessName, countryCode } = req.body;

    if (!userId || !businessName || !countryCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, businessName, countryCode',
      });
    }

    const { data, error } = await supabase
      .from('wholesale_suppliers')
      .upsert(
        {
          user_id: userId,
          business_name: businessName,
          country_code: countryCode,
          verification_status: 'pending_review',
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error) throw error;

    scaleMetrics.increment('wholesale.supplier.apply');
    eventQueue.emit('WHOLESALE_SUPPLIER_APPLY', 'api.wholesale.suppliers.apply', {
      userId,
      countryCode,
      supplierId: data.id,
    });

    return res.status(201).json({ success: true, supplier: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to apply as supplier' });
  }
});

router.get('/suppliers/me/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('wholesale_suppliers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    return res.json({ success: true, supplier: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to load supplier profile' });
  }
});

router.post('/listings', async (req: Request, res: Response) => {
  try {
    const {
      supplierId,
      title,
      category,
      description,
      countryOfOrigin,
      moq,
      unit,
      priceTiers,
      leadTimeDaysMin,
      leadTimeDaysMax,
      incoterm,
      portOfLoading,
    } = req.body;

    if (!supplierId || !title || !countryOfOrigin || !moq) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supplierId, title, countryOfOrigin, moq',
      });
    }

    const { data, error } = await supabase
      .from('wholesale_listings')
      .insert({
        supplier_id: supplierId,
        title,
        category,
        description,
        country_of_origin: countryOfOrigin,
        moq,
        unit: unit || 'pcs',
        price_tiers: priceTiers || [],
        lead_time_days_min: leadTimeDaysMin,
        lead_time_days_max: leadTimeDaysMax,
        incoterm,
        port_of_loading: portOfLoading,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) throw error;

    scaleMetrics.increment('wholesale.listing.create');
    eventQueue.emit('WHOLESALE_LISTING_CREATED', 'api.wholesale.listings.create', {
      supplierId,
      listingId: data.id,
      category,
      countryOfOrigin,
    });

    return res.status(201).json({ success: true, listing: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create wholesale listing' });
  }
});

router.patch('/listings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateMap: Record<string, string> = {
      title: 'title',
      category: 'category',
      description: 'description',
      countryOfOrigin: 'country_of_origin',
      moq: 'moq',
      unit: 'unit',
      priceTiers: 'price_tiers',
      leadTimeDaysMin: 'lead_time_days_min',
      leadTimeDaysMax: 'lead_time_days_max',
      incoterm: 'incoterm',
      portOfLoading: 'port_of_loading',
      status: 'status',
    };

    const payload: Record<string, any> = {};
    Object.entries(updateMap).forEach(([clientField, dbField]) => {
      if (req.body[clientField] !== undefined) {
        payload[dbField] = req.body[clientField];
      }
    });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ success: false, error: 'No update fields supplied' });
    }

    const { data, error } = await supabase
      .from('wholesale_listings')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return res.json({ success: true, listing: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update wholesale listing' });
  }
});

router.get('/listings', async (req: Request, res: Response) => {
  try {
    const { country, category, minMoq, maxMoq, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('wholesale_listings')
      .select('*, wholesale_suppliers(id, business_name, country_code, verification_status)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (country) query = query.eq('country_of_origin', String(country));
    if (category) query = query.eq('category', String(category));
    if (minMoq) query = query.gte('moq', Number(minMoq));
    if (maxMoq) query = query.lte('moq', Number(maxMoq));

    const { data, error, count } = await query;
    if (error) throw error;

    scaleMetrics.increment('wholesale.listings.search');

    return res.json({
      success: true,
      total: count || 0,
      limit: Number(limit),
      offset: Number(offset),
      listings: data || [],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch wholesale listings' });
  }
});

router.post('/rfqs', async (req: Request, res: Response) => {
  try {
    const {
      buyerId,
      listingId,
      quantity,
      targetPrice,
      destinationCountry,
      destinationCity,
      requirements,
    } = req.body;

    if (!buyerId || !quantity || !destinationCountry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: buyerId, quantity, destinationCountry',
      });
    }

    const { data, error } = await supabase
      .from('wholesale_rfqs')
      .insert({
        buyer_id: buyerId,
        listing_id: listingId || null,
        quantity,
        target_price: targetPrice || null,
        destination_country: destinationCountry,
        destination_city: destinationCity || null,
        requirements: requirements || null,
        status: 'open',
      })
      .select('*')
      .single();

    if (error) throw error;

    scaleMetrics.increment('wholesale.rfq.create');
    eventQueue.emit('WHOLESALE_RFQ_CREATED', 'api.wholesale.rfq.create', {
      rfqId: data.id,
      buyerId,
      listingId,
      destinationCountry,
    });

    return res.status(201).json({ success: true, rfq: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create RFQ' });
  }
});

router.post('/rfqs/:rfqId/quotes', async (req: Request, res: Response) => {
  try {
    const { rfqId } = req.params;
    const { supplierId, quotedQuantity, unitPrice, currency, incoterm, leadTimeDays, validUntil, termsJson } = req.body;

    if (!supplierId || !quotedQuantity || !unitPrice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supplierId, quotedQuantity, unitPrice',
      });
    }

    const { data, error } = await supabase
      .from('wholesale_quotes')
      .insert({
        rfq_id: rfqId,
        supplier_id: supplierId,
        quoted_quantity: quotedQuantity,
        unit_price: unitPrice,
        currency: currency || 'USD',
        incoterm: incoterm || null,
        lead_time_days: leadTimeDays || null,
        valid_until: validUntil || null,
        terms_json: termsJson || {},
        status: 'sent',
      })
      .select('*')
      .single();

    if (error) throw error;

    await supabase.from('wholesale_rfqs').update({ status: 'negotiating' }).eq('id', rfqId);

    scaleMetrics.increment('wholesale.quote.create');

    return res.status(201).json({ success: true, quote: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create quote' });
  }
});

router.post('/rfqs/:rfqId/quotes/:quoteId/accept', async (req: Request, res: Response) => {
  try {
    const { rfqId, quoteId } = req.params;
    const { buyerId, totalAmount, depositAmount, currency } = req.body;

    if (!buyerId || totalAmount === undefined || depositAmount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: buyerId, totalAmount, depositAmount',
      });
    }

    const { data: quote, error: quoteError } = await supabase
      .from('wholesale_quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('rfq_id', rfqId)
      .single();

    if (quoteError) throw quoteError;

    const balanceAmount = Number(totalAmount) - Number(depositAmount);

    const { data: order, error: orderError } = await supabase
      .from('wholesale_orders')
      .insert({
        buyer_id: buyerId,
        supplier_id: quote.supplier_id,
        quote_id: quoteId,
        order_status: 'pending_deposit',
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        balance_amount: balanceAmount,
        currency: currency || quote.currency || 'USD',
      })
      .select('*')
      .single();

    if (orderError) throw orderError;

    await supabase.from('wholesale_quotes').update({ status: 'accepted' }).eq('id', quoteId);
    await supabase.from('wholesale_rfqs').update({ status: 'converted' }).eq('id', rfqId);

    scaleMetrics.increment('wholesale.order.create');

    return res.status(201).json({
      success: true,
      order,
      nextAction: 'pay_deposit',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to convert quote to order' });
  }
});

router.post('/orders/:id/pay-deposit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, provider, providerRef } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required field: amount' });
    }

    const { data: order, error: orderError } = await supabase
      .from('wholesale_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) throw orderError;

    const { data: payment, error: paymentError } = await supabase
      .from('wholesale_payments')
      .insert({
        order_id: id,
        payment_stage: 'deposit',
        amount,
        currency: order.currency || 'USD',
        provider: provider || null,
        provider_ref: providerRef || null,
        payment_status: 'paid',
        received_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (paymentError) throw paymentError;

    await supabase
      .from('wholesale_orders')
      .update({ order_status: 'in_production' })
      .eq('id', id);

    scaleMetrics.increment('wholesale.payment.deposit');

    return res.json({
      success: true,
      payment,
      orderStatus: 'in_production',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to record deposit payment' });
  }
});

router.post('/orders/:id/disputes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { openedByUserId, reasonCode, description } = req.body;

    if (!openedByUserId) {
      return res.status(400).json({ success: false, error: 'Missing required field: openedByUserId' });
    }

    const { data, error } = await supabase
      .from('wholesale_disputes')
      .insert({
        order_id: id,
        opened_by_user_id: openedByUserId,
        reason_code: reasonCode || null,
        description: description || null,
        status: 'opened',
      })
      .select('*')
      .single();

    if (error) throw error;

    await supabase
      .from('wholesale_orders')
      .update({ order_status: 'disputed' })
      .eq('id', id);

    scaleMetrics.increment('wholesale.dispute.opened');

    return res.status(201).json({ success: true, dispute: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create dispute' });
  }
});

router.get('/listings/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('wholesale_listing_reviews')
      .select('*')
      .eq('listing_id', id)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, reviews: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to load reviews' });
  }
});

router.post('/listings/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewerUserId, rating, comment } = req.body;

    if (!reviewerUserId || !rating) {
      return res.status(400).json({ success: false, error: 'Missing required fields: reviewerUserId, rating' });
    }

    const { data, error } = await supabase
      .from('wholesale_listing_reviews')
      .insert({
        listing_id: id,
        reviewer_user_id: reviewerUserId,
        rating,
        comment: comment || null,
        moderation_status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;

    scaleMetrics.increment('wholesale.reviews.create');
    return res.status(201).json({ success: true, review: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create review' });
  }
});

router.get('/listings/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('wholesale_listing_comments')
      .select('*')
      .eq('listing_id', id)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, comments: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to load comments' });
  }
});

router.post('/listings/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { commenterUserId, content } = req.body;

    if (!commenterUserId || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields: commenterUserId, content' });
    }

    const { data, error } = await supabase
      .from('wholesale_listing_comments')
      .insert({
        listing_id: id,
        commenter_user_id: commenterUserId,
        content,
        moderation_status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;

    scaleMetrics.increment('wholesale.comments.create');
    return res.status(201).json({ success: true, comment: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create comment' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('wholesale_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return res.json({ success: true, categories: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch categories' });
  }
});

router.patch('/admin/suppliers/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verificationStatus, verificationNotes } = req.body;
    if (!verificationStatus) {
      return res.status(400).json({ success: false, error: 'Missing required field: verificationStatus' });
    }

    const { data, error } = await supabase
      .from('wholesale_suppliers')
      .update({
        verification_status: verificationStatus,
        verification_notes: verificationNotes || null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ success: true, supplier: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to moderate supplier' });
  }
});

router.patch('/admin/listings/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Missing required field: status' });
    }

    const { data, error } = await supabase
      .from('wholesale_listings')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ success: true, listing: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to moderate listing' });
  }
});

router.patch('/admin/reviews/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { moderationStatus, moderationNotes } = req.body;
    if (!moderationStatus) {
      return res.status(400).json({ success: false, error: 'Missing required field: moderationStatus' });
    }

    const { data, error } = await supabase
      .from('wholesale_listing_reviews')
      .update({
        moderation_status: moderationStatus,
        moderation_notes: moderationNotes || null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ success: true, review: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to moderate review' });
  }
});

router.patch('/admin/comments/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { moderationStatus, moderationNotes } = req.body;
    if (!moderationStatus) {
      return res.status(400).json({ success: false, error: 'Missing required field: moderationStatus' });
    }

    const { data, error } = await supabase
      .from('wholesale_listing_comments')
      .update({
        moderation_status: moderationStatus,
        moderation_notes: moderationNotes || null,
      })
      .eq('id', id)
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
    const { name, slug, isActive = true } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, slug' });
    }

    const { data, error } = await supabase
      .from('wholesale_categories')
      .insert({ name, slug, is_active: isActive })
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
    const { name, slug, isActive } = req.body;
    const payload: Record<string, any> = {};
    if (name !== undefined) payload.name = name;
    if (slug !== undefined) payload.slug = slug;
    if (isActive !== undefined) payload.is_active = isActive;

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ success: false, error: 'No update fields supplied' });
    }

    const { data, error } = await supabase
      .from('wholesale_categories')
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

export default router;
