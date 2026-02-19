/**
 * PAMBO INTEGRATION HUB
 * Central point for connecting React components with Supabase backend
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase, getAuthenticatedUser } from '../src/lib/supabaseClient';
import {
  getUserProfile,
  getSellerProfile,
  followSeller,
  unfollowSeller
} from '../services/authService';
import {
  getListingsByHub,
  getSellerListings,
  getListing,
  searchListings,
  getFeaturedListings,
  getTrendingListings
} from '../services/listingsService';
import { getBuyerOrders, getSellerOrders } from '../services/ordersService';
import { getListingReviews, getSellerReviews } from '../services/reviewsService';
import { User, PamboListing, PamboOrder, PamboReview, PamboHub } from '../types';

// ============================================
// AUTHENTICATION HOOK
// ============================================
export const useAuthentication = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await getAuthenticatedUser();
        if (authUser) {
          const { success, user: profile } = await getUserProfile(authUser.id);
          if (success && profile) {
            setUser(profile);
          }
        }
        setIsLoading(false);
      } catch (err: any) {
        setError(err?.message || 'Auth error');
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        const { success, user: profile } = await getUserProfile(session.user.id);
        if (success && profile) {
          setUser(profile);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  return { user, isLoading, error };
};

// ============================================
// LISTINGS HOOK (By Hub)
// ============================================
export const useListingsByHub = (hub: PamboHub, limit = 20) => {
  const [listings, setListings] = useState<PamboListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { success, listings: data, total: count } = await getListingsByHub(hub, limit);
        if (success) {
          setListings(data);
          setTotal(count);
        } else {
          setError('Failed to fetch listings');
        }
      } catch (err: any) {
        setError(err?.message || 'Error fetching listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [hub, limit]);

  return { listings, isLoading, error, total };
};

// ============================================
// SELLER LISTINGS HOOK
// ============================================
export const useSellerListings = (sellerId: string) => {
  const [listings, setListings] = useState<PamboListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { success, listings: data } = await getSellerListings(sellerId);
        if (success) {
          setListings(data);
        }
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (sellerId) fetchListings();
  }, [sellerId]);

  return { listings, isLoading, error };
};

// ============================================
// FEATURED LISTINGS HOOK
// ============================================
export const useFeaturedListings = (hub?: PamboHub, limit = 10) => {
  const [listings, setListings] = useState<PamboListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { success, listings: data } = await getFeaturedListings(hub, limit);
      if (success) {
        setListings(data);
      }
      setIsLoading(false);
    };

    fetchFeatured();
  }, [hub, limit]);

  return { listings, isLoading };
};

// ============================================
// TRENDING LISTINGS HOOK
// ============================================
export const useTrendingListings = (hub?: PamboHub, limit = 10) => {
  const [listings, setListings] = useState<PamboListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      const { success, listings: data } = await getTrendingListings(hub, limit);
      if (success) {
        setListings(data);
      }
      setIsLoading(false);
    };

    fetchTrending();
  }, [hub, limit]);

  return { listings, isLoading };
};

// ============================================
// SEARCH HOOK
// ============================================
export const useSearchListings = (searchTerm: string, filters?: any) => {
  const [listings, setListings] = useState<PamboListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setListings([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      const { success, listings: data, total: count } = await searchListings(searchTerm, filters);
      if (success) {
        setListings(data);
        setTotal(count);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters]);

  return { listings, isLoading, total };
};

// ============================================
// SINGLE LISTING HOOK
// ============================================
export const useListing = (listingId: string) => {
  const [listing, setListing] = useState<PamboListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;
      try {
        const { success, listing: data } = await getListing(listingId);
        if (success) {
          setListing(data);
        }
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  return { listing, isLoading, error };
};

// ============================================
// BUYER ORDERS HOOK
// ============================================
export const useBuyerOrders = (buyerId: string) => {
  const [orders, setOrders] = useState<PamboOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!buyerId) return;
      try {
        const { success, orders: data } = await getBuyerOrders(buyerId);
        if (success) {
          setOrders(data);
        }
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [buyerId]);

  return { orders, isLoading, error };
};

// ============================================
// SELLER ORDERS HOOK
// ============================================
export const useSellerOrders = (sellerId: string) => {
  const [orders, setOrders] = useState<PamboOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!sellerId) return;
      try {
        const { success, orders: data } = await getSellerOrders(sellerId);
        if (success) {
          setOrders(data);
        }
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [sellerId]);

  return { orders, isLoading, error };
};

// ============================================
// SELLER PROFILE HOOK
// ============================================
export const useSellerProfile = (sellerId: string) => {
  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!sellerId) return;
      try {
        const { success, seller: data } = await getSellerProfile(sellerId);
        if (success) {
          setSeller(data);
        }
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [sellerId]);

  return { seller, isLoading, error };
};

// ============================================
// LISTING REVIEWS HOOK
// ============================================
export const useListingReviews = (listingId: string) => {
  const [reviews, setReviews] = useState<PamboReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!listingId) return;
      try {
        const { success, reviews: data } = await getListingReviews(listingId);
        if (success) {
          setReviews(data);
        }
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [listingId]);

  return { reviews, isLoading, error };
};

// ============================================
// SELLER REVIEWS HOOK
// ============================================
export const useSellerReviews = (sellerId: string) => {
  const [reviews, setReviews] = useState<PamboReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!sellerId) return;
      try {
        const { success, reviews: data } = await getSellerReviews(sellerId);
        if (success) {
          setReviews(data);
        }
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [sellerId]);

  return { reviews, isLoading, error };
};

// ============================================
// FOLLOW/UNFOLLOW HOOK
// ============================================
export const useFollowSeller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const follow = useCallback(async (buyerId: string, sellerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { success, error: err } = await followSeller(buyerId, sellerId);
      if (!success) {
        setError(err?.message || 'Failed to follow seller');
      }
      return success;
    } catch (err: any) {
      setError(err?.message || 'Error following seller');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unfollow = useCallback(async (buyerId: string, sellerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { success, error: err } = await unfollowSeller(buyerId, sellerId);
      if (!success) {
        setError(err?.message || 'Failed to unfollow seller');
      }
      return success;
    } catch (err: any) {
      setError(err?.message || 'Error unfollowing seller');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { follow, unfollow, isLoading, error };
};

export default {
  useAuthentication,
  useListingsByHub,
  useSellerListings,
  useFeaturedListings,
  useTrendingListings,
  useSearchListings,
  useListing,
  useBuyerOrders,
  useSellerOrders,
  useSellerProfile,
  useListingReviews,
  useSellerReviews,
  useFollowSeller
};
