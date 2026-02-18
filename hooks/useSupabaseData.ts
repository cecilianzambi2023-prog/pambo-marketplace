/**
 * React 18 Data Fetching Hooks
 * Custom hooks for efficient, scalable data fetching from Supabase
 * Implements proper error handling, loading states, and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchListingsByHub,
  fetchListingsByCategory,
  searchListings,
  fetchListingById,
  fetchListingsBySellerId,
  fetchFeaturedListings,
  fetchAllSellers,
  fetchFarmerProfiles,
  fetchLiveStreams,
  fetchBuyingRequests,
} from '../services/supabaseService';
import { DatabaseListing, DatabaseUser, DatabaseFarmerProfile, DatabaseLiveStream, DatabaseBuyingRequest } from '../types/database';

// ============================================
// TYPES
// ============================================
interface UseDataReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ============================================
// CACHE MANAGER (5-minute TTL)
// ============================================
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheStore = new Map<string, CacheEntry<any>>();

const getCachedData = <T,>(key: string): T | null => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cacheStore.delete(key);
    return null;
  }
  
  return entry.data;
};

const setCachedData = <T,>(key: string, data: T): void => {
  cacheStore.set(key, { data, timestamp: Date.now() });
};

const invalidateCache = (pattern?: string): void => {
  if (!pattern) {
    cacheStore.clear();
    return;
  }
  
  cacheStore.forEach((_, key) => {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  });
};

// ============================================
// HOOKS
// ============================================

/**
 * Fetch listings by hub with caching
 */
export const useListingsByHub = (
  hub: 'marketplace' | 'wholesale' | 'digital' | 'farmer' | 'service' | 'live'
): UseDataReturn<DatabaseListing[]> => {
  const [data, setData] = useState<DatabaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cacheKey = `listings_${hub}`;
    const cachedData = getCachedData<DatabaseListing[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      const listings = await fetchListingsByHub(hub);
      
      if (listings) {
        setCachedData(cacheKey, listings);
        setData(listings);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || `Failed to fetch ${hub} listings`);
        console.error(`Error fetching ${hub} listings:`, err);
      }
    } finally {
      setLoading(false);
    }
  }, [hub]);

  useEffect(() => {
    fetchData();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

/**
 * Fetch listings by category with caching
 */
export const useListingsByCategory = (category: string): UseDataReturn<DatabaseListing[]> => {
  const [data, setData] = useState<DatabaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `listings_category_${category}`;
    const cachedData = getCachedData<DatabaseListing[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const listings = await fetchListingsByCategory(category);
      if (listings) {
        setCachedData(cacheKey, listings);
        setData(listings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listings');
      console.error('Error fetching category listings:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Search listings with debouncing
 */
export const useSearchListings = (
  keyword: string,
  hub?: string,
  debounceMs: number = 300
): UseDataReturn<DatabaseListing[]> => {
  const [data, setData] = useState<DatabaseListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const listings = await searchListings(query, hub);
      setData(listings || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      console.error('Error searching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [hub]);

  useEffect(() => {
    if (!keyword.trim()) {
      setData([]);
      return;
    }

    // Debounce the search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData(keyword);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [keyword, debounceMs, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(keyword),
  };
};

/**
 * Fetch single listing by ID
 */
export const useListingById = (id: string): UseDataReturn<DatabaseListing | null> => {
  const [data, setData] = useState<DatabaseListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `listing_${id}`;
    const cachedData = getCachedData<DatabaseListing>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const listing = await fetchListingById(id);
      if (listing) {
        setCachedData(cacheKey, listing);
        setData(listing);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listing');
      console.error('Error fetching listing:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Fetch seller's listings
 */
export const useSellerListings = (sellerId: string): UseDataReturn<DatabaseListing[]> => {
  const [data, setData] = useState<DatabaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `seller_listings_${sellerId}`;
    const cachedData = getCachedData<DatabaseListing[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const listings = await fetchListingsBySellerId(sellerId);
      if (listings) {
        setCachedData(cacheKey, listings);
        setData(listings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch seller listings');
      console.error('Error fetching seller listings:', err);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchData();
    }
  }, [sellerId, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Fetch featured/top-rated listings
 */
export const useFeaturedListings = (limit: number = 10): UseDataReturn<DatabaseListing[]> => {
  const [data, setData] = useState<DatabaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `featured_listings_${limit}`;
    const cachedData = getCachedData<DatabaseListing[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const listings = await fetchFeaturedListings(limit);
      if (listings) {
        setCachedData(cacheKey, listings);
        setData(listings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch featured listings');
      console.error('Error fetching featured listings:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Fetch all sellers
 */
export const useSellers = (): UseDataReturn<DatabaseUser[]> => {
  const [data, setData] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = 'all_sellers';
    const cachedData = getCachedData<DatabaseUser[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const sellers = await fetchAllSellers();
      if (sellers) {
        setCachedData(cacheKey, sellers);
        setData(sellers);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sellers');
      console.error('Error fetching sellers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Fetch farmer profiles
 */
export const useFarmerProfiles = (): UseDataReturn<DatabaseFarmerProfile[]> => {
  const [data, setData] = useState<DatabaseFarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = 'farmer_profiles';
    const cachedData = getCachedData<DatabaseFarmerProfile[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const profiles = await fetchFarmerProfiles();
      if (profiles) {
        setCachedData(cacheKey, profiles);
        setData(profiles);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch farmer profiles');
      console.error('Error fetching farmer profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Fetch live streams
 */
export const useLiveStreams = (status?: 'live' | 'upcoming' | 'ended'): UseDataReturn<DatabaseLiveStream[]> => {
  const [data, setData] = useState<DatabaseLiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `live_streams_${status || 'all'}`;
    const cachedData = getCachedData<DatabaseLiveStream[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const streams = await fetchLiveStreams(status);
      if (streams) {
        setCachedData(cacheKey, streams);
        setData(streams);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live streams');
      console.error('Error fetching live streams:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Fetch buying requests
 */
export const useBuyingRequests = (status?: string): UseDataReturn<DatabaseBuyingRequest[]> => {
  const [data, setData] = useState<DatabaseBuyingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `buying_requests_${status || 'all'}`;
    const cachedData = getCachedData<DatabaseBuyingRequest[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requests = await fetchBuyingRequests(status);
      if (requests) {
        setCachedData(cacheKey, requests);
        setData(requests);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch buying requests');
      console.error('Error fetching buying requests:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// ============================================
// CACHE UTILITIES (Exported for manual control)
// ============================================
export const useCache = () => ({
  invalidate: invalidateCache,
  clear: () => cacheStore.clear(),
});
