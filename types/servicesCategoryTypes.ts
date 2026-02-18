/**
 * servicesCategoryTypes.ts
 * ========================
 * 
 * Type definitions for the data-driven services system.
 * Categories are loaded from the database, not hardcoded.
 */

import { HubId } from './HubArchitecture';

// ========================================================
// CATEGORY TYPES
// ========================================================

export interface ServiceCategory {
  id: string; // UUID from database
  hub: HubId;
  name: string; // "Plumber"
  slug: string; // "plumber" (URL-safe)
  description?: string;
  icon?: string; // emoji or icon code
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceListing {
  id: string;
  hub: 'services'; // Services hub only
  category_id: string; // FK to categories.id
  seller_id: string; // FK to profiles.id (user offering service)
  
  // Service Details
  title: string; // "Emergency Plumbing - 24/7 Available"
  description: string; // Full service description
  price_per_hour?: number;
  price_fixed?: number;
  
  // Contact Information (PRIMARY CONTACT)
  phone: string; // Required - mobile number
  whatsapp?: string; // WhatsApp number (same or different)
  email?: string;
  
  // Location & Service Area
  county_id: string; // Which county operates in
  service_areas?: string[]; // Multiple counties if applicable
  
  // Verification & Trust
  verification_badge?: 'bronze' | 'silver' | 'gold' | 'platinum';
  rating?: number; // 1-5 stars (average)
  reviews_count?: number; // Total written reviews
  follower_count?: number; // How many saved/follow this pro
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ServiceListingWithCategory extends ServiceListing {
  category?: ServiceCategory;
}

// ========================================================
// QUERY FILTERS
// ========================================================

export interface ServiceFilters {
  hub?: 'services';
  category_id?: string;
  category_slug?: string; // Alternative: search by slug instead of ID
  county_id?: string;
  verification_badge?: 'bronze' | 'silver' | 'gold' | 'platinum';
  search?: string; // Search title/description
  price_max?: number;
  rating_min?: number;
  sort_by?: 'rating' | 'most_recent' | 'price_low' | 'price_high';
}

// ========================================================
// RESPONSE TYPES
// ========================================================

export interface CategoriesResponse {
  categories: ServiceCategory[];
  total: number;
}

export interface ServiceListingsResponse {
  listings: ServiceListingWithCategory[];
  total: number;
  page: number;
  per_page: number;
}
