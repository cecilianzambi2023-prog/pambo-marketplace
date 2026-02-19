/**
 * HubArchitecture.ts
 * ==================
 * Pambo.com 6-in-1 Hub Infrastructure Types
 *
 * ARCHITECTURE: HUB SEGREGATION WITH SHARED USERS
 * ═══════════════════════════════════════════════════════════
 *
 * SHARED ACROSS ALL HUBS (in profiles table, NO hub_id):
 * ├── User ID (one login = access to all 6 hubs)
 * ├── Email (single identity)
 * ├── Subscription Tier (applies everywhere)
 * └── Verification Badge (trust level across all hubs)
 *
 * SEGREGATED BY HUB (hub_id column in listings table):
 * ├── Listings (each hub has own inventory)
 * ├── Analytics (each hub has own GMV/stats)
 * ├── Reviews (each hub has own ratings)
 * └── Messages (each hub has own conversations)
 *
 * DATA MODEL:
 * • profiles: { id, email, subscription_tier, verification_badge } [NO hub_id]
 * • listings: { id, hub_id, title, created_by, ... } [WITH hub_id]
 * • Query: WHERE hub_id = 'marketplace' AND created_by = userId
 *
 * This enables:
 * ✅ One auth session across all 6 hubs
 * ✅ One subscription tier for all hubs
 * ✅ Independent listing management per hub
 * ✅ Hub-specific business rules and features
 * ✅ Billion-dollar scale with trillion items
 *
 * Every type here reflects this segregation model.
 */

// ===================================
// HUB DEFINITIONS
// ===================================

export type HubId =
  | 'marketplace'
  | 'wholesale'
  | 'digital'
  | 'mkulima'
  | 'services'
  | 'live_commerce';

export const HUB_IDS = {
  MARKETPLACE: 'marketplace' as const,
  WHOLESALE: 'wholesale' as const,
  DIGITAL: 'digital' as const,
  MKULIMA: 'mkulima' as const,
  SERVICES: 'services' as const,
  LIVE_COMMERCE: 'live_commerce' as const
} as const;

// ===================================
// HUB CONFIGURATION
// ===================================

export interface HubFeature {
  enabled: boolean;
  description: string;
}

export interface HubFeatures {
  listings: HubFeature;
  directContact: HubFeature;
  liveStreaming: HubFeature;
  bulkPricing: HubFeature;
  digitalDownload: HubFeature;
  servicesBooking: HubFeature;
  shippingIntegration: HubFeature;
  analytics: HubFeature;
  api: HubFeature;
}

export interface HubRules {
  // Listing limits per tier
  listingLimits: {
    mkulima: number; // 50
    starter: number; // 200
    pro: number; // Unlimited
    enterprise: number; // Unlimited
  };

  // Product categories allowed in this hub
  allowedCategories: string[];

  // Minimum subscription tier to access
  minimumTier: 'mkulima' | 'starter' | 'pro' | 'enterprise';

  // Commission (if any - Direct-Connect should be 0%)
  commissionPercentage: number;

  // Verification requirements
  requiresVerification: boolean;
  requiredDocuments: ('national_id' | 'business_permit' | 'tax_certificate' | 'trade_license')[];

  // Geographic restrictions
  allowedCountries: string[];
  allowedCities?: string[];
}

export interface HubConfig {
  id: HubId;
  name: string;
  displayName: string;
  description: string;
  longDescription: string;

  // Branding
  color: {
    primary: string; // e.g. "#10b981" for green
    secondary: string;
    accent: string;
  };
  icon: string; // SVG or icon name
  logo?: string; // URL to logo (optional)
  bannerImage?: string; // URL to hub banner

  // Audience
  targetAudience: string; // e.g. "Farmers and small traders"
  audienceDescription: string;

  // Features available in this hub
  features: HubFeatures;

  // Business rules for this hub
  rules: HubRules;

  // URL and routing
  routePath: string; // e.g. "/hub/marketplace"
  urlSlug: string; // e.g. "marketplace"

  // Priority for UI navigation (lower = higher priority)
  navigationPriority: number;

  // Enable/disable hub (for gradual rollout)
  isActive: boolean;

  // Growth metrics (for analytics)
  metrics?: {
    monthlyActiveUsers?: number;
    totalListings?: number;
    gmv?: number; // Gross Merchandise Value
  };

  // Coming soon?
  launchDate?: string; // ISO timestamp
  isComingSoon?: boolean;
}

// ===================================
// HUB CONTEXT
// ===================================

export interface HubContextValue {
  // Current hub state
  currentHub: HubConfig;
  hubId: HubId;
  isChangingHub: boolean;

  // Hub navigation
  switchHub: (hubId: HubId) => Promise<void>;
  goToHub: (hubId: HubId, path?: string) => void;

  // Hub-specific preferences
  hubPreferences: {
    [K in HubId]?: {
      lastVisited: string; // ISO timestamp
      searchFilters?: Record<string, any>;
      viewPreference?: 'grid' | 'list';
    };
  };

  // Get hub by ID (for lookups)
  getHub: (hubId: HubId) => HubConfig | null;

  // Get all active hubs (for navigation)
  getActiveHubs: () => HubConfig[];

  // Check if hub is available for current user
  isHubAccessible: (hubId: HubId, userTier?: string) => boolean;
}

// ===================================
// HUB-SPECIFIC STATE
// ===================================

export interface HubListingFilters {
  hubId: HubId;
  categories?: string[];
  priceRange?: { min: number; max: number };
  location?: string;
  verified?: boolean;
  sort?: 'newest' | 'popular' | 'rating' | 'priceAsc' | 'priceDesc';
}

export interface HubSearchState {
  hubId: HubId;
  query: string;
  filters: HubListingFilters;
  results: any[]; // Listing type
  isLoading: boolean;
  error?: string;
}

// ===================================
// HUB NAVIGATION
// ===================================

export interface HubNavigation {
  hub: HubConfig;
  isActive: boolean;
  notificationCount?: number;
  action?: {
    label: string;
    href: string;
  };
}

export interface HubNavigationState {
  activePath: string;
  previousHub?: HubId;
  breadcrumbs: Array<{
    label: string;
    href: string;
    hubId?: HubId;
  }>;
}

// ===================================
// HUB ANALYTICS
// ===================================

export interface HubAnalytics {
  hubId: HubId;
  timestamp: string;

  // User metrics
  activeUsers: number;
  newUsers: number;
  monthlyactiveUsers: number;

  // Listing metrics
  totalListings: number;
  newListings: number;
  avgListingsPerSeller: number;

  // Financial metrics
  gmv: number; // Gross Merchandise Value
  avgOrderValue: number;
  conversionRate: number;

  // Engagement metrics
  viewsPerListing: number;
  contactRequestsPerListing: number;
  avgResponseTime: number;

  // Quality metrics
  avgRating: number;
  banRatePercentage: number;
  fraudIncidentsCount: number;
}

// ===================================
// HUB LISTING
// ===================================

export interface HubListing {
  id: string;
  sellerId: string;
  hubId: HubId;

  // Content
  title: string;
  description: string;
  categories: string[];
  images: string[];
  price: number;
  currency: 'KES';

  // Hub-specific fields
  hubSpecificData?: Record<string, any>;
  // Examples:
  // marketplace: { condition: 'new'|'used', shipping: boolean }
  // wholesale: { bulkDiscount: 0.1, minQuantity: 10 }
  // digital: { downloadUrl: string, licenseType: 'single'|'team' }
  // mkulima: { harvestDate: string, certification: boolean }
  // services: { serviceType: string, duration: string, availability: string }
  // live_commerce: { liveStreamId: string, startTime: string }

  // Seller info
  seller: {
    id: string;
    name: string;
    badge: 'bronze' | 'silver' | 'gold' | 'platinum';
    isVerified: boolean;
    rating: number;
    responseTime: number;
  };

  // Status
  status: 'active' | 'sold' | 'pending' | 'archived';
  createdAt: string;
  updatedAt: string;
  soldAt?: string;

  // Engagement
  viewsCount: number;
  contactRequestsCount: number;
}

// ===================================
// HUB USER ROLE & PERMISSIONS
// ===================================

export type HubUserRole = 'buyer' | 'seller' | 'admin';

export interface HubUserPermissions {
  canCreateListings: boolean;
  canViewAnalytics: boolean;
  canContactSellers: boolean;
  canReportListings: boolean;
  canAccessBulkTools: boolean;
  canStream: boolean;
  canUseAPI: boolean;
}

export interface HubUserAccess {
  hubId: HubId;
  role: HubUserRole;
  permissions: HubUserPermissions;
  subscriptionTier: 'mkulima' | 'starter' | 'pro' | 'enterprise';
  accessGrantedAt: string;
  expiresAt?: string;
}

// ===================================
// HUB MIGRATION (For users switching hubs)
// ===================================

export interface HubMigration {
  userId: string;
  fromHub: HubId;
  toHub: HubId;
  reason?: string;
  migratedListings?: number;
  preserveRating: boolean; // Should rating transfer to new hub?
  timestamp: string;
}

// ===================================
// HUB SHORTCUTS & QUICK ACTIONS
// ===================================

export interface HubQuickAction {
  id: string;
  hubId: HubId;
  label: string;
  icon: string;
  href: string;
  order: number;
  onlyForRoles?: HubUserRole[];
  requiresSubscription?: 'mkulima' | 'starter' | 'pro' | 'enterprise';
}

// ===================================
// HUB SHORTCUTS (Per hub)
// ===================================

export const HUB_QUICK_ACTIONS: Record<HubId, HubQuickAction[]> = {
  marketplace: [
    {
      id: 'create-listing',
      hubId: 'marketplace',
      label: 'Create Listing',
      icon: 'Plus',
      href: '/hub/marketplace/create',
      order: 1,
      onlyForRoles: ['seller']
    },
    {
      id: 'browse',
      hubId: 'marketplace',
      label: 'Browse',
      icon: 'Search',
      href: '/hub/marketplace/browse',
      order: 2
    }
  ],
  wholesale: [
    {
      id: 'create-catalog',
      hubId: 'wholesale',
      label: 'Create Catalog',
      icon: 'ShoppingCart',
      href: '/hub/wholesale/create',
      order: 1,
      onlyForRoles: ['seller']
    },
    {
      id: 'browse-wholesale',
      hubId: 'wholesale',
      label: 'Find Wholesalers',
      icon: 'TrendingUp',
      href: '/hub/wholesale/browse',
      order: 2
    }
  ],
  digital: [
    {
      id: 'upload-digital',
      hubId: 'digital',
      label: 'Upload Digital Product',
      icon: 'Cloud',
      href: '/hub/digital/upload',
      order: 1,
      onlyForRoles: ['seller']
    }
  ],
  mkulima: [
    {
      id: 'list-harvest',
      hubId: 'mkulima',
      label: 'List Harvest',
      icon: 'Leaf',
      href: '/hub/mkulima/create',
      order: 1,
      onlyForRoles: ['seller']
    }
  ],
  services: [
    {
      id: 'offer-service',
      hubId: 'services',
      label: 'Offer Service',
      icon: 'Briefcase',
      href: '/hub/services/create',
      order: 1,
      onlyForRoles: ['seller']
    }
  ],
  live_commerce: [
    {
      id: 'go-live',
      hubId: 'live_commerce',
      label: 'Go Live',
      icon: 'Radio',
      href: '/hub/live-commerce/stream',
      order: 1,
      onlyForRoles: ['seller'],
      requiresSubscription: 'pro'
    }
  ]
};

// ===================================
// HUB CONSTANTS
// ===================================

export const HUB_METADATA: Record<
  HubId,
  {
    title: string;
    emoji: string;
    description: string;
  }
> = {
  marketplace: {
    title: 'Marketplace',
    emoji: '🏪',
    description: 'General marketplace for products and goods'
  },
  wholesale: {
    title: 'Wholesale',
    emoji: '🏭',
    description: 'Bulk buying and selling for businesses'
  },
  digital: {
    title: 'Digital Hub',
    emoji: '💻',
    description: 'Digital products, courses, and software'
  },
  mkulima: {
    title: 'Mkulima Mdogo',
    emoji: '🌾',
    description: 'Farmer-focused hub with special pricing'
  },
  services: {
    title: 'Services Hub',
    emoji: '🛠️',
    description: 'Professional services and freelance work'
  },
  live_commerce: {
    title: 'Live Commerce',
    emoji: '🎥',
    description: 'Real-time streaming sales'
  }
};
