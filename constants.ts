import { Service, BuyingRequest } from './types';
import {
  Shirt,
  Zap,
  Settings,
  Home,
  Heart,
  Hammer,
  Car,
  Leaf,
  Gem,
  Gamepad,
  BookOpen,
  Brush,
  Code,
  LayoutGrid
} from 'lucide-react';

// ============================================
// PLATFORM CONFIGURATION
// ============================================
export const PLATFORM_CONFIG = {
  domain: 'pambo.biz',
  name: 'Pambo',
  tagline: 'The 6-in-1 Trade Hub by Offspring Decor Limited',
  companyName: 'Offspring Decor Limited',
  supportEmail: 'support@pambo.biz',
  adminEmail: 'info@pambo.biz'
};

// ============================================
// SUBSCRIPTION TIERS & PRICING (KES)
// ============================================
export const SUBSCRIPTION_TIERS = {
  mkulima: {
    id: 'mkulima',
    name: 'Mkulima (Farmer)',
    price: 1500,
    billing_period: 'YEARLY',
    description: 'Special 1-year offer for volume farmers',
    color: '#10b981', // green
    hubs: ['mkulima'],
    features: ['Mkulima Hub Access', 'Direct Buyer Connection', 'WhatsApp Integration']
  },
  starter: {
    id: 'starter',
    name: 'Starter (Marketplace)',
    price: 3500,
    billing_period: 'MONTHLY',
    description: 'Perfect for new sellers',
    color: '#3b82f6', // blue
    hubs: ['marketplace'],
    features: ['Marketplace Hub', 'Up to 50 Listings', 'Direct Communication']
  },
  pro: {
    id: 'pro',
    name: 'Pro (Wholesale/Services)',
    price: 5000,
    billing_period: 'MONTHLY',
    description: 'For growing businesses',
    color: '#8b5cf6', // purple
    hubs: ['wholesale', 'services', 'digital'],
    features: [
      'Wholesale Hub',
      'Services Hub',
      'Digital Products',
      'Up to 500 Listings',
      'Priority Support'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise (Live Commerce)',
    price: 9000,
    billing_period: 'MONTHLY',
    description: 'For large-scale brands',
    color: '#f59e0b', // amber
    hubs: ['marketplace', 'wholesale', 'services', 'digital', 'mkulima', 'live_commerce'],
    features: [
      'All 6 Hubs Unlocked',
      'Unlimited Listings',
      'Live Streaming',
      'Advanced Analytics',
      '24/7 Support'
    ]
  }
};

// ============================================
// HUB ACCESS MAPPING
// ============================================
export const HUB_ACCESS = {
  mkulima: ['mkulima'],
  starter: ['marketplace'],
  pro: ['wholesale', 'services', 'digital'],
  enterprise: ['marketplace', 'wholesale', 'services', 'digital', 'mkulima', 'live_commerce']
};

// ============================================
// COMMISSION & PAYMENTS
// ============================================
export const COMMISSION_RATE = 0; // 0% - Sellers keep 100%
export const PAYMENT_MODEL = 'DIRECT_CONNECT'; // No escrow - direct to seller

// ============================================
// M-PESA PAYBILL CONFIGURATION
// ============================================
export const MPESA_PAYBILL = {
  number: '800800', // Pambo PayBill number
  accountReference: 'PAMBO', // Account reference for payments
  name: 'Pambo Hub', // Business name
  phone: '+254700000000' // Support phone
};

// Subscription tiers for M-Pesa payments
export const MPESA_SUBSCRIPTION_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 3500,
    currency: 'KES',
    duration_days: 30,
    features: [
      'Marketplace Hub Access',
      'Up to 4 images per listing',
      'Up to 50 active listings',
      'Direct buyer communication'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 5000,
    currency: 'KES',
    duration_days: 30,
    features: [
      'All Starter features',
      'Up to 8 images per listing',
      'Wholesale + Services access',
      'Up to 500 active listings',
      'Priority customer support'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9000,
    currency: 'KES',
    duration_days: 30,
    features: [
      'All Pro features',
      'Unlimited images per listing',
      'All 6 hubs unlocked',
      'Unlimited active listings',
      'Live streaming access',
      '24/7 dedicated support',
      'Advanced analytics'
    ]
  }
};

// ============================================
// IMAGE UPLOAD LIMITS
// ============================================
export const IMAGE_UPLOAD_LIMITS = {
  free: {
    imagesPerListing: 4,
    totalListings: 10,
    description: 'Free tier - 4 images per listing'
  },
  starter: {
    imagesPerListing: 4,
    totalListings: 50,
    description: 'Starter subscription - 4 images per listing'
  },
  pro: {
    imagesPerListing: 8,
    totalListings: 500,
    description: 'Pro subscription - 8 images per listing'
  },
  enterprise: {
    imagesPerListing: 20,
    totalListings: 'unlimited',
    description: 'Enterprise subscription - 20 images per listing'
  }
};

// ============================================
// FEATURED LISTINGS PRICING
// ============================================
export const FEATURED_LISTING_PRICE = 500; // KES for 7 days
export const FEATURED_LISTING_DURATION_DAYS = 7;
export const FEATURED_LISTING_CURRENCY = 'KES';

// ============================================
// PAID FEATURES: BOOSTS
// ============================================
export const BOOST_TIERS = {
  quick: {
    id: 'quick',
    name: 'Quick Boost',
    duration_hours: 24,
    duration_label: '24 hours',
    estimatedReach: '2,000-3,000',
    price: 150,
    currency: 'KES',
    features: [
      'Pin to top of results',
      'BOOSTED badge',
      'Featured section rotation',
      '+200% engagement'
    ],
    backgroundColor: '#3b82f6' // blue
  },
  standard: {
    id: 'standard',
    name: 'Standard Boost',
    duration_hours: 72,
    duration_label: '3 days',
    estimatedReach: '5,000-8,000',
    price: 350,
    currency: 'KES',
    features: [
      'Pin to top of results',
      'BOOSTED badge',
      'Featured section rotation',
      '+200% engagement',
      'Performance analytics'
    ],
    backgroundColor: '#8b5cf6', // purple
    mostPopular: true
  },
  premium: {
    id: 'premium',
    name: 'Premium Boost',
    duration_hours: 168,
    duration_label: '7 days',
    estimatedReach: '15,000-20,000',
    price: 500,
    currency: 'KES',
    features: [
      'Pin to top of results',
      'BOOSTED badge',
      'Featured section rotation',
      '+200% engagement',
      'Performance analytics',
      'Daily performance reports'
    ],
    backgroundColor: '#f59e0b' // amber
  },
  power_bundle: {
    id: 'power_bundle',
    name: 'Power Bundle',
    duration_hours: 720,
    duration_label: '30 days',
    estimatedReach: '50,000+',
    price: 1200,
    currency: 'KES',
    features: [
      'Pin to top of results',
      'BOOSTED badge',
      'Featured section rotation',
      '+200% engagement',
      'Performance analytics',
      'Daily performance reports',
      'Auto-renewal option'
    ],
    backgroundColor: '#ef4444', // red
    bestValue: true
  }
};

// Boost pricing discounts by subscription tier
export const BOOST_DISCOUNTS = {
  free: 0, // 0% discount = full price
  starter: 0.1, // 10% discount
  pro: 0.2, // 20% discount
  enterprise: 0.3, // 30% discount
  mkulima: 0.1 // 10% discount
};

// ============================================
// PAID FEATURES: ADVERTISEMENTS
// ============================================
export const AD_TYPES = {
  category_tag: {
    id: 'category_tag',
    name: 'Category Tag Ads',
    description: 'Appear above organic results in category',
    dailyPrice: 200,
    currency: 'KES',
    minDays: 1,
    maxDays: 30,
    estimatedImpressions: '5,000-8,000',
    targetingOptions: ['category', 'location']
  },
  search_result: {
    id: 'search_result',
    name: 'Search Result Ads',
    description: 'Show in top 3 when searching specific keywords',
    dailyPrice: 250,
    currency: 'KES',
    minDays: 1,
    maxDays: 30,
    estimatedImpressions: '3,000-6,000',
    targetingOptions: ['keyword', 'location']
  },
  hub_banner: {
    id: 'hub_banner',
    name: 'Hub Banner Ads',
    description: 'Large banner at top of hub sections',
    weeklyPrice: 500,
    currency: 'KES',
    minDays: 7,
    maxDays: 90,
    estimatedImpressions: '50,000+ per week',
    targetingOptions: ['hub']
  },
  carousel: {
    id: 'carousel',
    name: 'Promotion Carousel Ads',
    description: 'Rotation in homepage/hub carousel',
    dailyPrice: 300,
    currency: 'KES',
    minDays: 1,
    maxDays: 30,
    estimatedImpressions: '8,000-12,000',
    targetingOptions: ['category', 'location']
  }
};

// ============================================
// PAID FEATURES: SELLER BADGES
// ============================================
export const SELLER_BADGES = {
  verified: {
    id: 'verified',
    name: 'Verified Seller',
    icon: '✓',
    color: '#10b981', // green
    cost: 0, // Free
    billingPeriod: 'PERMANENT',
    requirements: 'ID verification + good history',
    description: 'Show to buyers that you are a real seller',
    earnedBadge: true
  },
  premium_member: {
    id: 'premium_member',
    name: 'Premium Member',
    icon: '★',
    color: '#f59e0b', // amber
    cost: 500, // KES per month
    billingPeriod: 'MONTHLY',
    requirements: 'Active seller (Pro+ tier)',
    description: 'Premium seller with exclusive perks',
    earnedBadge: false
  },
  trusted_seller: {
    id: 'trusted_seller',
    name: 'Trusted Seller',
    icon: '🛡️',
    color: '#3b82f6', // blue
    cost: 0, // Free
    billingPeriod: 'ROTATES_3_MONTHS',
    requirements: '4.5+ rating, 50+ sales',
    description: 'Proven track record of quality and service',
    earnedBadge: true
  },
  super_seller: {
    id: 'super_seller',
    name: 'Super Seller',
    icon: '🏆',
    color: '#8b5cf6', // purple
    cost: 1000, // KES per month
    billingPeriod: 'MONTHLY',
    requirements: '4.8+ rating, 200+ sales',
    description: 'Top-tier seller with exceptional service',
    earnedBadge: false
  },
  exclusive_partner: {
    id: 'exclusive_partner',
    name: 'Exclusive Partner',
    icon: '◆',
    color: '#ec4899', // pink
    cost: 2000, // KES per month
    billingPeriod: 'MONTHLY',
    requirements: 'Professional account tier',
    description: 'Pambo featured exclusive partnership',
    earnedBadge: false
  },
  speed_shipper: {
    id: 'speed_shipper',
    name: 'Speed Shipper',
    icon: '⚡',
    color: '#ff6b00', // orange
    cost: 300, // KES per month
    billingPeriod: 'MONTHLY',
    requirements: '<2hr response time average',
    description: 'Lightning-fast response and shipping',
    earnedBadge: false
  },
  eco_seller: {
    id: 'eco_seller',
    name: 'Eco-Seller',
    icon: '🌿',
    color: '#10b981', // green
    cost: 0, // Free
    billingPeriod: 'PERMANENT',
    requirements: 'Sustainability certification',
    description: 'Committed to environmental responsibility',
    earnedBadge: true
  },
  best_value: {
    id: 'best_value',
    name: 'Best Value',
    icon: '🔥',
    color: '#ef4444', // red
    cost: 0, // Custom or admin assigned
    billingPeriod: 'VARIABLE',
    requirements: "Editor's choice (admin assigned)",
    description: 'Pambo staff pick for best value',
    earnedBadge: false
  }
};

// Badge pricing discounts by subscription tier
export const BADGE_DISCOUNTS = {
  free: 0, // 0% discount = full price
  starter: 0.1, // 10% discount
  pro: 0.3, // 30% discount
  enterprise: 0.5, // 50% discount
  mkulima: 0.1 // 10% discount
};

// ============================================
// PRODUCTION CONSTANTS (Real Data Only)
// ============================================
// All MOCK_PRODUCTS and MOCK_SELLERS have been removed
// Use realtimeDataService.ts to fetch real data from Supabase

export const SECTION_BANNERS = {
  marketplace: {
    title: 'Retailers Hub Kenya',
    subtitle:
      'Buy direct from local retailers across Kenya. Fair prices, trusted sellers, fast service. Support local, support Kenya.',
    imageUrl:
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Start Selling Today',
    ctaHref: '/seller/register',
    ctaActionType: 'startSellingProduct'
  },
  wholesale: {
    title: 'Wholesale Hub',
    subtitle:
      'Source - buy Direct from Supplier. Direct Factory Prices, Verified Wholesale Suppliers, Wholesale Marketplace',
    imageUrl:
      'https://images.unsplash.com/photo-1578575437130-5278e6844bdd?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Shop Wholesale',
    ctaActionType: 'shopWholesale'
  },
  services: {
    title: 'Professional Services',
    subtitle: 'Find and hire trusted local professionals for any task, big or small.',
    imageUrl:
      'https://images.unsplash.com/photo-1581092921462-2b7e283a3a4b?q=80&w=1974&auto=format&fit=crop',
    ctaText: 'Offer Your Services',
    ctaActionType: 'startSellingService'
  },
  digital: {
    title: 'Digital Products',
    subtitle: 'Instantly download courses, e-books, software, and more.',
    imageUrl:
      'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Sell Digital Goods',
    ctaActionType: 'startSellingDigital'
  },
  farmers: {
    title: 'Pambo Mkulima Mdogo',
    subtitle:
      'Connect your farm directly to the market. We find buyers for your produce, you focus on farming.',
    imageUrl:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1887&auto=format&fit=crop',
    ctaText: 'Join Today',
    ctaActionType: 'joinFarmers'
  }
};

// ============================================
// MOCK DATA REMOVED - USE REAL DATA
// ============================================
// All mock products, sellers, and buying requests have been removed.
//
// To fetch real data from Supabase, use these services:
// - import { fetchMarketplaceListings } from './services/realtimeDataService';
// - import { fetchWholesaleProducts } from './services/realtimeDataService';
// - import { fetchDigitalProducts } from './services/realtimeDataService';
// - import { fetchAllSellers } from './services/realtimeDataService';
// - import { fetchProductsByCategory } from './services/realtimeDataService';
// - import { searchProducts } from './services/realtimeDataService';
//
// Example usage in React:
// const [products, setProducts] = useState<Product[]>([]);
// useEffect(() => {
//   fetchMarketplaceListings().then(setProducts);
// }, []);

export const MOCK_SERVICES: Service[] = [];
export const MOCK_BUYING_REQUESTS: BuyingRequest[] = [];

// =============================================
// OFFSPRING DECOR LIMITED - SUBSCRIPTION PRICING
// =============================================
// NO COMMISSIONS: Sellers keep 100% of sales

export const SUBSCRIPTION_PRICING = {
  mkulima: {
    amount: 1500,
    period: '1 YEAR',
    periodDays: 365,
    name: 'Mkulima Special Offer',
    description: 'Connect your farm to market. KES 1,500 for 1 YEAR!'
  },
  starter: {
    amount: 3500,
    period: 'Monthly',
    periodDays: 30,
    name: 'Starter',
    description: 'Perfect for getting started'
  },
  pro: {
    amount: 5000,
    period: 'Monthly',
    periodDays: 30,
    name: 'Pro',
    description: 'Best for growing businesses'
  },
  enterprise: {
    amount: 9000,
    period: 'Monthly',
    periodDays: 30,
    name: 'Enterprise',
    description: 'For large-scale operations'
  }
};

export const SUBSCRIPTION_FEE = 3500; // Default (for backwards compatibility)
export const FREE_LISTING_LIMIT = 5;

// New Detailed Category Structure
export const DETAILED_PRODUCT_CATEGORIES = [
  {
    name: 'Apparel & Fashion',
    icon: Shirt,
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Children's Wear",
      'Footwear',
      'Accessories',
      'Lingerie & Sleepwear'
    ]
  },
  {
    name: 'Consumer Electronics',
    icon: Zap,
    subcategories: [
      'Phones & Tablets',
      'Laptops & Computers',
      'Camera & Photo',
      'Home Audio & Video',
      'Portable Audio',
      'Video Games'
    ]
  },
  {
    name: 'Machinery & Industrial Parts',
    icon: Settings,
    subcategories: [
      'General Industrial Equipment',
      'Welding & Soldering Supplies',
      'Power Tools',
      'Pumps & Parts',
      'Engines & Parts'
    ]
  },
  {
    name: 'Home, Garden & Furniture',
    icon: Home,
    subcategories: [
      'Furniture',
      'Home Decor',
      'Kitchen & Dining',
      'Gardening Supplies',
      'Home Appliances',
      'Lighting'
    ]
  },
  {
    name: 'Beauty & Personal Care',
    icon: Heart,
    subcategories: [
      'Skincare',
      'Hair Care & Styling',
      'Makeup',
      'Fragrances',
      'Personal Hygiene',
      "Men's Grooming"
    ]
  },
  {
    name: 'Construction & Real Estate',
    icon: Hammer,
    subcategories: [
      'Building Materials',
      'Hardware',
      'Plumbing & Bathroom',
      'Electrical Supplies',
      'Windows & Doors'
    ]
  },
  {
    name: 'Vehicle Parts & Accessories',
    icon: Car,
    subcategories: [
      'Car Electronics',
      'Interior Accessories',
      'Exterior Accessories',
      'Motorcycle Parts',
      'Tires & Wheels'
    ]
  },
  {
    name: 'Agriculture & Food',
    icon: Leaf,
    subcategories: [
      'Farm Machinery',
      'Agrochemicals',
      'Fresh Produce',
      'Packaged Foods',
      'Beverages'
    ]
  },
  {
    name: 'Minerals & Metallurgy',
    icon: Gem,
    subcategories: ['Steel & Alloys', 'Precious Metals', 'Industrial Minerals', 'Gemstones']
  },
  {
    name: 'Sports & Entertainment',
    icon: Gamepad,
    subcategories: [
      'Fitness & Gym Equipment',
      'Team Sports',
      'Outdoor Sports',
      'Musical Instruments',
      'Toys & Hobbies'
    ]
  },
  {
    name: 'Digital Products',
    icon: BookOpen,
    view: 'digital' as const,
    subcategories: ['Online Courses', 'Digital Designs', 'E-books & Guides', 'Software & Apps']
  },
  {
    name: 'Other Categories',
    icon: LayoutGrid,
    subcategories: [
      'Office & School Supplies',
      'Packaging & Printing',
      'Gifts & Crafts',
      'Safety & Security'
    ]
  }
];

// Flattened list for simple dropdowns
export const PRODUCT_CATEGORIES = DETAILED_PRODUCT_CATEGORIES.flatMap((cat) => cat.subcategories);

export const SERVICE_CATEGORY_BROWSE_LIST = [
  {
    name: 'Handyman',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Interior Painter',
    image:
      'https://images.unsplash.com/photo-1596799321942-332d56a7f0e2?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Carpet Cleaning',
    image:
      'https://images.unsplash.com/photo-1598211053429-24753a0cec46?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Solar Installations',
    image:
      'https://images.unsplash.com/photo-1508935495248-35436ee3aa82?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Barber',
    image:
      'https://images.unsplash.com/photo-1621607512214-6c3490343443?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Tailor',
    image:
      'https://images.unsplash.com/photo-1550974868-9a6f3a3a40b2?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Laundry Services (Mama Fua)',
    image:
      'https://images.unsplash.com/photo-1545174787-a0651a025622?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Water Delivery',
    image:
      'https://images.unsplash.com/photo-1598214886343-7b4155f9f6b6?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Photographer',
    image:
      'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Home Cleaner',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'CCTV Installer',
    image:
      'https://images.unsplash.com/photo-1589938703521-43340ae25555?q=80&w=870&auto=format&fit=crop'
  },
  {
    name: 'Event DJ',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=774&auto-format&fit=crop'
  }
];

export const SERVICE_CATEGORIES = [
  'Accountant',
  'Appliance Repair',
  'Architect',
  'Barber',
  'Carpenter',
  'Carpet Cleaning',
  'Catering Services',
  'CCTV Installer',
  'DSTV Installer',
  'Electrician',
  'Event DJ',
  'Event Planner',
  'Gardener',
  'Garbage Disposal',
  'General Contractor',
  'Graphic Designer',
  'Hair Stylist',
  'Handyman',
  'Home Cleaner',
  'Interior Painter',
  'Landscaper',
  'Laundry Services (Mama Fua)',
  'Lawyer',
  'Logistics Services',
  'Mechanic',
  'Movers',
  'Photographer',
  'Plumber',
  'Smart Home Installs',
  'Solar Installations',
  'Tailor',
  'Tutor',
  'Water Delivery',
  'Web Developer',
  'Welder'
];

export const KENYA_COUNTIES = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  "Murang'a",
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot'
];

export const MAJOR_TOWNS = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Kitale',
  'Garissa',
  'Kakamega',
  'Nyeri',
  'Meru',
  'Lamu',
  'Machakos',
  'Naivasha',
  'Athi River',
  'Kisii',
  'Embu',
  'Kericho',
  'Voi'
];

export const FUEL_RATE_PER_KM = 25; // KES per KM for delivery calculation
export const BASE_DELIVERY_FEE = 500; // Base fee for any delivery
