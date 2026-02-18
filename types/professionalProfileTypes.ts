/**
 * professionalProfileTypes.ts
 * ============================
 * 
 * Type definitions for professional profiles in the Services Hub.
 * Each professional gets a unique URL: /professionals/:id
 */

// ========================================================
// PROFESSIONAL PROFILE
// ========================================================

export interface ProfessionalProfile {
  id: string; // UUID (same as profiles.id)
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  avatar_url?: string;
  bio?: string;
  
  // Service Area
  county_id: string;
  service_areas?: string[];
  
  // Subscription & Verification
  subscription_status?: 'active' | 'inactive' | 'expired';
  subscription_tier?: string;
  verification_badge?: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_verified?: boolean;
  
  // Stats
  rating?: number; // 1-5 average
  reviews_count?: number;
  follower_count?: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// ========================================================
// PORTFOLIO & GALLERY
// ========================================================

export interface PortfolioMedia {
  id: string;
  professional_id: string;
  title: string;
  description?: string;
  media_type: 'image' | 'video';
  media_url: string; // URL to image/video in storage
  thumbnail_url?: string; // For videos, show thumbnail
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface ProfessionalPortfolio {
  id: string;
  professional_id: string;
  media_items: PortfolioMedia[]; // Array of images/videos (max 10)
  total_items: number; // Count of media items
}

// ========================================================
// SUB-CATEGORIES (WHAT THEY SPECIFICALLY OFFER)
// ========================================================

export interface ProfessionalSubcategory {
  id: string;
  professional_id: string;
  category_id: string;
  subcategory_name: string; // "Sofa Cleaning", "Gypsum Installation", etc.
  description?: string;
  price_estimate?: number;
  is_active: boolean;
  created_at: string;
}

// ========================================================
// FOLLOWERS & FOLLOW SYSTEM
// ========================================================

export interface Follower {
  id: string;
  follower_id: string; // User following
  professional_id: string; // Professional being followed
  created_at: string;
}

export interface FollowStats {
  is_following: boolean;
  total_followers: number;
}

// ========================================================
// PROFESSIONAL DETAIL VIEW (COMBINED)
// ========================================================

export interface ProfessionalDetailView extends ProfessionalProfile {
  subcategories: ProfessionalSubcategory[];
  portfolio: ProfessionalPortfolio;
  follow_stats: FollowStats;
}

// ========================================================
// API RESPONSES
// ========================================================

export interface ProfessionalDetailsResponse {
  professional: ProfessionalDetailView;
  error?: string;
}

export interface FollowActionResponse {
  success: boolean;
  is_following: boolean;
  new_follower_count: number;
  error?: string;
}

export interface PortfolioUploadResponse {
  success: boolean;
  media: PortfolioMedia;
  error?: string;
}

// ========================================================
// QUERIES & FILTERS
// ========================================================

export interface SearchProfessionalsFilter {
  category_slug?: string;
  subcategory_name?: string;
  county_id?: string;
  rating_min?: number;
  verification_tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'any';
  search_query?: string; // Search by name/title
  sort_by?: 'rating' | 'followers' | 'recent' | 'price_low' | 'price_high';
  page?: number;
  per_page?: number;
}
