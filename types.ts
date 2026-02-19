export type UserRole = 'buyer' | 'seller' | 'wholesaler' | 'service_provider' | 'admin';

export interface Review {
  id?: string;
  listingId?: string;
  sellerId?: string;
  buyerId?: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ListingComment {
  id?: string;
  listingId?: string;
  sellerId?: string;
  buyerId?: string;
  author: string;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  avatar: string;
  subscriptionExpiry: number | null;
  bio?: string;
  contactPhone?: string;
  workingHours?: string;
  accountStatus: 'pending' | 'active' | 'suspended';
  reviews?: Review[];
  joinDate: string;
  following: string[]; // List of IDs of sellers this user follows
  followers?: string[];
  acceptedTermsTimestamp?: number | null;
  nationalId?: string;
  businessName?: string;
  businessCategory?: string;
  businessType?: 'individual' | 'registered_business';
  isSeller?: boolean;  // Optional: so you can distinguish buyers from sellers
  badges?: SellerBadge[];
  topBadge?: SellerBadge;
  badgeCount?: number;
}

export interface Product {
  id:string;
  title: string;
  price?: number;
  currency: string;
  image?: string;
  category: string;
  isWholesale: boolean;
  minOrder?: number;
  verified: boolean;
  sellerId: string;
  sellerName: string;
  seller_phone?: string;
  seller_subscription_tier?: 'free' | 'starter' | 'pro' | 'enterprise' | 'mkulima';
  description: string;
  gallery?: string[];
  video?: string[];
  county?: string;
  town?: string;
  status: 'Active' | 'Out of Stock' | 'Hidden';
  listingStatus: 'pending' | 'active' | 'rejected';
  isDigital?: boolean;
  averageRating?: number;
  reviewCount?: number;
  paymentArrangement?: 'jiji_direct' | 'mpesa' | 'cash_on_delivery' | 'bank_transfer';
  isBoosted?: boolean;
  boostExpiresAt?: string;
  boostTier?: 'quick' | 'standard' | 'premium' | 'power_bundle';
}

export interface FeaturedListing {
  id: string;
  listingId: string;
  sellerId: string;
  featuredStartDate: string;
  featuredEndDate: string;
  durationDays: number;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  status: 'active' | 'expired' | 'cancelled';
  mpesaReceiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Boost {
  id: string;
  listingId: string;
  sellerId: string;
  boostTier: 'quick' | 'standard' | 'premium' | 'power_bundle';
  activatedAt: string;
  expiresAt: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  status: 'active' | 'expired' | 'cancelled';
  impressions: number;
  clicks: number;
  mpesaReceiptNumber?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  sellerId: string;
  listingId?: string;
  adType: 'category_tag' | 'search_result' | 'hub_banner' | 'carousel';
  targetCategory?: string;
  targetKeyword?: string;
  targetLocation?: string;
  displayName: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  dailyBudget: number;
  totalSpent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  currency: string;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  paymentSchedule: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

export interface SellerBadge {
  id: string;
  sellerId: string;
  badgeType: 'verified' | 'premium_member' | 'trusted_seller' | 'super_seller' | 'exclusive_partner' | 'speed_shipper' | 'eco_seller' | 'best_value';
  isActive: boolean;
  earnedDate: string;
  expiresAt?: string;
  autoRenew: boolean;
  amountPaid?: number;
  currency?: string;
  paymentMethod?: string;
  mpesaReceiptNumber?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled';
  shippingAddress: string;
}

export interface Service {
  id: string;
  name: string;
  provider: string;
  provider_id?: string;
  provider_phone?: string;
  provider_subscription_tier?: 'free' | 'starter' | 'pro' | 'enterprise' | 'mkulima';
  category: string;
  hourlyRate: number;
  verified: boolean;
  rating: number;
  image: string;
}

export interface LiveStream {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  featuredProductId: string;
  status: 'live' | 'upcoming' | 'ended'; // Union type ensures only these 3 states are used
  viewerCount: number;
  violationReason?: string;
  thumbnailUrl?: string;
}

export interface Post {
  id: string;
  authorId: string;    // Matches a User's id
  text: string;
  timestamp: string;   // ISO format recommended (e.g., "2024-03-20T10:00:00Z")
  imageUrl?: string;   // Optional: some posts might just be text
  productId?: string;  // Optional: links the post to a specific item for sale
}

export interface BuyingRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  timestamp: string;
  title: string;
  category: string;
  quantity: string;
  description: string;
}

// BULK SELLING - Sellers post bulk offerings in Wholesale Hub
export interface BulkOffering {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail?: string;
  title: string;
  description: string;
  category: string;
  quantityAvailable: number;
  unit: string; // units, kg, meters, liters, sets, pieces, boxes, tons
  pricePerUnit: number;
  minOrderQuantity: number;
  totalValue: number;
  postedDate: string;
  hub: 'wholesale' | 'services' | 'digital';
  verifiedSeller?: boolean;
  responses?: number;
  status?: 'active' | 'sold_out' | 'inactive';
  viewsCount?: number;
  commentsCount?: number;
  followersCount?: number;
  photos?: string[];
  videos?: string[];
}

export interface SecondhandListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  sellerEmail?: string;
  title: string;
  description?: string;
  price: number;
  condition: 'new' | 'like_new' | 'used' | 'fair';
  category?: string;
  county?: string;
  city?: string;
  status?: 'active' | 'sold' | 'inactive';
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  moderationNotes?: string;
  viewsCount?: number;
  commentsCount?: number;
  photos?: string[];
  videos?: string[];
  createdAt?: string;
}

// BULK INQUIRIES - Buyers inquire about bulk offerings
export interface BulkInquiry {
  id: string;
  offering_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  requested_quantity: number;
  status: 'new' | 'replied' | 'converted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export type ViewState = 'home' | 'marketplace' | 'wholesale' | 'importlinkGlobal' | 'secondhand' | 'services' | 'dashboard' | 'admin' | 'digital' | 'live' | 'banned' | 'farmers' | 'seller';

export interface CartItem extends Product {
  quantity: number;
}
export interface FarmerProfile extends User {
  phone: string;          // e.g., "0712345678" for direct calls/WhatsApp
  location: string;       // e.g., "Karatina, Nyeri" or "Chuka, Meru"
  email?: string;         // Optional for more formal wholesale inquiries
  crop: string;           // The main produce (e.g., "Madizi")
  // subscriptionExpiry is inherited from User as `number | null`
  coordinates: {
    lat: number; // e.g., -0.4167 for Nyeri
    lng: number; // e.g., 36.9500
  };
  county: string; // Used for the "County View" filter
  distance?: number; // Optional: Calculated distance from the buyer
  pricePerUnit: number; // e.g., 500
  unit: string; // e.g., "bunch", "kg"
  deliveryInsight?: string; // Generated by AI
}

// ======================================
// PAMBO 6-IN-1 MARKETPLACE CONTRACT
// ======================================

// 1. Define the 6 Hubs
export type PamboHub = 
  | 'marketplace'   // Sell/Buy (Jiji style)
  | 'wholesale'     // Bulk Hub (Alibaba style)
  | 'digital'       // Software/E-books
  | 'farmer'        // Mkulima Mdogo (1,500/year offer)
  | 'service'       // Pros/Handymen (Offspring Decor style)
  | 'live';         // Live Streaming Commerce

// 2. Status for Listings
export type ListingStatus = 'draft' | 'active' | 'paused' | 'sold' | 'banned' | 'pending_review';

// 3. Currency (KES for Kenya)
export type Currency = 'KES' | 'USD';

// 4. The Core Contract for all Listings
export interface PamboListing {
  // === CORE FIELDS ===
  id: string;
  hub: PamboHub;
  title: string;
  description: string;
  price: number;
  currency: Currency;           // KES is default
  sellerId: string;
  status: ListingStatus;
  location: string;             // Crucial for the Map and Distance Calculator
  
  // === MEDIA ===
  images: string[];             // Array of image URLs
  thumbnail?: string;           // Main display image
  videoUrl?: string;            // For live commerce or product demos
  
  // === TIMESTAMPS ===
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // === ENGAGEMENT ===
  rating: number;               // 1-5 stars
  reviewCount: number;
  viewCount: number;
  favoritedBy?: string[];        // Array of user IDs who favorited
  
  // === CATEGORY & TAGS ===
  category: string;             // e.g., "Electronics", "Fashion", "Agriculture"
  subcategory?: string;         // e.g., "Phones", "Laptops"
  tags: string[];               // For filtering: "organic", "certified", "bulk-friendly"
  
  // ============================================
  // HUB-SPECIFIC FIELDS (Optional based on hub)
  // ============================================
  
  // MARKETPLACE HUB ONLY
  shipping?: {
    availableCounties: string[];
    shippingFee?: number;
    freeShippingThreshold?: number;
    estimatedDays: number;
  };
  stock?: number;               // Inventory count
  
  // WHOLESALE HUB ONLY
  moq?: number;                 // Minimum Order Quantity (e.g., 50 units)
  bulkPricing?: Array<{         // Tiered pricing for bulk orders
    quantity: number;
    price: number;
  }>;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;             // in kg
  };
  
  // DIGITAL HUB ONLY
  downloadLink?: string;        // The link sent after M-Pesa payment
  fileSize?: number;            // in MB
  fileType?: string;            // PDF, ZIP, MP4, etc.
  licenseType?: 'single' | 'team' | 'enterprise';
  accessDuration?: number;      // in days, 0 = lifetime
  
  // FARMER HUB ONLY
  isFarmerVerified?: boolean;   // Unlocked by the 1,500 KES annual fee
  farmName?: string;
  farmCoordinates?: {
    latitude: number;
    longitude: number;
  };
  harvestSeason?: string;       // e.g., "March - June"
  farmCertifications?: string[]; // e.g., ["Organic", "Fair Trade"]
  
  // SERVICE HUB ONLY
  hourlyRate?: number;          // For services
  serviceType?: string;         // e.g., "Plumbing", "Interior Design"
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  availability?: {
    hours: {
      monFri: string;           // e.g., "9:00 AM - 5:00 PM"
      saturday: string;
      sunday: string;
    };
    respondTime?: number;        // in hours
  };
  portfolio?: string[];         // URLs to previous work
  certifications?: string[];    // Professional certifications
  
  // LIVE COMMERCE HUB ONLY
  isLiveNow?: boolean;          // Shows the "Pulse" animation on the feed
  streamUrl?: string;           // RTMP or HLS stream URL
  streamStartTime?: Date;
  streamEndTime?: Date;
  liveViewerCount?: number;
  liveChannelId?: string;       // For linking to streaming service
  scheduleNextLive?: Date;      // When the seller will go live again
  
  // === SELLER CONTACT ===
  sellerPhone?: string;
  sellerEmail?: string;
  whatsappNumber?: string;      // Popular in Kenya
  
  // === METADATA ===
  boost?: {
    isBoosted: boolean;
    boostEndDate?: Date;
    boostLevel?: 'standard' | 'premium' | 'featured';
  };
  isVerified?: boolean;         // Seller is verified
  flags?: string[];             // Internal flags: "inappropriate", "pending", etc.
}

// 5. Hub-Specific Listing Interfaces (for type safety)
export interface MarketplaceListing extends PamboListing {
  hub: 'marketplace';
  shipping: { availableCounties: string[]; shippingFee?: number; estimatedDays: number };
  stock: number;
}

export interface WholesaleListing extends PamboListing {
  hub: 'wholesale';
  moq: number;
  bulkPricing: Array<{ quantity: number; price: number }>;
  dimensions: { length: number; width: number; height: number; weight: number };
}

export interface DigitalListing extends PamboListing {
  hub: 'digital';
  downloadLink: string;
  fileSize: number;
  fileType: string;
  accessDuration?: number;
}

export interface FarmerListing extends PamboListing {
  hub: 'farmer';
  isFarmerVerified: boolean;
  farmName: string;
  farmCoordinates: { latitude: number; longitude: number };
}

export interface ServiceListing extends PamboListing {
  hub: 'service';
  hourlyRate: number;
  serviceType: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  availability: { hours: { monFri: string; saturday: string; sunday: string }; respondTime?: number };
}

export interface LiveListing extends PamboListing {
  hub: 'live';
  isLiveNow: boolean;
  streamUrl: string;
  liveViewerCount: number;
  scheduleNextLive?: Date;
}

// 6. Pambo Orders/Transactions
export interface PamboOrder {
  id: string;
  buyerId: string;
  listings: Array<{
    listingId: string;
    quantity: number;
    pricePerUnit: number;
  }>;
  totalAmount: number;
  currency: Currency;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  paymentMethod: 'mpesa' | 'card' | 'wallet';
  transactionId?: string;       // M-Pesa transaction ID
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: string;
}

// 7. Pambo Reviews
export interface PamboReview {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  rating: number;               // 1-5 stars
  comment: string;
  images?: string[];
  helpfulCount: number;
  createdAt: Date;
}