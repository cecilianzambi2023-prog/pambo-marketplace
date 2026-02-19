# Liquidity Engine - Quick Integration Examples

Copy-paste code snippets to integrate liquidity tracking into your existing Pambo marketplace.

---

## Example 1: Track Buyer Inquiry (ProductCard / ProductDetailsModal)

When buyer clicks "Contact Seller" button:

```typescript
import { supabase } from '../lib/supabase';

const handleContactSeller = async (listing: Product, buyerId: string | null) => {
  try {
    // 1. Create inquiry record (for liquidity tracking)
    const { data: inquiry, error } = await supabase
      .from('buyer_inquiries')
      .insert({
        buyer_id: buyerId, // null for guest users
        seller_id: listing.sellerId,
        listing_id: listing.id,
        message: 'Interested in this product', // or from textarea
        contact_preference: 'whatsapp',
        inquiry_source: 'listing_page', // or 'search', 'recommended', etc.
        buyer_location: 'Nairobi', // from user profile or IP lookup
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to track inquiry:', error);
    } else {
      console.log('✓ Inquiry tracked (ID:', inquiry.id, ')');
    }

    // 2. Open WhatsApp (existing behavior)
    const message = encodeURIComponent(`Hi, I'm interested in: ${listing.title}`);
    const whatsappUrl = `https://wa.me/${listing.seller_phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // 3. Show toast notification
    toast.success('Inquiry sent! Seller will respond within 2 hours.');

  } catch (error) {
    console.error('Error handling contact:', error);
  }
};
```

---

## Example 2: Track Seller Response (Messaging System)

When seller replies to buyer inquiry:

```typescript
import { trackSellerResponse } from './services/liquidityEngine';

const handleSellerReply = async (inquiryId: string, sellerId: string, message: string) => {
  try {
    // 1. Save message (your existing logic)
    await saveMessage({ inquiryId, from: sellerId, text: message });

    // 2. Track response time and update seller metrics
    const result = await trackSellerResponse(inquiryId, sellerId);

    if (result.success) {
      if (result.metSLA) {
        console.log(`✓ Seller responded in ${result.responseTimeHours.toFixed(1)}h (within SLA)`);
        
        // Optional: Reward fast responders
        if (result.responseTimeHours < 0.5) {
          toast.success('🎉 Lightning-fast response! You earned a visibility boost.');
        }
      } else {
        console.log(`⚠ SLA violation: ${result.responseTimeHours.toFixed(1)}h response time`);
        
        // Optional: Notify seller
        toast.warning('Responding faster improves your ranking. Aim for <2 hours.');
      }
    }
  } catch (error) {
    console.error('Error tracking seller response:', error);
  }
};
```

---

## Example 3: Smart Seller Matching (Search/Browse)

Show best-matched sellers when buyer searches:

```typescript
import { matchBuyerToSellers } from './services/liquidityEngine';

const handleSearch = async (category: string, county: string) => {
  try {
    // 1. Get smart-matched sellers
    const topSellers = await matchBuyerToSellers(category, county, 5);

    console.log('Top matched sellers:', topSellers);

    // 2. Display results with match indicators
    topSellers.forEach(seller => {
      // Show "Fast Responder" badge for high scorers
      if (seller.matchScore >= 80) {
        // <Badge>⚡ Fast Responder</Badge>
      }

      // Display match reasons
      console.log(`${seller.sellerName}: ${seller.matchReasons.join(', ')}`);
    });

    // 3. Prioritize top sellers in search results
    const prioritizedResults = [
      ...topSellers.map(s => s.listingId),
      ...otherListings,
    ];

    return prioritizedResults;

  } catch (error) {
    console.error('Error matching sellers:', error);
    return [];
  }
};
```

---

## Example 4: Add Liquidity Dashboard to Admin Panel

In `AdminPanel.tsx` or `App.tsx`:

```tsx
import { LiquidityDashboard } from './components/LiquidityDashboard';
import { useState } from 'react';

const AdminPanel = () => {
  const [showLiquidityDash, setShowLiquidityDash] = useState(false);

  return (
    <div>
      {/* ... existing admin UI ... */}

      {/* Add button to operations section */}
      <button
        onClick={() => setShowLiquidityDash(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        📊 Liquidity Dashboard
      </button>

      {/* Render dashboard modal */}
      {showLiquidityDash && (
        <LiquidityDashboard onClose={() => setShowLiquidityDash(false)} />
      )}
    </div>
  );
};
```

---

## Example 5: Display Seller Performance Tier

In `ProductCard` or `SellerProfile` component:

```tsx
import { getSellerResponseMetrics } from './services/liquidityEngine';
import { useState, useEffect } from 'react';

const SellerBadge = ({ sellerId }: { sellerId: string }) => {
  const [tier, setTier] = useState<'excellent' | 'good' | 'needs_improvement' | 'poor' | null>(null);

  useEffect(() => {
    const fetchTier = async () => {
      const metrics = await getSellerResponseMetrics(sellerId);
      if (metrics) {
        setTier(metrics.tier);
      }
    };
    fetchTier();
  }, [sellerId]);

  const tierColors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    needs_improvement: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800',
  };

  const tierLabels = {
    excellent: '⚡ Fast Responder',
    good: '👍 Reliable',
    needs_improvement: '⏰ Improving',
    poor: '❌ Slow',
  };

  if (!tier) return null;

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${tierColors[tier]}`}>
      {tierLabels[tier]}
    </span>
  );
};

// Usage in ProductCard:
// <SellerBadge sellerId={product.sellerId} />
```

---

## Example 6: Category Health Widget (Homepage)

Show category health on homepage or seller dashboard:

```tsx
import { getCategoryLiquidity } from './services/liquidityEngine';
import { useState, useEffect } from 'react';

const CategoryHealthWidget = ({ category }: { category: string }) => {
  const [health, setHealth] = useState<CategoryLiquidity | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await getCategoryLiquidity(category);
      setHealth(data);
    };
    fetchHealth();
  }, [category]);

  if (!health) return null;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">{category} Health</h3>
      <div className={`text-2xl font-bold ${getHealthColor(health.liquidityScore)}`}>
        {health.liquidityScore}/100
      </div>
      <p className="text-sm text-gray-600 mt-1">
        {health.activeListings} active listings • {health.last7DaysInquiries} inquiries this week
      </p>
      {health.status === 'critical' && (
        <p className="text-red-600 text-sm mt-2">
          ⚠️ High demand! List now for instant visibility.
        </p>
      )}
    </div>
  );
};
```

---

## Example 7: Auto-Alert Email (Daily Cron)

In `liquidityCron.ts` or separate email service:

```typescript
import { getLowLiquidityAlerts } from './services/liquidityEngine';
import { sendEmail } from './emailService'; // Your email service

export const sendDailyLiquidityReport = async () => {
  const alerts = await getLowLiquidityAlerts();
  const critical = alerts.filter(a => a.urgency === 'high');

  if (critical.length > 0) {
    const emailBody = `
      🚨 CRITICAL LIQUIDITY ALERTS (${critical.length})
      
      ${critical.map(a => `
        Category: ${a.category}
        Issue: ${a.issue}
        Action: ${a.recommendation}
      `).join('\n\n')}
      
      View full dashboard: https://pambo.biz/admin/liquidity
    `;

    await sendEmail({
      to: 'ops@pambo.biz',
      subject: `🚨 ${critical.length} Critical Liquidity Alerts`,
      body: emailBody,
    });
  }
};
```

---

## Example 8: Seller Dashboard - Response Stats

Show seller their own performance metrics:

```tsx
import { getSellerResponseMetrics } from './services/liquidityEngine';
import { useState, useEffect } from 'react';

const SellerDashboard = ({ sellerId }: { sellerId: string }) => {
  const [metrics, setMetrics] = useState<SellerResponseMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await getSellerResponseMetrics(sellerId);
      setMetrics(data);
    };
    fetchMetrics();
  }, [sellerId]);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Your Response Performance</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-gray-600 text-sm">Avg Response Time</div>
          <div className="text-2xl font-bold">
            {metrics.averageResponseTimeHours.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-500">Target: &lt;2h</div>
        </div>
        <div>
          <div className="text-gray-600 text-sm">Response Rate</div>
          <div className="text-2xl font-bold">
            {metrics.responseRate.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-500">Target: 90%+</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-gray-600 text-sm mb-2">Performance Tier</div>
        <span className={`px-3 py-1 rounded-full font-semibold ${
          metrics.tier === 'excellent' ? 'bg-green-100 text-green-800' :
          metrics.tier === 'good' ? 'bg-blue-100 text-blue-800' :
          metrics.tier === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {metrics.tier.toUpperCase()}
        </span>
      </div>

      {metrics.tier !== 'excellent' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>Tip:</strong> Respond to inquiries within 2 hours to improve your ranking and earn visibility boosts!
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Inquiries (7d)</div>
          <div className="font-semibold">{metrics.last7DaysInquiries}</div>
        </div>
        <div>
          <div className="text-gray-600">SLA Violations</div>
          <div className="font-semibold text-red-600">{metrics.slaViolations}</div>
        </div>
      </div>
    </div>
  );
};
```

---

## Example 9: Low-Liquidity Banner (Category Page)

Show banner on category pages with low liquidity:

```tsx
import { getCategoryLiquidity } from './services/liquidityEngine';
import { useState, useEffect } from 'react';

const CategoryPage = ({ category }: { category: string }) => {
  const [liquidity, setLiquidity] = useState<CategoryLiquidity | null>(null);

  useEffect(() => {
    const fetchLiquidity = async () => {
      const data = await getCategoryLiquidity(category);
      setLiquidity(data);
    };
    fetchLiquidity();
  }, [category]);

  return (
    <div>
      {liquidity && liquidity.status === 'undersupplied' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-orange-900 mb-2">
            🚀 High Demand Category!
          </h3>
          <p className="text-orange-800 text-sm">
            This category has <strong>{liquidity.last7DaysInquiries} recent inquiries</strong> but only{' '}
            <strong>{liquidity.activeListings} listings</strong>. List your {category.toLowerCase()} products now for instant visibility!
          </p>
          <button className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            List Now
          </button>
        </div>
      )}

      {/* ... rest of category page ... */}
    </div>
  );
};
```

---

## Example 10: Update Seller Online Status

Track when seller comes online/offline:

```typescript
import { supabase } from '../lib/supabase';

const updateSellerOnlineStatus = async (sellerId: string, isOnline: boolean) => {
  try {
    // Call database function
    await supabase.rpc('update_seller_online_status', {
      seller_user_id: sellerId,
      is_now_online: isOnline,
    });

    console.log(`✓ Seller ${isOnline ? 'online' : 'offline'}`);
  } catch (error) {
    console.error('Error updating seller status:', error);
  }
};

// Usage:
// - Call with isOnline=true when seller logs in or opens app
// - Call with isOnline=false when seller logs out or closes app
// - Use visibility API to detect when tab is hidden

document.addEventListener('visibilitychange', () => {
  if (user && user.role === 'seller') {
    const isOnline = !document.hidden;
    updateSellerOnlineStatus(user.id, isOnline);
  }
});
```

---

## Integration Steps Summary

1. **Run database migration** ✅
2. **Track inquiries** when buyers contact sellers (Example 1)
3. **Track responses** when sellers reply (Example 2)
4. **Add liquidity dashboard** to admin panel (Example 4)
5. **Show seller badges** on listings (Example 5)
6. **Set up daily cron job** (see LIQUIDITY_ENGINE_GUIDE.md)
7. **Optional: Add smart matching** to search (Example 3)
8. **Optional: Show seller performance** in dashboard (Example 8)

That's it! Your marketplace now actively manages liquidity.
