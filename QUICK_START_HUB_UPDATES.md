/**
 * QUICK START - UPDATE HUB PAGES FOR REAL DATA
 * 
 * This file shows exactly how to update each hub page to use real Supabase data.
 * Copy-paste the code for each hub.
 * Total time: ~2 hours to update all 6 hubs.
 */

// ============================================
// EXAMPLE 1: MARKETPLACE HUB
// ============================================
/*
FILE: components/MarketplaceHub.tsx (or wherever marketplace is rendered)

BEFORE (Mock data):
├─ MOCK_PRODUCTS hardcoded
├─ No loading state
├─ No error handling
├─ Static empty state

AFTER (Real data):
├─ useListingsByHub('marketplace')
├─ Professional loading skeleton
├─ Error retry button
├─ Professional empty state
├─ Offspring Decor branded

CODE TO USE:
─────────────────────────────────────────────
*/

import React, { useState } from 'react';
import { useListingsByHub, useSearchListings } from '../hooks/useSupabaseData';
import ListingsGrid from '../components/ListingsGrid';
import { DatabaseListing } from '../types/database';
import { COLORS, SECTION_BANNERS } from '../config/brand';

export const MarketplaceHub: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Real data from Supabase
  const { data: allListings, loading: loadingAll, error: errorAll, refetch: refetchAll } = 
    useListingsByHub('marketplace');
  
  const { data: searchResults, loading: loadingSearch } = 
    useSearchListings(searchKeyword, 'marketplace');

  // Use search results if searching, otherwise all listings
  const listings = searchKeyword ? searchResults : allListings;
  const loading = searchKeyword ? loadingSearch : loadingAll;
  const error = searchKeyword ? null : errorAll;

  const handleListingClick = (listing: DatabaseListing) => {
    // Navigate to listing detail page
    console.log('Viewing listing:', listing.id);
    // window.location.href = `/listing/${listing.id}`;
  };

  return (
    <div style={{ background: COLORS.gray[50], minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage: `url(${SECTION_BANNERS.marketplace.imageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">{SECTION_BANNERS.marketplace.title}</h1>
            <p className="text-lg">{SECTION_BANNERS.marketplace.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
          style={{ focusRingColor: COLORS.primary[500] }}
        />
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <ListingsGrid
          listings={listings}
          loading={loading}
          error={error}
          emptyStateType="listings"
          variant="grid"
          onListingClick={handleListingClick}
          onRefetch={refetchAll}
        />
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 2: WHOLESALE HUB
// ============================================
/*
FILE: components/WholesaleHub.tsx

Use: useListingsByHub('wholesale')
Empty state: 'wholesale'
Variant: 'grid' (products) or 'list' (better for bulk viewing)

KEY DIFFERENCES:
├─ Show MOQ (Minimum Order Quantity)
├─ Show bulk pricing
├─ BuyingRequest form integration
└─ B2B contact information
*/

import React from 'react';
import { useListingsByHub } from '../hooks/useSupabaseData';
import ListingsGrid from '../components/ListingsGrid';
import { SECTION_BANNERS } from '../config/brand';

export const WholesaleHub: React.FC = () => {
  const { data: listings, loading, error, refetch } = 
    useListingsByHub('wholesale');

  return (
    <div>
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">{SECTION_BANNERS.wholesale.title}</h1>
        <p className="text-lg">{SECTION_BANNERS.wholesale.subtitle}</p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ListingsGrid
          listings={listings}
          loading={loading}
          error={error}
          emptyStateType="wholesale"
          variant="list" // List view better for B2B
          onRefetch={refetch}
        />
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 3: SERVICES HUB
// ============================================
/*
FILE: components/ServicesHub.tsx

Use: useListingsByHub('service')
Empty state: 'services'
Variant: 'grid' (professional cards)

KEY DIFFERENCES:
├─ Show hourly rate
├─ Show service type (plumbing, electrical, etc.)
├─ Show experience level
├─ Portfolio/certifications
├─ Contact service provider button
*/

import React from 'react';
import { useListingsByHub } from '../hooks/useSupabaseData';
import ListingsGrid from '../components/ListingsGrid';

export const ServicesHub: React.FC = () => {
  const { data: listings, loading, error, refetch } = 
    useListingsByHub('service');

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Professional Services</h1>
        <p className="text-lg">Find and hire trusted local professionals</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <ListingsGrid
          listings={listings}
          loading={loading}
          error={error}
          emptyStateType="services"
          variant="grid"
          onRefetch={refetch}
        />
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 4: DIGITAL HUB
// ============================================
/*
FILE: components/DigitalHub.tsx

Use: useListingsByHub('digital')
Empty state: 'digital'
Variant: 'grid'

KEY DIFFERENCES:
├─ Show file type (e-book, course, software)
├─ Show file size
├─ License type (single, team, enterprise)
├─ Instant download button
├─ Preview/demo link
*/

import React from 'react';
import { useListingsByHub } from '../hooks/useSupabaseData';
import ListingsGrid from '../components/ListingsGrid';

export const DigitalHub: React.FC = () => {
  const { data: listings, loading, error, refetch } = 
    useListingsByHub('digital');

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Digital Products</h1>
        <p className="text-lg">Instantly download courses, e-books, and software</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <ListingsGrid
          listings={listings}
          loading={loading}
          error={error}
          emptyStateType="digital"
          variant="grid"
          onRefetch={refetch}
        />
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 5: MKULIMA HUB (FARMERS)
// ============================================
/*
FILE: components/MkulimaHub.tsx

Use: useFarmerProfiles() + useListingsByHub('farmer')
Empty state: 'farmers'
Variant: 'list' or 'grid'

KEY DIFFERENCES:
├─ Show farm location
├─ Show GPS coordinates on map
├─ Show harvest season
├─ Price per unit + unit type
├─ Direct farmer contact
├─ Delivery insight
*/

import React from 'react';
import { useListingsByHub, useFarmerProfiles } from '../hooks/useSupabaseData';
import ListingsGrid from '../components/ListingsGrid';

export const MkulimaHub: React.FC = () => {
  const { data: listings, loading, error, refetch } = 
    useListingsByHub('farmer');
  
  const { data: farmers } = useFarmerProfiles();

  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Pambo Mkulima Mdogo</h1>
        <p className="text-lg">Connect directly with farmers. Support local agriculture.</p>
      </div>

      {/* Farmer Stats */}
      <div className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg font-bold">{farmers.length} farmers on Pambo</p>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ListingsGrid
          listings={listings}
          loading={loading}
          error={error}
          emptyStateType="farmers"
          variant="list"
          onRefetch={refetch}
        />
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 6: LIVE COMMERCE HUB
// ============================================
/*
FILE: components/LiveHub.tsx

Use: useLiveStreams('live') or useLiveStreams()
Empty state: 'live'
Variant: 'grid' (stream cards)

KEY DIFFERENCES:
├─ Show LIVE badge
├─ Show live viewer count
├─ Show stream thumbnail
├─ Play button / watch now
├─ Embedded player for featured stream
└─ Upcoming streams section
*/

import React from 'react';
import { useLiveStreams } from '../hooks/useSupabaseData';
import ListingsGrid from '../components/ListingsGrid';

export const LiveHub: React.FC = () => {
  // Convert live streams to listing format for display
  const { data: streams, loading, error, refetch } = 
    useLiveStreams();

  // Filter by status
  const liveNow = streams.filter(s => s.status === 'live');
  const upcoming = streams.filter(s => s.status === 'upcoming');

  return (
    <div>
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Live Commerce</h1>
        <p className="text-lg">Real-time shopping with verified sellers</p>
      </div>

      {/* Currently Live */}
      {liveNow.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">🔴 Live Now ({liveNow.length})</h2>
          {/* Could map streams or use ListingsGrid with converted data */}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Upcoming Streams</h2>
          {/* Map upcoming streams */}
        </div>
      )}

      {/* No Streams */}
      {loading === false && streams.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <EmptyState type="live" />
        </div>
      )}
    </div>
  );
};

// ============================================
// CHECKLIST - UPDATE EACH HUB
// ============================================

/*
MARKETPLACE
  [ ] Replace MOCK_PRODUCTS with useListingsByHub('marketplace')
  [ ] Add search functionality with useSearchListings
  [ ] Use ListingsGrid component
  [ ] Set emptyStateType="listings"
  [ ] Test with real data

WHOLESALE
  [ ] Replace mock with useListingsByHub('wholesale')
  [ ] Change variant to 'list' for B2B view
  [ ] Show MOQ and bulk pricing
  [ ] Set emptyStateType="wholesale"
  [ ] Test with real data

SERVICES
  [ ] Replace mock with useListingsByHub('service')
  [ ] Use ListingsGrid with variant="grid"
  [ ] Show hourly rate and service type
  [ ] Set emptyStateType="services"
  [ ] Test with real data

DIGITAL
  [ ] Replace mock with useListingsByHub('digital')
  [ ] Use ListingsGrid variant="grid"
  [ ] Show file type and license
  [ ] Set emptyStateType="digital"
  [ ] Test with real data

MKULIMA
  [ ] Replace mock with useListingsByHub('farmer')
  [ ] Add useFarmerProfiles() for farmer count
  [ ] Use ListingsGrid variant="list"
  [ ] Show farm location and season
  [ ] Set emptyStateType="farmers"
  [ ] Test with real data

LIVE
  [ ] Replace mock with useLiveStreams()
  [ ] Filter by status (live, upcoming)
  [ ] Show LIVE badge for active streams
  [ ] Set emptyStateType="live"
  [ ] Test with real data

ALL HUBS
  [ ] Verify error handling with refetch button
  [ ] Test loading state with network throttling
  [ ] Verify empty state displays correctly
  [ ] Check Offspring Decor branding
  [ ] Mobile responsive layout
  [ ] Performance profiling
  [ ] Deploy to production
*/

console.log(`
✅ QUICK START CHECKLIST READY
═════════════════════════════════════════════

6 hub pages × 10 minutes each = ~1 hour

Each hub needs:
1. Import { useListingsByHub } from hooks
2. Call the hook with hub name
3. Pass data to <ListingsGrid />
4. Set emptyStateType prop
5. Test with real Supabase data

See examples above for exact code.
Copy-paste for each hub!
`);
