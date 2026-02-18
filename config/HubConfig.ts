/**
 * HubConfig.ts
 * ============
 * Concrete configuration for all 6 hubs
 * 
 * ARCHITECTURE: HUB SEGREGATION WITH SHARED USERS
 * ═══════════════════════════════════════════════════════════
 * 
 * This is the SOURCE OF TRUTH for how each hub operates.
 * Changes here cascade to UI, routing, business logic, and payments.
 * 
 * SHARED CONFIG (same for all users, all hubs):
 * └─ User authentication (one login)
 * └─ Subscription tier (upgrade once = all hubs)
 * └─ Verification badge (verified once = everywhere)
 * └─ Payment account (M-Pesa connected for all hubs)
 * 
 * SEGREGATED CONFIG (different per hub):
 * ├─ Listing limits (Mkulima: 50, Marketplace: 200)
 * ├─ Commission rates (0% direct-connect everywhere)
 * ├─ Features enabled (streaming only in 3 hubs)
 * ├─ Form fields (6 variants for 6 hub types)
 * ├─ Business rules (verification required, etc.)
 * └─ Analytics (independent GMV per hub)
 * 
 * USAGE EXAMPLES:
 * • getHub('marketplace') → marketplace-specific config
 * • getHubListingLimit('mkulima', 'starter') → 50 listings
 * • isHubAccessible('wholesale', 'starter') → true/false
 * 
 * DATABASE IMPLICATIONS:
 * • Query hub listings: WHERE hub_id = 'mkulima' AND created_by = userId
 * • Query user subscription: WHERE id = userId [NO hub_id filter]
 * • Limit enforcement: Compare against getHubListingLimit(hub, tier)
 * • Feature checks: HUB_CONFIGS[hub].features to show/hide UI
 */

import { HubConfig, HubId, HUB_IDS } from '../types/HubArchitecture';

// ===================================
// HUB: MARKETPLACE (General Commerce)
// ===================================
export const MARKETPLACE_CONFIG: HubConfig = {
  id: HUB_IDS.MARKETPLACE,
  name: 'marketplace',
  displayName: 'Marketplace',
  description: 'Buy and sell anything',
  longDescription:
    'The general marketplace where millions of traders sell thousands of product categories from household items to fresh produce.',

  color: {
    primary: '#3b82f6',   // Blue
    secondary: '#1e40af',
    accent: '#dbeafe',
  },
  icon: 'ShoppingBag',
  bannerImage: '/images/hubs/marketplace-banner.jpg',

  targetAudience: 'General consumers and traders',
  audienceDescription: 'Anyone buying or selling products in Kenya',

  features: {
    listings: { enabled: true, description: 'Create product listings' },
    directContact: { enabled: true, description: 'Contact sellers directly' },
    liveStreaming: { enabled: false, description: 'N/A for general marketplace' },
    bulkPricing: { enabled: false, description: 'Use Wholesale hub for bulk' },
    digitalDownload: { enabled: false, description: 'Use Digital hub for digital goods' },
    servicesBooking: { enabled: false, description: 'Use Services hub for services' },
    shippingIntegration: { enabled: true, description: 'Arrange shipping' },
    analytics: { enabled: true, description: 'View sales analytics' },
    api: { enabled: false, description: 'Available for Pro+ tiers' },
  },

  rules: {
    listingLimits: {
      mkulima: 50,
      starter: 200,
      pro: -1,        // -1 = unlimited
      enterprise: -1,
    },
    allowedCategories: [
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Sports',
      'Toys',
      'Books',
      'Furniture',
      'Beauty',
      'Food & Beverages',
      'Other',
    ],
    minimumTier: 'mkulima',
    commissionPercentage: 0,  // Direct-Connect: 0% commission
    requiresVerification: false,
    requiredDocuments: [],
    allowedCountries: ['KE'],
  },

  routePath: '/hub/marketplace',
  urlSlug: 'marketplace',
  navigationPriority: 1,
  isActive: true,

  metrics: {
    monthlyActiveUsers: 500000,
    totalListings: 2500000,
    gmv: 15000000000,  // 15B KES
  },
};

// ===================================
// HUB: WHOLESALE (B2B Bulk)
// ===================================
export const WHOLESALE_CONFIG: HubConfig = {
  id: HUB_IDS.WHOLESALE,
  name: 'wholesale',
  displayName: 'Wholesale',
  description: 'Bulk buying and selling',
  longDescription:
    'For businesses buying in bulk. Wholesalers list catalogs with volume discounts. Retailers find suppliers.',

  color: {
    primary: '#8b5cf6',   // Purple
    secondary: '#6d28d9',
    accent: '#ede9fe',
  },
  icon: 'Package',
  bannerImage: '/images/hubs/wholesale-banner.jpg',

  targetAudience: 'Business owners and retailers',
  audienceDescription: 'SMEs, retailers, and bulk buyers',

  features: {
    listings: { enabled: true, description: 'Create catalogs' },
    directContact: { enabled: true, description: 'B2B negotiations' },
    liveStreaming: { enabled: false, description: 'Not needed' },
    bulkPricing: { enabled: true, description: 'Volume discounts' },
    digitalDownload: { enabled: false, description: 'Use Digital hub' },
    servicesBooking: { enabled: false, description: 'Use Services hub' },
    shippingIntegration: { enabled: true, description: 'Bulk shipping' },
    analytics: { enabled: true, description: 'Detailed sales analytics' },
    api: { enabled: true, description: 'Available for Pro+ tiers' },
  },

  rules: {
    listingLimits: {
      mkulima: 10,
      starter: 50,
      pro: -1,
      enterprise: -1,
    },
    allowedCategories: [
      'Electronics',
      'Clothing',
      'Food & Beverages',
      'Chemicals',
      'Machinery',
      'Raw Materials',
      'Other',
    ],
    minimumTier: 'starter',
    commissionPercentage: 0,
    requiresVerification: true,
    requiredDocuments: ['national_id', 'business_permit'],
    allowedCountries: ['KE'],
  },

  routePath: '/hub/wholesale',
  urlSlug: 'wholesale',
  navigationPriority: 2,
  isActive: true,

  metrics: {
    monthlyActiveUsers: 50000,
    totalListings: 150000,
    gmv: 5000000000,  // 5B KES
  },
};

// ===================================
// HUB: DIGITAL (Digital Goods & Services)
// ===================================
export const DIGITAL_CONFIG: HubConfig = {
  id: HUB_IDS.DIGITAL,
  name: 'digital',
  displayName: 'Digital Hub',
  description: 'Digital products and courses',
  longDescription:
    'Sell and buy digital products: software, courses, templates, e-books, music, art, and more.',

  color: {
    primary: '#ec4899',   // Pink
    secondary: '#be185d',
    accent: '#fce7f3',
  },
  icon: 'Cloud',
  bannerImage: '/images/hubs/digital-banner.jpg',

  targetAudience: 'Content creators and digital entrepreneurs',
  audienceDescription: 'Creators, educators, and software developers',

  features: {
    listings: { enabled: true, description: 'Upload digital products' },
    directContact: { enabled: false, description: 'Not needed - auto-delivery' },
    liveStreaming: { enabled: false, description: 'Use Live Commerce hub' },
    bulkPricing: { enabled: false, description: 'Not applicable' },
    digitalDownload: { enabled: true, description: 'Instant download' },
    servicesBooking: { enabled: false, description: 'Use Services hub' },
    shippingIntegration: { enabled: false, description: 'Digital only' },
    analytics: { enabled: true, description: 'Download and conversion tracking' },
    api: { enabled: true, description: 'Delivery API available' },
  },

  rules: {
    listingLimits: {
      mkulima: 20,
      starter: 100,
      pro: -1,
      enterprise: -1,
    },
    allowedCategories: [
      'Courses',
      'E-Books',
      'Software',
      'Templates',
      'Themes',
      'Photography',
      'Music',
      'Art',
      'Design',
      'Other',
    ],
    minimumTier: 'starter',
    commissionPercentage: 0,
    requiresVerification: false,
    requiredDocuments: [],
    allowedCountries: ['KE'],
  },

  routePath: '/hub/digital',
  urlSlug: 'digital',
  navigationPriority: 3,
  isActive: true,

  metrics: {
    monthlyActiveUsers: 25000,
    totalListings: 50000,
    gmv: 500000000,  // 500M KES
  },
};

// ===================================
// HUB: MKULIMA MDOGO (Farmers - PRIORITY)
// ===================================
export const MKULIMA_CONFIG: HubConfig = {
  id: HUB_IDS.MKULIMA,
  name: 'mkulima',
  displayName: 'Mkulima Mdogo',
  description: '🌾 Safe & Supported for Farmers',
  longDescription:
    'Special hub for small farmers and agricultural producers. Subsidized pricing (1,500 KES/year). Direct market access without intermediaries.',

  color: {
    primary: '#10b981',   // Green
    secondary: '#047857',
    accent: '#d1fae5',
  },
  icon: 'Leaf',
  logo: '/logos/mkulima-logo.svg',
  bannerImage: '/images/hubs/mkulima-banner.jpg',

  targetAudience: 'Small farmers and agricultural producers',
  audienceDescription: 'Smallholder farmers, market vendors, agricultural cooperatives',

  features: {
    listings: { enabled: true, description: 'List harvest' },
    directContact: { enabled: true, description: 'Buyers find you' },
    liveStreaming: { enabled: true, description: 'Show harvest live' },
    bulkPricing: { enabled: true, description: 'Bulk negotiation' },
    digitalDownload: { enabled: false, description: 'Not applicable' },
    servicesBooking: { enabled: false, description: 'Use Services hub' },
    shippingIntegration: { enabled: true, description: 'Find logistics' },
    analytics: { enabled: true, description: 'Simple sales dashboard' },
    api: { enabled: false, description: 'Not available' },
  },

  rules: {
    listingLimits: {
      mkulima: 50,
      starter: 200,    // If they upgrade to Starter
      pro: -1,
      enterprise: -1,
    },
    allowedCategories: [
      'Vegetables',
      'Fruits',
      'Grains',
      'Livestock',
      'Dairy',
      'Honey',
      'Herbs',
      'Seeds',
      'Other Agricultural',
    ],
    minimumTier: 'mkulima',
    commissionPercentage: 0,
    requiresVerification: false,  // Lower barrier for farmers
    requiredDocuments: [],
    allowedCountries: ['KE'],
    allowedCities: [
      'Nairobi',
      'Kisumu',
      'Nakuru',
      'Eldoret',
      'Mombasa',
      'Kericho',
      'Nyeri',
      'Kiambu',
    ],  // Can expand
  },

  routePath: '/hub/mkulima',
  urlSlug: 'mkulima',
  navigationPriority: 1,  // Top priority
  isActive: true,

  launchDate: '2026-01-15',
  isComingSoon: false,

  metrics: {
    monthlyActiveUsers: 100000,
    totalListings: 250000,
    gmv: 2000000000,  // 2B KES
  },
};

// ===================================
// HUB: SERVICES (Freelance & Professional Services)
// ===================================
export const SERVICES_CONFIG: HubConfig = {
  id: HUB_IDS.SERVICES,
  name: 'services',
  displayName: 'Services Hub',
  description: 'Professional services and freelance work',
  longDescription:
    'Find and hire professionals: plumbing, electrical work, cleaning, consulting, design, and more.',

  color: {
    primary: '#f59e0b',   // Amber
    secondary: '#d97706',
    accent: '#fef3c7',
  },
  icon: 'Briefcase',
  bannerImage: '/images/hubs/services-banner.jpg',

  targetAudience: 'Service providers and consumers',
  audienceDescription: 'Freelancers, professionals, and service seekers',

  features: {
    listings: { enabled: true, description: 'Offer services' },
    directContact: { enabled: true, description: 'Booking and negotiation' },
    liveStreaming: { enabled: false, description: 'Not applicable' },
    bulkPricing: { enabled: false, description: 'Not applicable' },
    digitalDownload: { enabled: false, description: 'Not applicable' },
    servicesBooking: { enabled: true, description: 'Calendar booking' },
    shippingIntegration: { enabled: false, description: 'Not applicable' },
    analytics: { enabled: true, description: 'Booking and rating analytics' },
    api: { enabled: true, description: 'Available for Pro+ tiers' },
  },

  rules: {
    listingLimits: {
      mkulima: 5,
      starter: 20,
      pro: -1,
      enterprise: -1,
    },
    allowedCategories: [
      'Plumbing',
      'Electrical',
      'Cleaning',
      'Consulting',
      'Design',
      'Photography',
      'Writing',
      'Tutoring',
      'Other',
    ],
    minimumTier: 'starter',
    commissionPercentage: 0,
    requiresVerification: true,
    requiredDocuments: ['national_id'],
    allowedCountries: ['KE'],
  },

  routePath: '/hub/services',
  urlSlug: 'services',
  navigationPriority: 4,
  isActive: true,

  metrics: {
    monthlyActiveUsers: 30000,
    totalListings: 75000,
    gmv: 300000000,  // 300M KES
  },
};

// ===================================
// HUB: LIVE COMMERCE (Real-time Streaming Sales)
// ===================================
export const LIVE_COMMERCE_CONFIG: HubConfig = {
  id: HUB_IDS.LIVE_COMMERCE,
  name: 'live_commerce',
  displayName: 'Live Commerce',
  description: '🎥 Real-time streaming sales',
  longDescription:
    'Go live and sell in real-time. Broadcast your products, answer questions, and complete sales while streaming.',

  color: {
    primary: '#ef4444',   // Red
    secondary: '#dc2626',
    accent: '#fee2e2',
  },
  icon: 'Radio',
  bannerImage: '/images/hubs/live-commerce-banner.jpg',

  targetAudience: 'Live sellers and engaged viewers',
  audienceDescription: 'Content creators, brands, and interactive shoppers',

  features: {
    listings: { enabled: true, description: 'Streaming listings' },
    directContact: { enabled: true, description: 'Live chat with viewers' },
    liveStreaming: { enabled: true, description: '⭐ Core feature' },
    bulkPricing: { enabled: false, description: 'Limited for live' },
    digitalDownload: { enabled: false, description: 'Use Digital hub' },
    servicesBooking: { enabled: false, description: 'Not applicable' },
    shippingIntegration: { enabled: true, description: 'Arrange during stream' },
    analytics: { enabled: true, description: 'Live viewer and conversion metrics' },
    api: { enabled: true, description: 'Streaming API available' },
  },

  rules: {
    listingLimits: {
      mkulima: 0,         // Requires Pro minimum
      starter: 0,         // Requires Pro minimum
      pro: 5,             // 5 concurrent streams
      enterprise: -1,     // Unlimited
    },
    allowedCategories: [
      'Electronics',
      'Fashion',
      'Food',
      'Beauty',
      'Home',
      'Handmade',
      'Other',
    ],
    minimumTier: 'pro',   // Requires Pro subscription minimum
    commissionPercentage: 0,
    requiresVerification: true,
    requiredDocuments: ['national_id', 'business_permit'],
    allowedCountries: ['KE'],
  },

  routePath: '/hub/live-commerce',
  urlSlug: 'live-commerce',
  navigationPriority: 5,
  isActive: true,

  launchDate: '2026-03-01',
  isComingSoon: false,

  metrics: {
    monthlyActiveUsers: 10000,
    totalListings: 5000,
    gmv: 200000000,  // 200M KES
  },
};

// ===================================
// HUB REGISTRY (Source of Truth)
// ===================================

export const HUB_CONFIGS: Record<HubId, HubConfig> = {
  [HUB_IDS.MARKETPLACE]: MARKETPLACE_CONFIG,
  [HUB_IDS.WHOLESALE]: WHOLESALE_CONFIG,
  [HUB_IDS.DIGITAL]: DIGITAL_CONFIG,
  [HUB_IDS.MKULIMA]: MKULIMA_CONFIG,
  [HUB_IDS.SERVICES]: SERVICES_CONFIG,
  [HUB_IDS.LIVE_COMMERCE]: LIVE_COMMERCE_CONFIG,
};

// ===================================
// HUB UTILITIES
// ===================================

export function getHub(hubId: HubId): HubConfig | null {
  return HUB_CONFIGS[hubId] || null;
}

export function getAllHubs(): HubConfig[] {
  return Object.values(HUB_CONFIGS).sort((a, b) => a.navigationPriority - b.navigationPriority);
}

export function getActiveHubs(): HubConfig[] {
  return getAllHubs().filter((hub) => hub.isActive);
}

export function getComingSoonHubs(): HubConfig[] {
  return getAllHubs().filter((hub) => hub.isComingSoon);
}

export function getHubBySlug(slug: string): HubConfig | null {
  return Object.values(HUB_CONFIGS).find((hub) => hub.urlSlug === slug) || null;
}

export function getHubListingLimit(hubId: HubId, tier: 'mkulima' | 'starter' | 'pro' | 'enterprise'): number {
  const hub = getHub(hubId);
  if (!hub) return 0;
  const limit = hub.rules.listingLimits[tier];
  return limit === -1 ? Infinity : limit;
}

export function isHubAccessible(hubId: HubId, userTier?: string): boolean {
  const hub = getHub(hubId);
  if (!hub) return false;
  if (!hub.isActive && !hub.isComingSoon) return false;
  if (hub.isComingSoon) return false;

  if (!userTier) return true;

  // Check minimum tier requirement
  const tierOrder: Record<string, number> = {
    mkulima: 0,
    starter: 1,
    pro: 2,
    enterprise: 3,
  };

  const userTierLevel = tierOrder[userTier] ?? -1;
  const minimumTierLevel = tierOrder[hub.rules.minimumTier] ?? 0;

  return userTierLevel >= minimumTierLevel;
}
