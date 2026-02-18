import React, { useState, useEffect } from 'react';
import { getAllFeaturedListings, getFeaturedListingsAnalytics } from '../services/featuredListingsService';
import { Sparkles, TrendingUp, DollarSign, Calendar, Settings, Eye } from 'lucide-react';
import { COLORS } from '../config/brand';

interface FeaturedAnalytics {
  total_featured: number;
  total_revenue: number;
  mpesa_revenue: number;
  bank_revenue: number;
  price_per_listing: number;
  duration_days: number;
}

interface FeaturedListing {
  id: string;
  listing_id: string;
  seller_id: string;
  featured_start_date: string;
  featured_end_date: string;
  duration_days: number;
  amount_paid: number;
  payment_method: string;
  status: string;
  mpesa_receipt_number: string;
  created_at: string;
  updated_at: string;
}

export const FeaturedListingsAnalyticsTab: React.FC = () => {
  const [analytics, setAnalytics] = useState<FeaturedAnalytics | null>(null);
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'revenue'>('date');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics
      const analyticsData = await getFeaturedListingsAnalytics();
      setAnalytics(analyticsData);

      // Fetch all featured listings
      const { data: listings } = await getAllFeaturedListings(500, 0);
      if (listings) {
        setFeaturedListings(listings);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-4 border-4 border-gray-200" style={{ borderTopColor: COLORS.primary[500] }} />
          <p style={{ color: COLORS.gray[600] }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p style={{ color: COLORS.danger }}>❌ {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 rounded-lg font-semibold text-white"
          style={{ background: COLORS.primary[500] }}
        >
          Retry
        </button>
      </div>
    );
  }

  const sortedListings = [...featuredListings].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.featured_start_date).getTime() - new Date(a.featured_start_date).getTime();
    } else {
      return b.amount_paid - a.amount_paid;
    }
  });

  const activeListings = featuredListings.filter(f => f.status === 'active').length;
  const expiredListings = featuredListings.filter(f => f.status === 'expired').length;
  const allTimeRevenue = analytics?.total_revenue || 0;
  const daysActive = 
    featuredListings.length > 0
      ? Math.ceil((new Date().getTime() - new Date(Math.min(...featuredListings.map(f => new Date(f.created_at).getTime()))).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
  const avgRevenuePerDay = daysActive > 0 ? Math.round(allTimeRevenue / daysActive) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles size={28} style={{ color: COLORS.primary[500] }} />
          <h2 className="text-2xl font-bold" style={{ color: COLORS.gray[900] }}>
            Featured Listings Analytics
          </h2>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-md flex items-center gap-2"
          style={{ background: COLORS.primary[500] }}
        >
          <Settings size={18} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          title="Total Revenue"
          value={`KES ${allTimeRevenue.toLocaleString()}`}
          subtext="All-time featured revenue"
          icon={<DollarSign size={24} />}
          color={COLORS.success}
        />
        <AnalyticsCard
          title="Active Featured"
          value={activeListings.toString()}
          subtext={`${expiredListings} expired this week`}
          icon={<Sparkles size={24} className="fill-yellow-400" />}
          color={COLORS.warning}
        />
        <AnalyticsCard
          title="Avg Revenue/Day"
          value={`KES ${avgRevenuePerDay.toLocaleString()}`}
          subtext={`Last ${daysActive} days`}
          icon={<TrendingUp size={24} />}
          color={COLORS.primary[500]}
        />
        <AnalyticsCard
          title="M-Pesa vs Bank"
          value={`${Math.round((analytics?.mpesa_revenue || 0) / (analytics?.total_revenue || 1) * 100)}% M-Pesa`}
          subtext={`${Math.round((analytics?.bank_revenue || 0) / (analytics?.total_revenue || 1) * 100)}% Bank`}
          icon={<Eye size={24} />}
          color={COLORS.info}
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-lg p-6 border" style={{ borderColor: COLORS.gray[200] }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.gray[900] }}>
            Payment Method Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#00C853' }} />
                  <span className="font-semibold text-gray-700">M-Pesa</span>
                </div>
                <span className="font-bold text-lg" style={{ color: COLORS.success }}>
                  KES {(analytics?.mpesa_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    background: COLORS.success,
                    width: `${(analytics?.mpesa_revenue || 0) / (analytics?.total_revenue || 1) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((analytics?.mpesa_revenue || 0) / (analytics?.total_revenue || 1) * 100)}% of total
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#2196F3' }} />
                  <span className="font-semibold text-gray-700">Bank Transfer</span>
                </div>
                <span className="font-bold text-lg" style={{ color: COLORS.info }}>
                  KES {(analytics?.bank_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    background: COLORS.info,
                    width: `${(analytics?.bank_revenue || 0) / (analytics?.total_revenue || 1) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((analytics?.bank_revenue || 0) / (analytics?.total_revenue || 1) * 100)}% of total
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg p-6 border" style={{ borderColor: COLORS.gray[200] }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.gray[900] }}>
            Statistics
          </h3>
          <div className="space-y-4">
            <StatRow
              label="Total Listings Featured"
              value={featuredListings.length.toString()}
              color={COLORS.primary[500]}
            />
            <StatRow
              label="Currently Active"
              value={activeListings.toString()}
              color={COLORS.success}
            />
            <StatRow
              label="Expired This Week"
              value={expiredListings.toString()}
              color={COLORS.warning}
            />
            <StatRow
              label="Price Per Feature"
              value={`KES ${analytics?.price_per_listing || 0}`}
              color={COLORS.secondary[500]}
            />
            <StatRow
              label="Duration"
              value={`${analytics?.duration_days || 0} days`}
              color={COLORS.info}
            />
          </div>
        </div>
      </div>

      {/* Featured Listings Table */}
      <div className="bg-white rounded-lg border" style={{ borderColor: COLORS.gray[200] }}>
        <div className="p-6 border-b" style={{ borderColor: COLORS.gray[200] }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: COLORS.gray[900] }}>
              Recent Featured Listings
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'revenue')}
                className="px-3 py-1 rounded border text-sm"
                style={{ borderColor: COLORS.gray[300] }}
              >
                <option value="date">Latest First</option>
                <option value="revenue">Highest Revenue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.gray[50], borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                <th className="px-6 py-4 text-left font-bold" style={{ color: COLORS.gray[700] }}>
                  Listing ID
                </th>
                <th className="px-6 py-4 text-left font-bold" style={{ color: COLORS.gray[700] }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left font-bold" style={{ color: COLORS.gray[700] }}>
                  Started
                </th>
                <th className="px-6 py-4 text-left font-bold" style={{ color: COLORS.gray[700] }}>
                  Expires
                </th>
                <th className="px-6 py-4 text-left font-bold" style={{ color: COLORS.gray[700] }}>
                  Revenue
                </th>
                <th className="px-6 py-4 text-left font-bold" style={{ color: COLORS.gray[700] }}>
                  Method
                </th>
                <th className="px-6 py-4 text-left font-bold" style={{ color: COLORS.gray[700] }}>
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.length > 0 ? (
                sortedListings.map((listing) => (
                  <tr
                    key={listing.id}
                    style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs" style={{ color: COLORS.gray[700] }}>
                        {listing.listing_id.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: listing.status === 'active' ? '#D1FAE5' : listing.status === 'expired' ? '#FEE2E2' : '#E0E7FF',
                          color: listing.status === 'active' ? COLORS.success : listing.status === 'expired' ? COLORS.danger : COLORS.secondary[600],
                        }}
                      >
                        {listing.status === 'active' ? '✅ Active' : listing.status === 'expired' ? '⏰ Expired' : '❌ Cancelled'}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ color: COLORS.gray[700] }}>
                      {new Date(listing.featured_start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4" style={{ color: COLORS.gray[700] }}>
                      {new Date(listing.featured_end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold" style={{ color: COLORS.success }}>
                        KES {listing.amount_paid.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          background: listing.payment_method === 'mpesa' ? '#D1FAE5' : '#DBEAFE',
                          color: listing.payment_method === 'mpesa' ? COLORS.success : COLORS.info,
                        }}
                      >
                        {listing.payment_method === 'mpesa' ? 'M-Pesa' : 'Bank'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs" style={{ color: COLORS.gray[500] }}>
                        {listing.mpesa_receipt_number?.slice(-8) || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center" style={{ color: COLORS.gray[500] }}>
                    No featured listings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 text-center" style={{ color: COLORS.gray[600] }}>
        <p className="text-sm">
          Showing <span className="font-bold">{sortedListings.length}</span> featured listings
          {daysActive > 0 && ` • Feature system active for ${daysActive} days`}
        </p>
      </div>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const AnalyticsCard: React.FC<{
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subtext, icon, color }) => (
  <div className="bg-white rounded-lg p-6 border" style={{ borderColor: COLORS.gray[200] }}>
    <div className="flex items-start justify-between mb-4">
      <h3 className="font-semibold text-sm" style={{ color: COLORS.gray[700] }}>
        {title}
      </h3>
      <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
    <p className="text-2xl font-bold mb-1" style={{ color: COLORS.gray[900] }}>
      {value}
    </p>
    <p className="text-xs" style={{ color: COLORS.gray[500] }}>
      {subtext}
    </p>
  </div>
);

const StatRow: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: COLORS.gray[200] }}>
    <span style={{ color: COLORS.gray[600] }}>{label}</span>
    <span className="font-bold text-lg" style={{ color }}>
      {value}
    </span>
  </div>
);

export default FeaturedListingsAnalyticsTab;
