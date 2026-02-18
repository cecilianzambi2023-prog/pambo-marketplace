import { supabase } from '../src/lib/supabaseClient';
import { PamboListing, PamboHub, ListingStatus } from '../types';

/**
 * Create a new listing across all hubs
 */
export const createListing = async (listing: Omit<PamboListing, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listing,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return { success: true, listing: data?.[0] };
  } catch (error) {
    console.error('Create listing error:', error);
    return { success: false, error };
  }
};

/**
 * Get all listings by hub type
 */
export const getListingsByHub = async (hub: PamboHub, limit = 20, offset = 0) => {
  try {
    const { data, error, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('hub', hub)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, listings: data || [], total: count || 0 };
  } catch (error) {
    console.error('Get listings by hub error:', error);
    return { success: false, error };
  }
};

/**
 * Get listings by seller ID
 */
export const getSellerListings = async (sellerId: string, status?: ListingStatus) => {
  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('sellerId', sellerId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return { success: true, listings: data || [] };
  } catch (error) {
    console.error('Get seller listings error:', error);
    return { success: false, error };
  }
};

/**
 * Get single listing by ID
 */
export const getListing = async (listingId: string) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (error) throw error;

    // Increment view count
    await supabase
      .from('listings')
      .update({ viewCount: (data?.viewCount || 0) + 1 })
      .eq('id', listingId);

    return { success: true, listing: data };
  } catch (error) {
    console.error('Get listing error:', error);
    return { success: false, error };
  }
};

/**
 * Update listing
 */
export const updateListing = async (listingId: string, updates: Partial<PamboListing>) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select();

    if (error) throw error;

    return { success: true, listing: data?.[0] };
  } catch (error) {
    console.error('Update listing error:', error);
    return { success: false, error };
  }
};

/**
 * Delete listing
 */
export const deleteListing = async (listingId: string) => {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete listing error:', error);
    return { success: false, error };
  }
};

/**
 * Search listings with filters
 */
export const searchListings = async (
  searchTerm: string,
  filters?: {
    hub?: PamboHub;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    location?: string;
    sortBy?: 'latest' | 'price_low' | 'price_high' | 'rating';
  },
  limit = 20,
  offset = 0
) => {
  try {
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // Search by title or description
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`
      );
    }

    // Apply filters
    if (filters?.hub) {
      query = query.eq('hub', filters.hub);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    // Apply sorting
    let sortColumn = 'createdAt';
    let ascending = false;

    if (filters?.sortBy === 'price_low') {
      sortColumn = 'price';
      ascending = true;
    } else if (filters?.sortBy === 'price_high') {
      sortColumn = 'price';
      ascending = false;
    } else if (filters?.sortBy === 'rating') {
      sortColumn = 'rating';
      ascending = false;
    }

    query = query.order(sortColumn, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return { success: true, listings: data || [], total: count || 0 };
  } catch (error) {
    console.error('Search listings error:', error);
    return { success: false, error };
  }
};

/**
 * Get featured listings (boosted or highly rated)
 */
export const getFeaturedListings = async (hub?: PamboHub, limit = 10) => {
  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .eq('boost.isBoosted', true);

    if (hub) {
      query = query.eq('hub', hub);
    }

    const { data, error } = await query
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, listings: data || [] };
  } catch (error) {
    console.error('Get featured listings error:', error);
    return { success: false, error };
  }
};

/**
 * Toggle favorite listing for buyer
 */
export const toggleFavoriteListing = async (listingId: string, buyerId: string) => {
  try {
    const { data: listing } = await supabase
      .from('listings')
      .select('favoritedBy')
      .eq('id', listingId)
      .single();

    let favoritedBy = listing?.favoritedBy || [];

    if (favoritedBy.includes(buyerId)) {
      favoritedBy = favoritedBy.filter((id: string) => id !== buyerId);
    } else {
      favoritedBy.push(buyerId);
    }

    const { error } = await supabase
      .from('listings')
      .update({ favoritedBy })
      .eq('id', listingId);

    if (error) throw error;

    return { success: true, isFavorited: favoritedBy.includes(buyerId) };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return { success: false, error };
  }
};

/**
 * Get listings near a location (within radius)
 */
export const getListingsNearLocation = async (latitude: number, longitude: number, radiusKm = 50) => {
  try {
    // This is a simplified approach - for production, use PostGIS
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .in('hub', ['farmer', 'marketplace', 'service']);

    if (error) throw error;

    return { success: true, listings: data || [] };
  } catch (error) {
    console.error('Get listings near location error:', error);
    return { success: false, error };
  }
};

/**
 * Get trending listings (high view count this week)
 */
export const getTrendingListings = async (hub?: PamboHub, limit = 10) => {
  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    if (hub) {
      query = query.eq('hub', hub);
    }

    const { data, error } = await query
      .order('viewCount', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, listings: data || [] };
  } catch (error) {
    console.error('Get trending listings error:', error);
    return { success: false, error };
  }
};
