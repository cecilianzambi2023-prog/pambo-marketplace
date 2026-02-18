/**
 * Supabase Service Layer
 * Directly queries all 6 Hubs from the unified listings table
 * No mock data - all real data from Supabase
 */

import { supabase } from '../src/lib/supabaseClient';
import { DatabaseListing, DatabaseUser, DatabaseFarmerProfile, DatabaseLiveStream, DatabaseBuyingRequest } from '../types/database';

/**
 * ==========================================
 * LISTINGS QUERIES (All 6 Hubs)
 * ==========================================
 */

/**
 * Fetch listings by hub
 */
export const fetchListingsByHub = async (hub: 'marketplace' | 'wholesale' | 'digital' | 'farmer' | 'service' | 'live'): Promise<DatabaseListing[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('hub', hub)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) {
      console.error(`Error fetching ${hub} listings:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Exception fetching ${hub} listings:`, error);
    return [];
  }
};

/**
 * Fetch marketplace listings
 */
export const fetchMarketplaceListings = async (): Promise<DatabaseListing[]> => {
  return fetchListingsByHub('marketplace');
};

/**
 * Fetch wholesale listings
 */
export const fetchWholesaleListings = async (): Promise<DatabaseListing[]> => {
  return fetchListingsByHub('wholesale');
};

/**
 * Fetch digital product listings
 */
export const fetchDigitalListings = async (): Promise<DatabaseListing[]> => {
  return fetchListingsByHub('digital');
};

/**
 * Fetch farmer/mkulima listings
 */
export const fetchFarmerListings = async (): Promise<DatabaseListing[]> => {
  return fetchListingsByHub('farmer');
};

/**
 * Fetch service listings (professional_services)
 */
export const fetchServiceListings = async (): Promise<DatabaseListing[]> => {
  return fetchListingsByHub('service');
};

/**
 * Fetch live commerce listings
 */
export const fetchLiveListings = async (): Promise<DatabaseListing[]> => {
  return fetchListingsByHub('live');
};

/**
 * Fetch listings by category
 */
export const fetchListingsByCategory = async (category: string): Promise<DatabaseListing[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(50);

    if (error) {
      console.error(`Error fetching ${category} listings:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Exception fetching ${category} listings:`, error);
    return [];
  }
};

/**
 * Search listings by keyword
 */
export const searchListings = async (keyword: string, hub?: string): Promise<DatabaseListing[]> => {
  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`);

    if (hub) {
      query = query.eq('hub', hub);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error(`Error searching listings:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Exception searching listings:`, error);
    return [];
  }
};

/**
 * Fetch single listing by ID
 */
export const fetchListingById = async (id: string): Promise<DatabaseListing | null> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching listing ${id}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Exception fetching listing ${id}:`, error);
    return null;
  }
};

/**
 * Fetch listings by seller ID
 */
export const fetchListingsBySellerId = async (sellerId: string): Promise<DatabaseListing[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('sellerId', sellerId)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .limit(100);

    if (error) {
      console.error(`Error fetching listings for seller ${sellerId}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Exception fetching seller listings:`, error);
    return [];
  }
};

/**
 * Fetch featured/top-rated listings
 */
export const fetchFeaturedListings = async (limit: number = 10): Promise<DatabaseListing[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .gt('rating', 4.0)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured listings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching featured listings:', error);
    return [];
  }
};

/**
 * ==========================================
 * USERS QUERIES
 * ==========================================
 */

/**
 * Fetch user by ID
 */
export const fetchUserById = async (userId: string): Promise<DatabaseUser | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Exception fetching user:`, error);
    return null;
  }
};

/**
 * Fetch multiple users by IDs
 */
export const fetchUsersByIds = async (userIds: string[]): Promise<DatabaseUser[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching users:', error);
    return [];
  }
};

/**
 * Fetch all sellers (users with isSeller = true)
 */
export const fetchAllSellers = async (): Promise<DatabaseUser[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('isSeller', true)
      .eq('accountStatus', 'active')
      .order('joinDate', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching sellers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching sellers:', error);
    return [];
  }
};

/**
 * ==========================================
 * FARMER PROFILES QUERIES
 * ==========================================
 */

/**
 * Fetch all farmer profiles
 */
export const fetchFarmerProfiles = async (): Promise<DatabaseFarmerProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('farmerProfiles')
      .select('*')
      .eq('isVerified', true)
      .order('createdAt', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching farmer profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching farmer profiles:', error);
    return [];
  }
};

/**
 * Fetch farmer profile by user ID
 */
export const fetchFarmerProfileByUserId = async (userId: string): Promise<DatabaseFarmerProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('farmerProfiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) {
      console.error(`Error fetching farmer profile for user ${userId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching farmer profile:', error);
    return null;
  }
};

/**
 * ==========================================
 * LIVE STREAMS QUERIES
 * ==========================================
 */

/**
 * Fetch live streams
 */
export const fetchLiveStreams = async (status?: 'live' | 'upcoming' | 'ended'): Promise<DatabaseLiveStream[]> => {
  try {
    let query = supabase
      .from('liveStreams')
      .select('*')
      .order('createdAt', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching live streams:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching live streams:', error);
    return [];
  }
};

/**
 * ==========================================
 * BUYING REQUESTS QUERIES
 * ==========================================
 */

/**
 * Fetch buying requests
 */
export const fetchBuyingRequests = async (status?: string): Promise<DatabaseBuyingRequest[]> => {
  try {
    let query = supabase
      .from('buyingRequests')
      .select('*')
      .order('timestamp', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching buying requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching buying requests:', error);
    return [];
  }
};

/**
 * ==========================================
 * CREATE OPERATIONS
 * ==========================================
 */

/**
 * Create new listing
 */
export const createListing = async (listing: Partial<DatabaseListing>): Promise<DatabaseListing | null> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([{
        ...listing,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating listing:', error);
    return null;
  }
};

/**
 * Update listing
 */
export const updateListing = async (id: string, updates: Partial<DatabaseListing>): Promise<DatabaseListing | null> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception updating listing:', error);
    return null;
  }
};

/**
 * Delete listing
 */
export const deleteListing = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting listing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting listing:', error);
    return false;
  }
};
