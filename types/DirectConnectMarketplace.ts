/**
 * DIRECT-CONNECT MARKETPLACE TYPES
 * ================================
 * Pambo.com by Offspring Decor Limited
 * 
 * Architecture: Jiji/Alibaba-style Direct Connect
 * - NO escrow, NO refunds
 * - Sellers & buyers communicate directly (Phone, WhatsApp, Location)
 * - Revenue = Subscriptions only
 * - Trust = Verified seller badges + reporting system + admin kill switch
 */

// ===================================
// SUBSCRIPTION TYPES
// ===================================

export type SubscriptionTier = 'mkulima' | 'starter' | 'pro' | 'enterprise';

export type SubscriptionBadge = 'bronze' | 'silver' | 'gold' | 'platinum';

export const SUBSCRIPTION_CONFIG = {
  mkulima: {
    amount: 1500,           // KES
    period: 'yearly',       // 365 days
    periodDays: 365,
    badge: 'bronze' as SubscriptionBadge,
    displayName: 'Mkulima Mdogo',
    description: 'Perfect for farmers & small traders',
    features: [
      'List up to 50 products',
      'Basic seller profile',
      'Direct buyer contact',
      'Annual subscription',
      'Safe & Supported badge',
    ],
    targetAudience: 'Farmers, small traders',
  },
  starter: {
    amount: 3500,           // KES/Month
    period: 'monthly',      // 30 days
    periodDays: 30,
    badge: 'silver' as SubscriptionBadge,
    displayName: 'Starter',
    description: 'For growing businesses',
    features: [
      'List up to 200 products',
      'Enhanced seller profile',
      'Direct buyer contact',
      'Silver seller badge',
      'Monthly subscription',
    ],
    targetAudience: 'Small businesses',
  },
  pro: {
    amount: 5000,           // KES/Month
    period: 'monthly',      // 30 days
    periodDays: 30,
    badge: 'gold' as SubscriptionBadge,
    displayName: 'Pro',
    description: 'For established sellers',
    features: [
      'Unlimited product listings',
      'Premium seller profile',
      'Priority buyer contact',
      'Gold seller badge',
      'Direct phone support',
    ],
    targetAudience: 'Established sellers',
  },
  enterprise: {
    amount: 9000,           // KES/Month
    period: 'monthly',      // 30 days
    periodDays: 30,
    badge: 'platinum' as SubscriptionBadge,
    displayName: 'Enterprise',
    description: 'For large-scale operations',
    features: [
      'Unlimited products & categories',
      'Dedicated account manager',
      'API access',
      'Platinum seller badge',
      'Priority phone & email support',
      'Advanced analytics',
    ],
    targetAudience: 'Large traders & wholesalers',
  },
} as const;

// ===================================
// SELLER VERIFICATION TYPES
// ===================================

export type VerificationDocumentType = 'national_id' | 'business_permit' | 'tax_certificate' | 'trade_license';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface SellerVerificationDocument {
  id: string;
  seller_id: string;              // references profiles.user_id
  document_type: VerificationDocumentType;
  document_url: string;           // S3/storage URL
  document_number: string;        // ID number, permit number, etc.
  issued_date: string;            // ISO timestamp
  expiry_date?: string;           // ISO timestamp (nullable - some don't expire)
  status: VerificationStatus;
  admin_review_notes?: string;
  reviewed_by_admin?: string;     // admin user_id
  reviewed_at?: string;           // ISO timestamp
  created_at: string;
  updated_at: string;
}

export interface SellerProfile extends ProfileBase {
  // Subscription info
  subscription_tier: SubscriptionTier;
  subscription_badge: SubscriptionBadge;  // Derived from tier
  subscription_expiry: string;    // ISO timestamp
  subscription_start_date: string;
  subscription_period_days: 30 | 365;

  // Verification
  is_verified: boolean;           // At least 1 approved document
  verified_documents_count: number;
  primary_verified_document?: VerificationDocumentType;
  verification_pending: boolean;  // Has documents under review

  // Safety/Status
  is_banned: boolean;
  ban_reason?: string;
  ban_date?: string;
  ban_lifted_date?: string;       // When they appealed & were reinstated

  // Directory Info (Direct Connect)
  phone_number: string;           // Primary contact
  whatsapp_number: string;        // Can be same as phone
  business_name: string;
  business_category?: string;     // e.g. "Wholesale", "Farming", "Electronics"
  business_description?: string;
  map_location?: GeoLocation;     // GPS coordinates for map display

  // Ratings & Trust
  total_listings: number;
  active_listings: number;
  average_rating: number;         // 0-5
  total_ratings_count: number;
  response_time_hours?: number;   // How fast they reply to messages

  // Metadata
  created_at: string;
  updated_at: string;
  last_active?: string;
}

export interface ProfileBase {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  county: string;
  country: string;  // Always "KE" for Kenya
  address?: string;
}

// ===================================
// SAFETY & REPORTING TYPES
// ===================================

export type ReportReason =
  | 'fraud'
  | 'fake_product'
  | 'bad_condition'
  | 'unsafe_behavior'
  | 'harassment'
  | 'spam'
  | 'prohibited_item'
  | 'other';

export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface SellerReport {
  id: string;
  reported_seller_id: string;     // Who's being reported
  reported_by_user_id: string;    // Who reported them
  reason: ReportReason;
  description: string;
  evidence_urls?: string[];       // Screenshots, etc
  status: ReportStatus;
  admin_notes?: string;
  action_taken?: string;          // e.g. "seller_banned", "listing_removed", "warning_issued"
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;               // Who performed action
  action_type: 'ban_seller' | 'unban_seller' | 'delete_listing' | 'review_document' | 'warn_seller';
  target_type: 'seller' | 'listing' | 'report';
  target_id: string;              // seller_id, listing_id, or report_id
  reason: string;
  details?: Record<string, any>;  // Extra context
  created_at: string;
}

// ===================================
// DIRECT CONNECT COMMUNICATION TYPES
// ===================================

export interface SellerDirectoryEntry {
  id: string;
  seller_id: string;
  badge: SubscriptionBadge;
  business_name: string;
  category: string;
  phone: string;
  whatsapp: string;
  map_location: GeoLocation;
  rating: number;
  listings_count: number;
  is_verified: boolean;
  is_online?: boolean;
  last_active?: string;
}

export interface BuyerContactRequest {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  message: string;
  contact_preference: 'phone' | 'whatsapp' | 'email';
  created_at: string;
  seller_responded_at?: string;
}

// ===================================
// PAYMENT & SUBSCRIPTION TYPES
// ===================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  amount: number;                 // KES
  status: PaymentStatus;
  phone_number: string;
  mpesa_receipt_number?: string;
  checkout_request_id?: string;
  payment_method: 'mpesa' | 'cash';
  created_at: string;
  completed_at?: string;
}

export interface Transaction {
  id: string;
  payment_id: string;
  user_id: string;
  mpesa_receipt_number: string;
  phone_number: string;
  amount: number;
  transaction_date: string;
  status: 'completed' | 'failed';
  created_at: string;
}

// ===================================
// LISTING TYPES (Direct Connect)
// ===================================

export interface Listing {
  id: string;
  seller_id: string;              // references profiles.user_id
  title: string;
  description: string;
  category: string;
  price: number;                  // KES
  currency: 'KES';
  images: string[];               // Image URLs
  phone_contact: string;          // Direct seller phone
  whatsapp_contact: string;
  location: GeoLocation;
  
  // Status
  status: 'active' | 'sold' | 'deleted';
  is_featured?: boolean;
  
  // Engagement
  views_count: number;
  contact_requests_count: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  seller_verified_at_time?: string; // For trust display
}

// ===================================
// ORDER TYPES (Minimal - Direct Connect)
// ===================================

export type OrderStatus = 'created' | 'paid' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  amount: number;                 // KES
  status: OrderStatus;
  payment_method: 'mpesa' | 'cash';
  payment_id?: string;            // references payments.id
  mpesa_receipt?: string;
  
  // Direct connect notes
  buyer_message: string;          // What buyer is looking for
  seller_contact_info: {
    phone: string;
    whatsapp: string;
    address: string;
  };
  
  created_at: string;
  updated_at: string;
}

// ===================================
// ANALYTICS (For Sellers)
// ===================================

export interface SellerAnalytics {
  seller_id: string;
  period: 'daily' | 'weekly' | 'monthly';
  
  // Listing metrics
  active_listings: number;
  total_listings: number;
  
  // Engagement metrics
  total_views: number;
  total_contact_requests: number;
  average_response_time_hours: number;
  
  // Sales metrics
  completed_orders: number;
  total_revenue: number;          // Sum of order amounts
  average_order_value: number;
  
  // Trust metrics
  rating_average: number;
  reviews_count: number;
  ban_incidents: number;
  report_incidents: number;
  
  // Subscription info
  subscription_tier: SubscriptionTier;
  subscription_expires_in_days: number;
  
  date: string;                   // ISO date
  created_at: string;
}

// ===================================
// ADMIN AUDIT LOG
// ===================================

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: 'profile_update_failed' | 'subscription_activation_failed' | 'seller_banned' | 'seller_document_rejected' | 'report_resolved';
  target_type: 'subscription' | 'seller' | 'listing' | 'report';
  target_id: string;
  details: Record<string, any>;
  created_at: string;
  ip_address?: string;
}

// ===================================
// API REQUEST/RESPONSE TYPES
// ===================================

export interface InitiatePaymentRequest {
  phone: string;                  // 254XXXXXXXXX format
  amount: number;                 // 1500, 3500, 5000, or 9000
  tier: SubscriptionTier;
  userId: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  orderId?: string;
  checkoutUrl?: string;
}

export interface ReportSellerRequest {
  seller_id: string;
  reason: ReportReason;
  description: string;
  evidence_urls?: string[];
}

export interface ReportSellerResponse {
  success: boolean;
  report_id: string;
  message: string;
  ticket_number?: string;
}

// ===================================
// CONSTANTS
// ===================================

export const SELLER_REPORT_REASONS: Record<ReportReason, string> = {
  fraud: 'Fraudulent activity or scam',
  fake_product: 'Product description doesn\'t match',
  bad_condition: 'Item condition not as described',
  unsafe_behavior: 'Unsafe or threatening behavior',
  harassment: 'Harassment or disrespect',
  spam: 'Spam or repetitive messaging',
  prohibited_item: 'Selling prohibited items',
  other: 'Other issue',
};

export const BAN_REASONS = {
  fraud: 'Account involved in fraudulent activity',
  multiple_complaints: 'Multiple unresolved complaints',
  prohibited_items: 'Selling prohibited items',
  harassment: 'Harassing other users',
  fake_documents: 'Submitted false verification documents',
  suspicious_activity: 'Suspicious payment activity',
  admin_discretion: 'Community safety violation',
} as const;

export const VERIFICATION_DOCUMENT_TYPES: Record<VerificationDocumentType, string> = {
  national_id: 'National ID / Passport',
  business_permit: 'Business Permit',
  tax_certificate: 'Tax Certificate',
  trade_license: 'Trade License',
};

export const BADGE_COLORS = {
  bronze: '#CD7F32',              // Mkulima
  silver: '#C0C0C0',              // Starter
  gold: '#FFD700',                // Pro
  platinum: '#E5E4E2',            // Enterprise
} as const;

export const BADGE_LABELS = {
  bronze: '🏷️ Bronze Seller (Mkulima)',
  silver: '🏷️ Silver Seller (Starter)',
  gold: '🏷️ Gold Seller (Pro)',
  platinum: '🏷️ Platinum Seller (Enterprise)',
} as const;
