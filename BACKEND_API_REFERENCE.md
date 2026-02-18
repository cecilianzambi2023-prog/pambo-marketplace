/**
 * PAMBO BACKEND SERVICES - Quick Reference
 * 
 * This file acts as the central index for all backend services
 * Import functions from these services to integrate with your components
 */

// ============================================
// SUPABASE CLIENT SETUP
// ============================================
// File: services/supabaseClient.ts
// 
// Main exports:
// - supabase: Initialized Supabase client
// - checkSupabaseConnection(): Verify connection
// - getAuthenticatedUser(): Get current user
// - signOutUser(): Sign out current user
//
// Usage:
// import { supabase, checkSupabaseConnection } from '@/services/supabaseClient';

// ============================================
// AUTHENTICATION SERVICE
// ============================================
// File: services/authService.ts
//
// Functions:
// - signUp(email, password, userData)                 → Register new user
// - signIn(email, password)                           → Login user
// - updateUserProfile(userId, updates)                → Update user info
// - getUserProfile(userId)                            → Get user profile
// - getSellerProfile(sellerId)                        → Get seller with stats
// - followSeller(buyerId, sellerId)                   → Follow a seller
// - unfollowSeller(buyerId, sellerId)                 → Unfollow a seller
// - verifyEmail(token)                                → Verify email address
// - resetPassword(email)                              → Send reset email
// - updatePassword(newPassword)                       → Change password
//
// Usage:
// import { signUp, signIn, getUserProfile } from '@/services/authService';

// ============================================
// LISTINGS SERVICE (All 6 Hubs)
// ============================================
// File: services/listingsService.ts
//
// Hub Types: 'marketplace' | 'wholesale' | 'digital' | 'farmer' | 'service' | 'live'
//
// Functions:
// - createListing(listing)                            → Create any hub listing
// - getListingsByHub(hub, limit, offset)              → Get listings by hub
// - getSellerListings(sellerId, status)               → Get seller's listings
// - getListing(listingId)                             → Get single listing (increments views)
// - updateListing(listingId, updates)                 → Update listing
// - deleteListing(listingId)                          → Delete listing
// - searchListings(searchTerm, filters, limit)        → Advanced search
// - getFeaturedListings(hub, limit)                   → Get boosted/featured items
// - getTrendingListings(hub, limit)                   → Get trending listings
// - toggleFavoriteListing(listingId, buyerId)         → Add/remove favorite
// - getListingsNearLocation(lat, lng, radiusKm)       → Get listings near location
//
// Usage:
// import { getListingsByHub, searchListings } from '@/services/listingsService';

// ============================================
// ORDERS SERVICE
// ============================================
// File: services/ordersService.ts
//
// Order Status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'canceled'
//
// Functions:
// - createOrder(order)                                → Create new order
// - getOrder(orderId)                                 → Get order by ID
// - getBuyerOrders(buyerId, status)                   → Get buyer's orders
// - getSellerOrders(sellerId, status)                 → Get seller's orders
// - updateOrderStatus(orderId, status)                → Update order status
// - cancelOrder(orderId)                              → Cancel order
// - getOrderWithDetails(orderId)                      → Get order + listing details
// - getSellerOrderStats(sellerId)                     → Get seller analytics
// - getBuyerSpendingStats(buyerId)                    → Get buyer spending stats
// - updateOrderTracking(orderId, trackingData)        → Add tracking info
//
// Usage:
// import { createOrder, getBuyerOrders } from '@/services/ordersService';

// ============================================
// PAYMENTS SERVICE (M-Pesa)
// ============================================
// File: services/paymentsService.ts
//
// Payment Status: 'pending' | 'completed' | 'failed' | 'refunded'
// Payment Method: 'mpesa' | 'card' | 'wallet'
//
// Functions:
// - initiateMpesaPayment(paymentRequest)              → Start M-Pesa STK push
// - verifyMpesaPayment(orderId)                       → Check payment status
// - handleMpesaCallback(callbackData)                 → Process M-Pesa callback (backend)
// - getPaymentHistory(orderId)                        → Get payment history
// - refundPayment(paymentId, refundAmount)            → Initiate refund
// - getSellerPaymentStats(sellerId)                   → Get seller payment stats
// - requestSellerPayout(sellerId, amount, mpesaNum)   → Request payout
// - getSellerPayouts(sellerId)                        → Get payout history
//
// Usage:
// import { initiateMpesaPayment, verifyMpesaPayment } from '@/services/paymentsService';

// ============================================
// REVIEWS SERVICE
// ============================================
// File: services/reviewsService.ts
//
// Rating: 1 | 2 | 3 | 4 | 5 (stars)
//
// Functions:
// - createReview(review)                              → Create review
// - getListingReviews(listingId, limit, offset)       → Get listing reviews
// - getSellerReviews(sellerId, limit, offset)         → Get seller reviews
// - getSellerAverageRating(sellerId)                  → Get seller's avg rating
// - markReviewHelpful(reviewId)                       → Increment helpful count
// - deleteReview(reviewId, listingId)                 → Delete review
// - getListingRatingDistribution(listingId)           → Get rating breakdown (1-5)
// - getReviewsWithBuyerDetails(listingId)             → Get reviews + buyer names
//
// Usage:
// import { createReview, getListingReviews } from '@/services/reviewsService';

// ============================================
// DATABASE TABLES (15 total)
// ============================================
// 
// 1. users              → Sellers, buyers, farmers, admins
// 2. listings           → All 6 hub products/services
// 3. orders             → Transactions and their items
// 4. reviews            → Ratings and comments
// 5. payments           → Payment records (M-Pesa, cards, etc.)
// 6. refunds            → Refund tracking
// 7. payouts            → Seller earnings
// 8. posts              → Social feed
// 9. buyingRequests     → B2B wholesale requests
// 10. farmerProfiles    → Farmer-specific data
// 11. liveStreams       → Live commerce sessions
// 12. carts             → Shopping carts
// 13. favorites         → Saved listings
// 14. adminLogs         → Admin actions
// 15. tickets           → Support tickets

// ============================================
// HUB-SPECIFIC EXAMPLES
// ============================================

// MARKETPLACE (B2C)
// - Regular e-commerce (Jiji style)
// - Required: title, price, stock, shipping, images
// - Optional: category, description
// 
// Example:
// createListing({
//   hub: 'marketplace',
//   title: 'iPhone 13 Pro',
//   price: 85000,
//   stock: 5,
//   shipping: { availableCounties: ['Nairobi', 'Mombasa'], shippingFee: 500 },
//   category: 'Electronics',
//   images: ['url1', 'url2']
// })

// WHOLESALE (B2B)
// - Bulk purchasing (Alibaba style)
// - Required: title, price, moq (Minimum Order Qty), bulkPricing, dimensions
// 
// Example:
// createListing({
//   hub: 'wholesale',
//   title: 'USB Cables (Bulk)',
//   price: 50,
//   moq: 100,
//   bulkPricing: [
//     { quantity: 100, price: 50 },
//     { quantity: 500, price: 45 },
//     { quantity: 1000, price: 40 }
//   ],
//   dimensions: { length: 1, width: 0.1, height: 0.1, weight: 0.05 }
// })

// DIGITAL (E-Books, Courses, Software)
// - Instant download after payment
// - Required: title, price, downloadLink, fileType, accessDuration
// 
// Example:
// createListing({
//   hub: 'digital',
//   title: 'React Master Course',
//   price: 2000,
//   downloadLink: 'https://cdn.example.com/course.zip',
//   fileType: 'ZIP',
//   fileSize: 500,
//   accessDuration: 365 // days, 0 = lifetime
// })

// FARMER (Mkulima Mdogo)
// - Farm-to-buyer marketplace (map-based)
// - Required: title, price, farmName, farmCoordinates, isFarmerVerified
// - Verification costs 1,500 KES/year
// 
// Example:
// createListing({
//   hub: 'farmer',
//   title: 'Fresh Maize',
//   price: 60,
//   farmName: 'Kipchoge Farm',
//   farmCoordinates: { latitude: -0.4167, longitude: 36.9500 },
//   isFarmerVerified: true,
//   harvestSeason: 'March - June',
//   unit: 'kg'
// })

// SERVICE (Plumbers, Designers, Etc)
// - Professional services (Offspring Decor style)
// - Required: title, serviceType, hourlyRate, availability, experienceLevel
// 
// Example:
// createListing({
//   hub: 'service',
//   title: 'Interior Design Consultation',
//   serviceType: 'Interior Design',
//   hourlyRate: 5000,
//   experienceLevel: 'expert',
//   availability: {
//     hours: {
//       monFri: '9:00 AM - 5:00 PM',
//       saturday: '10:00 AM - 2:00 PM',
//       sunday: 'Closed'
//     },
//     respondTime: 2 // hours
//   },
//   portfolio: ['url1', 'url2'],
//   certifications: ['Interior Design Diploma']
// })

// LIVE COMMERCE
// - Real-time shopping with video streams
// - Required: title, isLiveNow, streamUrl, liveViewerCount
// 
// Example:
// createListing({
//   hub: 'live',
//   title: 'Live Product Showcase - New Fashion Collection',
//   isLiveNow: true,
//   streamUrl: 'https://stream-api.example.com/rtmp',
//   liveViewerCount: 542,
//   scheduleNextLive: new Date('2024-03-20T15:00:00')
// })

// ============================================
// INTEGRATION CHECKLIST
// ============================================
//
// ☐ Set up Supabase project
// ☐ Run database schema SQL
// ☐ Get ANON KEY from Supabase
// ☐ Add keys to .env.local
// ☐ Test Supabase connection
//
// ☐ Integrate auth in AuthModal.tsx
// ☐ Integrate listings in Dashboard.tsx
// ☐ Integrate orders in CartModal.tsx
// ☐ Integrate payments in MPesaModal.tsx
// ☐ Integrate reviews in ProductDetailsModal.tsx
// ☐ Integrate admin in AdminPanel.tsx
// ☐ Integrate live streams in LiveCommerceView.tsx
//
// ☐ Build seller dashboard
// ☐ Build admin dashboard
// ☐ Setup M-Pesa backend API
// ☐ Deploy to production

// ============================================
// IMPORTANT NOTES
// ============================================
//
// 1. All functions return { success: boolean, data: any, error: any }
//
// 2. M-Pesa callback handling needs a Node.js backend
//    Don't call handleMpesaCallback from frontend
//
// 3. Authentication is handled by Supabase Auth
//    User emails are unique
//
// 4. All timestamps are in ISO 8601 format (use new Date().toISOString())
//
// 5. Currency is always in KES by default (Kenyan Shilling)
//
// 6. For production, implement proper Row Level Security (RLS) policies
//
// 7. File uploads use Supabase Storage (set up buckets manually)
//
// 8. WebSockets for real-time features coming in next phase

export const BACKEND_READY = true;
export const VERSION = '1.0.0';
export const HUBS = ['marketplace', 'wholesale', 'digital', 'farmer', 'service', 'live'];
