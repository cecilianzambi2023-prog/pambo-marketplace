/**
 * servicesCategoryService.ts
 * ==========================
 * 
 * Service layer for fetching service categories from the database.
 * All data is dynamic - categories are loaded at runtime, not hardcoded.
 * 
 * This service is optimized for:
 * - Kenya's slow 3G connection (efficient queries)
 * - Low-end Android phones (lightweight payload)
 * - High scalability (grows to 500+ categories)
 */

import { supabaseClient } from '../src/lib/supabaseClient';
import { ServiceCategory, CategoriesResponse, ServiceListingsResponse, ServiceFilters } from '../types/servicesCategoryTypes';

// ========================================================
// FETCH ALL CATEGORIES FOR SERVICES HUB
// ========================================================

/**
 * Get all service categories, ordered by sort_order.
 * Optimized: only fetches active categories, cached client-side.
 */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    console.log('🔍 Fetching service categories from database...');
    const { data, error } = await supabaseClient
      .from('service_categories')
      .select('id, name, slug, icon_name, image_url, created_at')
      .order('id');

    console.log('📊 Raw response:', { data, error });

    if (error) {
      console.error('❌ Supabase error fetching categories:', error);
      return [];
    }

    if (!data) {
      console.warn('⚠️ No data returned from Supabase');
      return [];
    }

    console.log(`📦 Total categories from DB: ${data.length}`);
    
    // Map database fields to ServiceCategory interface
    const servicesCategories = data.map((cat: any) => ({
      id: cat.id,
      hub: 'services',
      name: cat.name,
      slug: cat.slug,
      description: '',
      icon: cat.icon_name || '🔧',
      is_active: true,
      sort_order: 0,
      image_url: cat.image_url,
    }));

    console.log(`✅ Loaded ${servicesCategories.length} service categories`);
    
    return servicesCategories as ServiceCategory[];
  } catch (err) {
    console.error('❌ Exception fetching service categories:', err);
    return [];
  }
}

// ========================================================
// FETCH SINGLE CATEGORY BY SLUG
// ========================================================

/**
 * Get a single category by slug.
 * Used for /services/plumber URLs.
 */
export async function getServiceCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  try {
    const { data, error } = await supabaseClient
      .from('service_categories')
      .select('id, name, slug, icon_name, image_url, created_at')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Category not found: ${slug}`, error);
      return null;
    }

    return {
      id: data?.id,
      hub: 'services',
      name: data?.name,
      slug: data?.slug,
      description: '',
      icon: data?.icon_name || '🔧',
      is_active: true,
      sort_order: 0,
      image_url: data?.image_url,
    } as ServiceCategory | null;
  } catch (err) {
    console.error(`Failed to fetch category ${slug}:`, err);
    return null;
  }
}

// ========================================================
// FETCH SERVICE LISTINGS BY CATEGORY
// ========================================================

/**
 * Get all service listings for a specific category.
 *
 * Options:
 * - Filter by county (user's location)
 * - Filter by verification badge
 * - Sort by rating, newest, or price
 * - Pagination support
 *
 * Optimized for 3G: returns minimal payload with essential info.
 */
export async function getServicesByCategory(
  categorySlug: string,
  filters?: {
    county_id?: string;
    verification_badge?: string;
    page?: number;
    per_page?: number;
  }
): Promise<ServiceListingsResponse> {
  try {
    const page = filters?.page || 1;
    const per_page = filters?.per_page || 20; // Default 20 per page for slow connections
    const start = (page - 1) * per_page;

    // Step 1: Get category ID from slug
    const category = await getServiceCategoryBySlug(categorySlug);
    if (!category) {
      return {
        listings: [],
        total: 0,
        page,
        per_page,
      };
    }

    // Step 2: Query listings by category_id with optional filters
    let query = supabaseClient
      .from('listings')
      .select(
        `
        id, hub, category_id, seller_id, title, description,
        price_per_hour, price_fixed, phone, whatsapp, email,
        county_id, service_areas, verification_badge, rating, reviews_count,
        is_active, created_at, updated_at,
        categories:category_id(id, hub, name, slug, icon),
        profiles:seller_id(id, full_name, avatar_url)
        `,
        { count: 'exact' }
      )
      .eq('hub', 'services')
      .eq('category_id', category.id)
      .eq('is_active', true);

    // Apply optional filters
    if (filters?.county_id) {
      query = query.eq('county_id', filters.county_id);
    }

    if (filters?.verification_badge) {
      query = query.eq('verification_badge', filters.verification_badge);
    }

    // Order by rating (highest first), then newest
    query = query
      .order('rating', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Pagination
    const { data, error, count } = await query.range(start, start + per_page - 1);

    if (error) {
      console.error('Error fetching service listings:', error);
      return {
        listings: [],
        total: 0,
        page,
        per_page,
      };
    }

    return {
      listings: (data || []) as any[],
      total: count || 0,
      page,
      per_page,
    };
  } catch (err) {
    console.error(`Failed to fetch services for ${categorySlug}:`, err);
    return {
      listings: [],
      total: 0,
      page: filters?.page || 1,
      per_page: filters?.per_page || 20,
    };
  }
}

// ========================================================
// SEARCH SERVICES
// ========================================================

/**
 * Search across all service categories and listings.
 * Searches by:
 * - Category name
 * - Listing title
 * - Listing description
 */
export async function searchServices(
  query: string,
  filters?: {
    category_slug?: string;
    county_id?: string;
    page?: number;
    per_page?: number;
  }
): Promise<ServiceListingsResponse> {
  try {
    const page = filters?.page || 1;
    const per_page = filters?.per_page || 20;
    const start = (page - 1) * per_page;

    let dbQuery = supabaseClient
      .from('listings')
      .select(
        `
        id, hub, category_id, seller_id, title, description,
        price_per_hour, price_fixed, phone, whatsapp,
        county_id, verification_badge, rating, reviews_count,
        is_active, created_at,
        categories:category_id(id, name, slug, icon)
        `,
        { count: 'exact' }
      )
      .eq('hub', 'services')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`);

    // Optional: filter by specific category
    if (filters?.category_slug) {
      const category = await getServiceCategoryBySlug(filters.category_slug);
      if (category) {
        dbQuery = dbQuery.eq('category_id', category.id);
      }
    }

    // Optional: filter by county
    if (filters?.county_id) {
      dbQuery = dbQuery.eq('county_id', filters.county_id);
    }

    dbQuery = dbQuery.order('rating', { ascending: false }).range(start, start + per_page - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Search error:', error);
      return {
        listings: [],
        total: 0,
        page,
        per_page,
      };
    }

    return {
      listings: (data || []) as any[],
      total: count || 0,
      page,
      per_page,
    };
  } catch (err) {
    console.error('Search failed:', err);
    return {
      listings: [],
      total: 0,
      page: filters?.page || 1,
      per_page: filters?.per_page || 20,
    };
  }
}

// ========================================================
// GET FEATURED SERVICES
// ========================================================

/**
 * Get top-rated services (verification badge = platinum or gold).
 * Useful for homepage showcase.
 */
export async function getFeaturedServices(limit: number = 10): Promise<ServiceListingsResponse> {
  try {
    const { data, error, count } = await supabaseClient
      .from('listings')
      .select(
        `
        id, hub, category_id, title, phone, whatsapp,
        verification_badge, rating, reviews_count, created_at,
        categories:category_id(name, slug, icon)
        `,
        { count: 'exact' }
      )
      .eq('hub', 'services')
      .eq('is_active', true)
      .in('verification_badge', ['platinum', 'gold'])
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured services:', error);
      return {
        listings: [],
        total: 0,
        page: 1,
        per_page: limit,
      };
    }

    return {
      listings: (data || []) as any[],
      total: count || 0,
      page: 1,
      per_page: limit,
    };
  } catch (err) {
    console.error('Failed to fetch featured services:', err);
    return {
      listings: [],
      total: 0,
      page: 1,
      per_page: limit,
    };
  }
}

// ========================================================
// SERVICE STATISTICS
// ========================================================

/**
 * Get stats for a service category.
 */
export async function getCategoryStats(categorySlug: string): Promise<{
  total_providers: number;
  avg_rating: number;
  categories_with_badge: number;
} | null> {
  try {
    const category = await getServiceCategoryBySlug(categorySlug);
    if (!category) return null;

    const { data, error } = await supabaseClient
      .from('listings')
      .select('id, rating, verification_badge')
      .eq('hub', 'services')
      .eq('category_id', category.id)
      .eq('is_active', true);

    if (error || !data) return null;

    const avgRating = data.length > 0 
      ? (data.reduce((sum, l: any) => sum + (l.rating || 0), 0) / data.length).toFixed(2)
      : 0;

    const badgedCount = data.filter((l: any) => l.verification_badge).length;

    return {
      total_providers: data.length,
      avg_rating: parseFloat(avgRating as string),
      categories_with_badge: badgedCount,
    };
  } catch (err) {
    console.error('Failed to fetch category stats:', err);
    return null;
  }
}

// ========================================================
// CACHE STRATEGY (FOR 3G OPTIMIZATION)
// ========================================================

let categoriesCache: ServiceCategory[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

/**
 * Get categories with client-side caching.
 * Reduces API calls on devices with intermittent 3G.
 */
export async function getServiceCategoriesCached(): Promise<ServiceCategory[]> {
  const now = Date.now();

  // Return cached if fresh
  if (categoriesCache && now - cacheTimestamp < CACHE_TTL) {
    return categoriesCache;
  }

  // Fetch fresh
  const categories = await getServiceCategories();
  categoriesCache = categories;
  cacheTimestamp = now;
  return categories;
}

/**
 * Clear cache (call after adding new category in admin panel).
 */
export function clearCategoriesCache(): void {
  categoriesCache = null;
  cacheTimestamp = 0;
}
