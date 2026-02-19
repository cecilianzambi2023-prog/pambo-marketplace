import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { rankListingsForKenya } from '../services/matchmakingService';
import { eventQueue } from '../lib/eventQueue';
import { scaleMetrics } from '../lib/scaleMetrics';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'matchmaking',
    strategy: 'kenya-1m-scale-v1',
    timestamp: new Date().toISOString(),
  });
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.query || '').trim();
    const hub = String(req.query.hub || 'marketplace');
    const county = req.query.county ? String(req.query.county) : undefined;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);

    const targetWindowEnd = offset + Math.max(limit * 3, 30) - 1;

    const runListingsQuery = async (options: { applyCounty: boolean; orderColumn?: 'createdAt' | 'created_at' }) => {
      let listingQuery = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('hub', hub)
        .range(offset, targetWindowEnd);

      if (options.orderColumn) {
        listingQuery = listingQuery.order(options.orderColumn, { ascending: false });
      }

      if (query) {
        listingQuery = listingQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
      }

      if (options.applyCounty && county) {
        listingQuery = listingQuery.eq('county', county);
      }

      return listingQuery;
    };

    const queryVariants: Array<{ applyCounty: boolean; orderColumn?: 'createdAt' | 'created_at' }> = [
      { applyCounty: true, orderColumn: 'createdAt' },
      { applyCounty: false, orderColumn: 'createdAt' },
      { applyCounty: true, orderColumn: 'created_at' },
      { applyCounty: false, orderColumn: 'created_at' },
      { applyCounty: true },
      { applyCounty: false },
    ];

    let listings: any[] | null = null;
    let listingError: any = null;

    for (const variant of queryVariants) {
      const { data, error } = await runListingsQuery(variant);
      if (!error) {
        listings = data || [];
        listingError = null;
        break;
      }

      listingError = error;
      const errorText = String(error?.message || '').toLowerCase();
      const isColumnError = errorText.includes('column') && errorText.includes('does not exist');

      if (!isColumnError) {
        break;
      }
    }

    if (listingError) throw listingError;

    const sellerIds = Array.from(new Set((listings || []).map((item: any) => item.sellerId).filter(Boolean)));

    let sellers: any[] = [];
    if (sellerIds.length > 0) {
      const { data: sellerData, error: sellerError } = await supabase
        .from('users')
        .select('id, verified, accountStatus, joinDate')
        .in('id', sellerIds);

      if (sellerError) throw sellerError;
      sellers = sellerData || [];
    }

    const ranked = rankListingsForKenya(listings || [], sellers, { query, county }).slice(0, limit);

    scaleMetrics.increment('matchmaking.search.requests', { hub });
    eventQueue.emit('MATCHMAKING_SEARCH', 'api.matchmaking.search', {
      query,
      hub,
      county,
      limit,
      offset,
      resultCount: ranked.length,
    });

    return res.json({
      success: true,
      strategy: 'kenya-1m-scale-v1',
      hub,
      county,
      query,
      total: ranked.length,
      listings: ranked,
    });
  } catch (error: any) {
    scaleMetrics.increment('matchmaking.search.errors');
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to rank listings',
    });
  }
});

export default router;
