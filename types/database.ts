/**
 * Database Types - Mirror of Supabase Schema
 * These types match the 6-Hub SQL schema exactly as defined in supabase_schema.sql
 */

// ============================================
// USERS TABLE
// ============================================
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'admin';
  verified: boolean;
  accountStatus: 'active' | 'suspended' | 'pending';
  joinDate: string;
  bio?: string;
  following: string[];
  followers: string[];
  acceptedTermsTimestamp?: number;
  nationalId?: string;
  businessName?: string;
  businessCategory?: string;
  businessType?: 'individual' | 'registered_business';
  isSeller: boolean;
  subscriptionExpiry?: number;
  contactPhone?: string;
  workingHours?: string;
  lastActiveDate?: string;
  created_at: string;
}

// ============================================
// LISTINGS TABLE (All 6 Hubs)
// ============================================
export interface DatabaseListing {
  id: string;
  hub: 'marketplace' | 'wholesale' | 'digital' | 'farmer' | 'service' | 'live';
  title: string;
  description?: string;
  price: number;
  currency: string;
  sellerId: string;
  status: 'draft' | 'active' | 'rejected';
  location?: string;
  images: string[];
  thumbnail?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  rating: number;
  reviewCount: number;
  viewCount: number;
  favoritedBy: string[];
  category: string;
  subcategory?: string;
  tags: string[];

  // MARKETPLACE
  shipping?: any;
  stock?: number;

  // WHOLESALE
  moq?: number;
  bulkPricing?: any;
  dimensions?: any;

  // DIGITAL
  downloadLink?: string;
  fileSize?: number;
  fileType?: string;
  licenseType?: string;
  accessDuration?: number;

  // FARMER
  isFarmerVerified?: boolean;
  farmName?: string;
  farmCoordinates?: any;
  harvestSeason?: string;
  farmCertifications?: string[];

  // SERVICE
  hourlyRate?: number;
  serviceType?: string;
  experienceLevel?: string;
  availability?: any;
  portfolio?: string[];
  certifications?: string[];

  // LIVE COMMERCE
  isLiveNow: boolean;
  streamUrl?: string;
  streamStartTime?: string;
  streamEndTime?: string;
  liveViewerCount: number;
  liveChannelId?: string;
  scheduleNextLive?: string;

  // SELLER CONTACT
  sellerPhone?: string;
  sellerEmail?: string;
  whatsappNumber?: string;

  // METADATA
  boost?: any;
  isVerified: boolean;
  flags?: string[];
}

// ============================================
// ORDERS TABLE
// ============================================
export interface DatabaseOrder {
  id: string;
  buyerId: string;
  sellerId: string;
  listings: any;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: string;
  tracking?: any;
}

// ============================================
// REVIEWS TABLE
// ============================================
export interface DatabaseReview {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment?: string;
  images?: string[];
  helpfulCount: number;
  createdAt: string;
}

// ============================================
// PAYMENTS TABLE
// ============================================
export interface DatabasePayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  phone?: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LIVE STREAMS TABLE
// ============================================
export interface DatabaseLiveStream {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  featuredProductId?: string;
  status: 'upcoming' | 'live' | 'ended';
  viewerCount: number;
  startTime: string;
  endTime?: string;
  thumbnailUrl?: string;
  violationReason?: string;
  created_at: string;
}

// ============================================
// FARMER PROFILES TABLE
// ============================================
export interface DatabaseFarmerProfile {
  id: string;
  userId: string;
  phone?: string;
  location?: string;
  crop?: string;
  coordinates?: any;
  county?: string;
  distance?: number;
  pricePerUnit?: number;
  unit?: string;
  deliveryInsight?: string;
  subscriptionEnd?: string;
  isVerified: boolean;
  created_at: string;
}

// ============================================
// POSTS TABLE (Social Feed)
// ============================================
export interface DatabasePost {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  productId?: string;
  likes: string[];
  comments?: any[];
}

// ============================================
// BUYING REQUESTS TABLE (B2B)
// ============================================
export interface DatabaseBuyingRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  timestamp: string;
  title: string;
  category: string;
  quantity: string;
  description: string;
  status: 'open' | 'closed' | 'completed';
}

// ============================================
// FAVORITES TABLE
// ============================================
export interface DatabaseFavorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}
