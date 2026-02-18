import { Service, BuyingRequest } from './types';
import { Shirt, Zap, Settings, Home, Heart, Hammer, Car, Leaf, Gem, Gamepad, BookOpen, Brush, Code, LayoutGrid } from 'lucide-react';

// ============================================
// PLATFORM CONFIGURATION
// ============================================
export const PLATFORM_CONFIG = {
  domain: 'pambo.biz',
  name: 'Pambo',
  tagline: 'The 6-in-1 Trade Hub by Offspring Decor Limited',
  companyName: 'Offspring Decor Limited',
  supportEmail: 'support@pambo.biz',
  adminEmail: 'info@pambo.biz',
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
    features: ['Wholesale Hub', 'Services Hub', 'Digital Products', 'Up to 500 Listings', 'Priority Support']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise (Live Commerce)',
    price: 9000,
    billing_period: 'MONTHLY',
    description: 'For large-scale brands',
    color: '#f59e0b', // amber
    hubs: ['marketplace', 'wholesale', 'services', 'digital', 'mkulima', 'live_commerce'],
    features: ['All 6 Hubs Unlocked', 'Unlimited Listings', 'Live Streaming', 'Advanced Analytics', '24/7 Support']
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
// FEATURED LISTINGS PRICING
// ============================================
export const FEATURED_LISTING_PRICE = 500; // KES for 7 days
export const FEATURED_LISTING_DURATION_DAYS = 7;
export const FEATURED_LISTING_CURRENCY = 'KES';

// ============================================
// PRODUCTION CONSTANTS (Real Data Only)
// ============================================
// All MOCK_PRODUCTS and MOCK_SELLERS have been removed
// Use realtimeDataService.ts to fetch real data from Supabase

export const SECTION_BANNERS = {
  marketplace: {
    title: 'Pambo Marketplace',
    subtitle: 'Discover millions of products from verified sellers across Kenya.',
    imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Start Selling Today',
    ctaActionType: 'startSellingProduct'
  },
  wholesale: {
    title: 'Wholesale Hub',
    subtitle: 'Source - buy Direct from Supplier. Direct Factory Prices, Verified Wholesale Suppliers, Wholesale Marketplace',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-5278e6844bdd?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Shop Wholesale',
    ctaActionType: 'shopWholesale'
  },
  services: {
    title: 'Professional Services',
    subtitle: 'Find and hire trusted local professionals for any task, big or small.',
    imageUrl: 'https://images.unsplash.com/photo-1581092921462-2b7e283a3a4b?q=80&w=1974&auto=format&fit=crop',
    ctaText: 'Offer Your Services',
    ctaActionType: 'startSellingService'
  },
  digital: {
      title: 'Digital Products',
      subtitle: 'Instantly download courses, e-books, software, and more.',
      imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=2070&auto=format&fit=crop',
      ctaText: 'Sell Digital Goods',
      ctaActionType: 'startSellingDigital'
  },
  farmers: {
    title: 'Pambo Mkulima Mdogo',
    subtitle: 'Connect your farm directly to the market. We find buyers for your produce, you focus on farming.',
    imageUrl: 'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1887&auto=format&fit=crop',
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
    description: 'Connect your farm to market. KES 1,500 for 1 YEAR!',
  },
  starter: {
    amount: 3500,
    period: 'Monthly',
    periodDays: 30,
    name: 'Starter',
    description: 'Perfect for getting started',
  },
  pro: {
    amount: 5000,
    period: 'Monthly',
    periodDays: 30,
    name: 'Pro',
    description: 'Best for growing businesses',
  },
  enterprise: {
    amount: 9000,
    period: 'Monthly',
    periodDays: 30,
    name: 'Enterprise',
    description: 'For large-scale operations',
  },
};

export const SUBSCRIPTION_FEE = 3500; // Default (for backwards compatibility)
export const FREE_LISTING_LIMIT = 5;

// New Detailed Category Structure
export const DETAILED_PRODUCT_CATEGORIES = [
    {
        name: 'Apparel & Fashion',
        icon: Shirt,
        subcategories: ["Men's Clothing", "Women's Clothing", "Children's Wear", "Footwear", "Accessories", "Lingerie & Sleepwear"]
    },
    {
        name: 'Consumer Electronics',
        icon: Zap,
        subcategories: ["Phones & Tablets", "Laptops & Computers", "Camera & Photo", "Home Audio & Video", "Portable Audio", "Video Games"]
    },
    {
        name: 'Machinery & Industrial Parts',
        icon: Settings,
        subcategories: ["General Industrial Equipment", "Welding & Soldering Supplies", "Power Tools", "Pumps & Parts", "Engines & Parts"]
    },
    {
        name: 'Home, Garden & Furniture',
        icon: Home,
        subcategories: ["Furniture", "Home Decor", "Kitchen & Dining", "Gardening Supplies", "Home Appliances", "Lighting"]
    },
    {
        name: 'Beauty & Personal Care',
        icon: Heart,
        subcategories: ["Skincare", "Hair Care & Styling", "Makeup", "Fragrances", "Personal Hygiene", "Men's Grooming"]
    },
    {
        name: 'Construction & Real Estate',
        icon: Hammer,
        subcategories: ["Building Materials", "Hardware", "Plumbing & Bathroom", "Electrical Supplies", "Windows & Doors"]
    },
    {
        name: 'Vehicle Parts & Accessories',
        icon: Car,
        subcategories: ["Car Electronics", "Interior Accessories", "Exterior Accessories", "Motorcycle Parts", "Tires & Wheels"]
    },
    {
        name: 'Agriculture & Food',
        icon: Leaf,
        subcategories: ["Farm Machinery", "Agrochemicals", "Fresh Produce", "Packaged Foods", "Beverages"]
    },
    {
        name: 'Minerals & Metallurgy',
        icon: Gem,
        subcategories: ["Steel & Alloys", "Precious Metals", "Industrial Minerals", "Gemstones"]
    },
    {
        name: 'Sports & Entertainment',
        icon: Gamepad,
        subcategories: ["Fitness & Gym Equipment", "Team Sports", "Outdoor Sports", "Musical Instruments", "Toys & Hobbies"]
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
        subcategories: ["Office & School Supplies", "Packaging & Printing", "Gifts & Crafts", "Safety & Security"]
    }
];

// Flattened list for simple dropdowns
export const PRODUCT_CATEGORIES = DETAILED_PRODUCT_CATEGORIES.flatMap(cat => cat.subcategories);

export const SERVICE_CATEGORY_BROWSE_LIST = [
  { name: 'Handyman', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=870&auto=format&fit=crop' },
  { name: 'Interior Painter', image: 'https://images.unsplash.com/photo-1596799321942-332d56a7f0e2?q=80&w=870&auto=format&fit=crop' },
  { name: 'Carpet Cleaning', image: 'https://images.unsplash.com/photo-1598211053429-24753a0cec46?q=80&w=870&auto=format&fit=crop' },
  { name: 'Solar Installations', image: 'https://images.unsplash.com/photo-1508935495248-35436ee3aa82?q=80&w=870&auto=format&fit=crop' },
  { name: 'Barber', image: 'https://images.unsplash.com/photo-1621607512214-6c3490343443?q=80&w=870&auto=format&fit=crop' },
  { name: 'Tailor', image: 'https://images.unsplash.com/photo-1550974868-9a6f3a3a40b2?q=80&w=870&auto=format&fit=crop' },
  { name: 'Laundry Services (Mama Fua)', image: 'https://images.unsplash.com/photo-1545174787-a0651a025622?q=80&w=870&auto=format&fit=crop' },
  { name: 'Water Delivery', image: 'https://images.unsplash.com/photo-1598214886343-7b4155f9f6b6?q=80&w=870&auto=format&fit=crop' },
  { name: 'Photographer', image: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?q=80&w=870&auto=format&fit=crop' },
  { name: 'Home Cleaner', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=870&auto=format&fit=crop' },
  { name: 'CCTV Installer', image: 'https://images.unsplash.com/photo-1589938703521-43340ae25555?q=80&w=870&auto=format&fit=crop' },
  { name: 'Event DJ', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=774&auto-format&fit=crop' },
];

export const SERVICE_CATEGORIES = [
    "Accountant", "Appliance Repair", "Architect", "Barber", "Carpenter", "Carpet Cleaning",
    "Catering Services", "CCTV Installer", "DSTV Installer", "Electrician", "Event DJ",
    "Event Planner", "Gardener", "Garbage Disposal", "General Contractor", "Graphic Designer",
    "Hair Stylist", "Handyman", "Home Cleaner", "Interior Painter", "Landscaper",
    "Laundry Services (Mama Fua)", "Lawyer", "Logistics Services", "Mechanic", "Movers",
    "Photographer", "Plumber", "Smart Home Installs", "Solar Installations", "Tailor",
    "Tutor", "Water Delivery", "Web Developer", "Welder",
];

export const KENYA_COUNTIES = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
    "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia",
    "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
    "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
    "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

export const MAJOR_TOWNS = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Kakamega",
    "Nyeri", "Meru", "Lamu", "Machakos", "Naivasha", "Athi River", "Kisii", "Embu", "Kericho", "Voi"
];

export const FUEL_RATE_PER_KM = 25; // KES per KM for delivery calculation
export const BASE_DELIVERY_FEE = 500; // Base fee for any delivery