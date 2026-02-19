# Paid Features Implementation Guide
## API Endpoints, Components, and Integration

**Status**: Development Phase 1  
**Date**: February 19, 2026

---

## 1. Backend API Endpoints (Supabase)

### Boost Management

#### Create/Activate Boost
```typescript
// POST /api/boosts/activate
export const activateBoost = async (
  listingId: string,
  boostTier: 'quick' | 'standard' | 'premium' | 'power_bundle',
  sellerSubscriptionTier: 'free' | 'starter' | 'pro' | 'enterprise',
  mpesaReceiptNumber: string
): Promise<Boost> => {
  const boostConfig = BOOST_TIERS[boostTier];
  const discountApplied = BOOST_DISCOUNTS[sellerSubscriptionTier];
  const finalPrice = Math.round(boostConfig.price * (1 - discountApplied));
  
  const { data, error } = await supabase
    .from('boosts')
    .insert([{
      listing_id: listingId,
      seller_id: currentUser.id,
      boost_tier: boostTier,
      activated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + boostConfig.duration_hours * 60 * 60 * 1000).toISOString(),
      amount_paid: finalPrice,
      currency: 'KES',
      payment_method: 'mpesa_manual',
      status: 'pending', // Manual verification
      auto_renew: false,
      mpesa_receipt_number: mpesaReceiptNumber,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

#### Get Active Boosts for Seller
```typescript
// GET /api/boosts?sellerId={id}&status=active
export const getActiveBoosts = async (sellerId: string): Promise<Boost[]> => {
  const { data, error } = await supabase
    .from('boosts')
    .select('*')
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .order('expires_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};
```

#### Get Boost for Listing
```typescript
// GET /api/boosts/listing/{listingId}
export const getBoostForListing = async (listingId: string): Promise<Boost | null> => {
  const { data, error } = await supabase
    .from('boosts')
    .select('*')
    .eq('listing_id', listingId)
    .eq('status', 'active')
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
};
```

#### Cancel Boost
```typescript
// DELETE /api/boosts/{boostId}
export const cancelBoost = async (boostId: string): Promise<void> => {
  const { error } = await supabase
    .from('boosts')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', boostId);
    
  if (error) throw error;
};
```

#### Track Boost Impression
```typescript
// POST /api/boosts/{boostId}/track/impression
export const trackBoostImpression = async (boostId: string): Promise<void> => {
  const { error } = await supabase
    .from('boosts')
    .update({ 
      impressions: 'impressions + 1',
      updated_at: new Date().toISOString()
    })
    .eq('id', boostId);
    
  if (error) throw error;
};
```

---

### Advertisement Management

#### Create Ad Campaign
```typescript
// POST /api/ads/create
export const createAdCampaign = async (
  sellerId: string,
  adData: {
    adType: 'category_tag' | 'search_result' | 'hub_banner' | 'carousel';
    displayName: string;
    imageUrl: string;
    targetCategory?: string;
    targetKeyword?: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    dailyBudget: number; // KES
  }
): Promise<Advertisement> => {
  const { data, error } = await supabase
    .from('advertisements')
    .insert([{
      seller_id: sellerId,
      ad_type: adData.adType,
      display_name: adData.displayName,
      image_url: adData.imageUrl,
      target_category: adData.targetCategory,
      target_keyword: adData.targetKeyword,
      start_date: adData.startDate,
      end_date: adData.endDate,
      daily_budget: adData.dailyBudget,
      status: 'pending', // Admin review needed
      payment_schedule: 'daily',
      currency: 'KES',
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

#### Get Seller's Ads
```typescript
// GET /api/ads?sellerId={id}&status=active
export const getSellerAds = async (sellerId: string, status: string = 'active'): Promise<Advertisement[]> => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('seller_id', sellerId)
    .eq('status', status)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};
```

#### Pause/Resume Ad
```typescript
// PATCH /api/ads/{adId}
export const updateAdStatus = async (
  adId: string, 
  newStatus: 'active' | 'paused' | 'cancelled'
): Promise<Advertisement> => {
  const { data, error } = await supabase
    .from('advertisements')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', adId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

---

### Badge Management

#### Assign Badge
```typescript
// POST /api/badges/assign
export const assignBadge = async (
  sellerId: string,
  badgeType: keyof typeof SELLER_BADGES,
  purchaseData?: {
    mpesaReceiptNumber: string;
    amountPaid: number;
  }
): Promise<SellerBadge> => {
  const badgeConfig = SELLER_BADGES[badgeType];
  
  const { data, error } = await supabase
    .from('seller_badges')
    .insert([{
      seller_id: sellerId,
      badge_type: badgeType,
      is_active: true,
      earned_date: new Date().toISOString(),
      expires_at: badgeConfig.billingPeriod === 'PERMANENT' 
        ? null 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      auto_renew: false,
      amount_paid: purchaseData?.amountPaid || null,
      payment_method: purchaseData ? 'mpesa_manual' : null,
      mpesa_receipt_number: purchaseData?.mpesaReceiptNumber,
      display_order: 0,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

#### Get Seller Badges
```typescript
// GET /api/badges?sellerId={id}&active=true
export const getSellerBadges = async (sellerId: string, activeOnly: boolean = true): Promise<SellerBadge[]> => {
  let query = supabase
    .from('seller_badges')
    .select('*')
    .eq('seller_id', sellerId);
    
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
};
```

#### Get Primary Badge
```typescript
// GET /api/badges/primary?sellerId={id}
export const getPrimaryBadge = async (sellerId: string): Promise<SellerBadge | null> => {
  const badges = await getSellerBadges(sellerId, true);
  return badges.length > 0 ? badges[0] : null;
};
```

---

## 2. React Components

### PaidFeaturesCard.tsx
```typescript
import React, { useState } from 'react';
import { TrendingUp, Zap, Award } from 'lucide-react';

interface PaidFeaturesCardProps {
  sellerId: string;
  activeBooosts: number;
  activeAds: number;
  badges: number;
  monthlySpend: number;
}

export const PaidFeaturesCard: React.FC<PaidFeaturesCardProps> = ({
  sellerId,
  activeBooosts,
  activeAds,
  badges,
  monthlySpend,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" />
          Visibility Boosts & Ads
        </h3>
        <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
          Manage All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-600">Active Boosts</p>
          <p className="text-2xl font-bold text-gray-900">{activeBooosts}</p>
        </div>
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-600">Active Ads</p>
          <p className="text-2xl font-bold text-gray-900">{activeAds}</p>
        </div>
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-600">Badges</p>
          <p className="text-2xl font-bold text-gray-900">{badges}</p>
        </div>
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-600">Monthly Spend</p>
          <p className="text-2xl font-bold text-gray-900">KES {monthlySpend}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm font-medium">
          <Zap size={16} className="inline mr-2" />
          New Boost
        </button>
        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 px-3 rounded text-sm font-medium">
          <Award size={16} className="inline mr-2" />
          Get Badge
        </button>
      </div>
    </div>
  );
};
```

### BoostPurchaseModal.tsx
```typescript
import React, { useState } from 'react';
import { BOOST_TIERS, BOOST_DISCOUNTS } from '../../constants';
import { Check } from 'lucide-react';

interface BoostPurchaseModalProps {
  isOpen: boolean;
  listingId: string;
  sellerSubscriptionTier: string;
  onClose: () => void;
  onPurchase: (boostTier: string, mpesaReceipt: string) => void;
}

export const BoostPurchaseModal: React.FC<BoostPurchaseModalProps> = ({
  isOpen,
  listingId,
  sellerSubscriptionTier,
  onClose,
  onPurchase,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsSubmitting(true);
    try {
      await onPurchase(selectedTier, mpesaReceipt);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Boost Your Listing</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(BOOST_TIERS).map(([key, tier]) => {
              const discountRate = BOOST_DISCOUNTS[sellerSubscriptionTier as keyof typeof BOOST_DISCOUNTS] || 0;
              const discountedPrice = Math.round(tier.price * (1 - discountRate));

              return (
                <div
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedTier === key
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{tier.name}</h3>
                      <p className="text-sm text-gray-600">{tier.duration_label}</p>
                    </div>
                    {tier.mostPopular && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-3">Estimated Reach: {tier.estimatedReach}</p>

                  <div className="mb-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs mb-1">
                        <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-2xl font-bold text-gray-900">
                      KES {discountedPrice}
                    </p>
                    {discountRate > 0 && (
                      <p className="text-xs text-green-600">
                        Save {Math.round(discountRate * 100)}% with your {sellerSubscriptionTier} plan
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Complete Payment via M-Pesa</h3>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <p className="text-sm text-gray-900 mb-2">
                <strong>Send this amount to:</strong>
              </p>
              <p className="text-lg font-bold text-blue-600 mb-3">Till Number: 247247</p>
              <p className="text-sm text-gray-700 mb-3">
                Use your listing title as the reference. Once payment completes, enter your M-Pesa receipt number below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Receipt Number
              </label>
              <input
                type="text"
                value={mpesaReceipt}
                onChange={(e) => setMpesaReceipt(e.target.value.toUpperCase())}
                placeholder="e.g., RLH...UCA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t bg-gray-50 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={isSubmitting || !mpesaReceipt.trim()}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Processing...' : 'Activate Boost'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### BadgeDisplay.tsx
```typescript
import React from 'react';
import { SellerBadge } from '../../types';
import { SELLER_BADGES } from '../../constants';

interface BadgeDisplayProps {
  badge: SellerBadge;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  size = 'md',
  showLabel = true,
}) => {
  const badgeConfig = SELLER_BADGES[badge.badgeType];
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ backgroundColor: badgeConfig.color }}
        title={badgeConfig.description}
      >
        {badgeConfig.icon}
      </div>
      {showLabel && (
        <div>
          <p className="text-xs font-semibold text-gray-900">{badgeConfig.name}</p>
          {badge.expiresAt && (
            <p className="text-xs text-gray-500">
              Expires {new Date(badge.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 3. Product Card Enhancement

### Updated ProductCard.tsx with Boosts
```typescript
import { BadgeDisplay } from './BadgeDisplay';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  sellerBadge?: SellerBadge;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, sellerBadge }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* Boost Badge Overlay */}
      {product.isBoosted && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          🚀 BOOSTED
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
        
        {/* Seller Badge */}
        {sellerBadge && (
          <div className="mb-2">
            <BadgeDisplay badge={sellerBadge} size="sm" showLabel={false} />
          </div>
        )}

        <p className="text-lg font-bold text-gray-900 mb-3">
          KES {product.price?.toLocaleString()}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{product.county}</span>
          <span className="flex items-center gap-1">
            ⭐ {product.averageRating || 0} ({product.reviewCount || 0})
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

## 4. Dashboard Integration

### Add to SellerDashboard.tsx
```typescript
import { PaidFeaturesCard } from '../components/paid-features/PaidFeaturesCard';
import { getActiveBoosts, getSellerAds, getSellerBadges } from '../services/paidFeaturesService';

export const SellerDashboard: React.FC = () => {
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([]);
  const [activeAds, setActiveAds] = useState<Advertisement[]>([]);
  const [badges, setBadges] = useState<SellerBadge[]>([]);

  useEffect(() => {
    const loadPaidFeatures = async () => {
      try {
        const [boosts, ads, badgesList] = await Promise.all([
          getActiveBoosts(currentUser.id),
          getSellerAds(currentUser.id, 'active'),
          getSellerBadges(currentUser.id, true),
        ]);
        
        setActiveBoosts(boosts);
        setActiveAds(ads);
        setBadges(badgesList);
      } catch (error) {
        console.error('Failed to load paid features:', error);
      }
    };

    loadPaidFeatures();
  }, []);

  return (
    <div className="space-y-6">
      {/* Paid Features Overview */}
      <PaidFeaturesCard
        sellerId={currentUser.id}
        activeBooosts={activeBoosts.length}
        activeAds={activeAds.length}
        badges={badges.length}
        monthlySpend={calculateMonthlySpend(activeBoosts, activeAds, badges)}
      />

      {/* Rest of dashboard... */}
    </div>
  );
};
```

---

## 5. M-Pesa Payment Verification

### Payment Verification Service
```typescript
export const verifyMpesaPayment = async (
  receiptNumber: string,
  expectedAmount: number
): Promise<{ valid: boolean; message: string }> => {
  try {
    // This would integrate with a real M-Pesa API
    // For now, manual verification by admin
    
    const { data: payment } = await supabase
      .from('mpesa_payments')
      .select('*')
      .eq('receipt_number', receiptNumber)
      .single();

    if (!payment) {
      return { 
        valid: false, 
        message: 'Receipt not found. Please contact support.' 
      };
    }

    if (payment.status !== 'completed') {
      return { 
        valid: false, 
        message: 'Payment not yet confirmed.' 
      };
    }

    if (Math.abs(payment.amount - expectedAmount) > 10) {
      return { 
        valid: false, 
        message: 'Payment amount does not match.' 
      };
    }

    return { 
      valid: true, 
      message: 'Payment verified successfully!' 
    };
  } catch (error) {
    return { 
      valid: false, 
      message: 'Error verifying payment. Please try again.' 
    };
  }
};
```

---

## 6. Testing Checklist

### Component Testing
- [ ] BoostPurchaseModal renders correctly
- [ ] Price discounts apply based on subscription tier
- [ ] BadgeDisplay shows all badge types
- [ ] Boost badges appear on product cards
- [ ] M-Pesa receipt number validation works

### Integration Testing
- [ ] Boost activation saves to database
- [ ] Ad campaigns create successfully
- [ ] Badges are assigned and displayed
- [ ] Pagination works for boost history
- [ ] Performance: No N+1 queries on dashboard

### User Testing
- [ ] Flow is intuitive for new sellers
- [ ] ROI is clear and visible
- [ ] Testimonials and success stories are compelling
- [ ] M-Pesa payment instructions are clear

---

## 7. Deployment Checklist

- [ ] Database migrations run successfully
- [ ] New types compile without errors
- [ ] Constants updated in all environments
- [ ] API endpoints tested and documented
- [ ] Components integration tested
- [ ] M-Pesa payment system validated
- [ ] Admin approval workflow set up
- [ ] Email notifications configured
- [ ] Analytics tracking implemented
- [ ] Security review completed

---

**Document Version**: 1.0  
**Status**: Ready for Development  
**Expected Completion**: 1 week (Phase 1-5)
