/**
 * HubDashboard.tsx
 * ================
 * Hub-Specific Dashboard Component
 * 
 * Displays:
 * - Hub overview and metrics
 * - Hub-specific quick actions
 * - Featured listings for the hub
 * - Hub analytics
 * - Recent activity
 */

import React, { useEffect, useState } from 'react';
import {
  useHub,
  useHubFeatures,
  useHubRules,
  useHubBranding,
  useHubNavigation,
} from '../contexts/HubContext';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowRight, Plus, Search } from 'lucide-react';

// ===================================
// HUB DASHBOARD MAIN COMPONENT
// ===================================

export const HubDashboard: React.FC = () => {
  const { hub, hubId } = useHub();
  const { primary, secondary, accent } = useHubBranding();

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${accent}15 0%, white 100%)`,
      }}
    >
      {/* Hero Section */}
      <HubHeroSection hub={hub} primary={primary} accent={accent} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <HubStatsOverview hub={hub} />

        {/* Quick Actions */}
        <HubQuickActionsSection hub={hub} primary={primary} />

        {/* Hub Features Showcase */}
        <HubFeaturesShowcase hub={hub} primary={primary} />

        {/* Analytics Section */}
        <HubAnalyticsSection hubId={hubId} primary={primary} />

        {/* Recent Activity */}
        <HubRecentActivity hub={hub} />
      </main>
    </div>
  );
};

// ===================================
// HERO SECTION
// ===================================

interface HubHeroSectionProps {
  hub: any;
  primary: string;
  accent: string;
}

const HubHeroSection: React.FC<HubHeroSectionProps> = ({ hub, primary, accent }) => {
  return (
    <div
      className="relative overflow-hidden py-16 px-4"
      style={{
        background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-start gap-6">
          <div className="text-6xl">{hub.icon}</div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{hub.displayName}</h1>
            <p className="text-white/90 text-lg mb-4">{hub.description}</p>
            <div className="flex gap-3">
              <a
                href={`/hub/${hub.slug}/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:shadow-lg transition"
              >
                <Plus size={18} />
                Create Listing
              </a>
              <a
                href={`/hub/${hub.slug}/browse`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition"
              >
                <Search size={18} />
                Browse Listings
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-4 right-4 w-64 h-64 rounded-full opacity-10"
        style={{ backgroundColor: 'white' }}
      />
      <div
        className="absolute bottom-4 right-1/4 w-96 h-96 rounded-full opacity-5"
        style={{ backgroundColor: 'white' }}
      />
    </div>
  );
};

// ===================================
// STATS OVERVIEW
// ===================================

interface StatsData {
  activeListings: number;
  totalSales: number;
  activeUsers: number;
  gmv: number;
}

const HubStatsOverview: React.FC<{ hub: any }> = ({ hub }) => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    // Mock data from hub config
    setStats({
      activeListings: hub.metrics?.listings || 0,
      totalSales: Math.floor(Math.random() * 50000),
      activeUsers: hub.metrics?.users || 0,
      gmv: hub.metrics?.gmv || 0,
    });
  }, [hub]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={<ShoppingBag size={24} />}
        label="Active Listings"
        value={stats.activeListings.toLocaleString()}
        trend="up"
      />
      <StatCard
        icon={<DollarSign size={24} />}
        label="GMV (KES)"
        value={`${(stats.gmv / 1e9).toFixed(1)}B`}
        trend="up"
      />
      <StatCard
        icon={<Users size={24} />}
        label="Active Users"
        value={stats.activeUsers.toLocaleString()}
        trend="stable"
      />
      <StatCard
        icon={<TrendingUp size={24} />}
        label="Monthly Growth"
        value="+12.5%"
        trend="up"
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend }) => {
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="text-gray-400">{icon}</div>
        <span className={`text-sm font-semibold ${trendColor}`}>{trendSymbol}</span>
      </div>
      <p className="text-sm text-gray-600 mt-4 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// ===================================
// QUICK ACTIONS SECTION
// ===================================

interface HubQuickActionsSectionProps {
  hub: any;
  primary: string;
}

const HubQuickActionsSection: React.FC<HubQuickActionsSectionProps> = ({ hub, primary }) => {
  const actions: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    description: string;
    color: string;
  }> = [
    {
      id: 'create',
      label: 'Create Listing',
      icon: <Plus size={24} />,
      href: `/hub/${hub.slug}/create`,
      description: 'Add a new product or service',
      color: 'bg-blue-50',
    },
    {
      id: 'browse',
      label: 'Browse Listings',
      icon: <Search size={24} />,
      href: `/hub/${hub.slug}/browse`,
      description: 'Explore products and services',
      color: 'bg-purple-50',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp size={24} />,
      href: `/hub/${hub.slug}/analytics`,
      description: 'View your performance metrics',
      color: 'bg-green-50',
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: <ShoppingBag size={24} />,
      href: `/hub/${hub.slug}/orders`,
      description: 'Manage your transactions',
      color: 'bg-amber-50',
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <a
            key={action.id}
            href={action.href}
            className={`p-6 ${action.color} rounded-lg border-2 hover:shadow-lg transition group`}
            style={{ borderColor: primary }}
          >
            <div className="flex items-start justify-between mb-3">
              <div style={{ color: primary }}>{action.icon}</div>
              <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition" />
            </div>
            <p className="font-semibold text-gray-900">{action.label}</p>
            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

// ===================================
// HUB FEATURES SHOWCASE
// ===================================

const HubFeaturesShowcase: React.FC<{ hub: any; primary: string }> = ({ hub, primary }) => {
  const { hasFeature } = useHubFeatures();
  const enabledFeatures = Object.entries(hub.features)
    .filter(([, feature]: any) => feature.enabled)
    .slice(0, 5);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Hub Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enabledFeatures.map(([key, feature]: any) => (
          <div
            key={key}
            className="p-6 bg-white rounded-lg border-l-4 hover:shadow-lg transition"
            style={{ borderLeftColor: primary }}
          >
            <h3 className="font-semibold text-gray-900 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================
// HUB ANALYTICS SECTION
// ===================================

interface HubAnalyticsSectionProps {
  hubId: string;
  primary: string;
}

const HubAnalyticsSection: React.FC<HubAnalyticsSectionProps> = ({ hubId, primary }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    // Mock analytics data
    setAnalyticsData({
      daily: Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        listings: Math.floor(Math.random() * 100),
        sales: Math.floor(Math.random() * 50),
      })),
      topCategories: [
        { name: 'Electronics', percentage: 35 },
        { name: 'Fashion', percentage: 25 },
        { name: 'Home', percentage: 20 },
        { name: 'Other', percentage: 20 },
      ],
    });
  }, []);

  if (!analyticsData) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Chart */}
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Activity This Week</h3>
          <div className="flex items-end gap-2 h-48">
            {analyticsData.daily.map((data: any) => (
              <div key={data.day} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t relative" style={{ height: `${(data.listings / 100) * 150}px` }}>
                  <div
                    className="w-full rounded-t transition"
                    style={{
                      backgroundColor: primary,
                      height: `${(data.listings / 100) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">{data.day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analyticsData.topCategories.map((category: any) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-gray-600">{category.name}</p>
                  <p className="text-sm font-semibold text-gray-900">{category.percentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition"
                    style={{
                      backgroundColor: primary,
                      width: `${category.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================
// RECENT ACTIVITY
// ===================================

interface ActivityItem {
  id: string;
  type: 'listing_created' | 'listing_sold' | 'user_joined' | 'review_posted';
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
}

const HubRecentActivity: React.FC<{ hub: any }> = ({ hub }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Mock recent activity
    setActivities([
      {
        id: '1',
        type: 'listing_created',
        description: 'New listing: Premium Electronics Bundle',
        timestamp: new Date(Date.now() - 15 * 60000),
        icon: <Plus size={18} />,
      },
      {
        id: '2',
        type: 'listing_sold',
        description: 'Vintage Camera - Sold for KES 15,000',
        timestamp: new Date(Date.now() - 30 * 60000),
        icon: <ShoppingBag size={18} />,
      },
      {
        id: '3',
        type: 'user_joined',
        description: '42 new users joined',
        timestamp: new Date(Date.now() - 60 * 60000),
        icon: <Users size={18} />,
      },
      {
        id: '4',
        type: 'review_posted',
        description: 'New 5-star review received',
        timestamp: new Date(Date.now() - 120 * 60000),
        icon: <TrendingUp size={18} />,
      },
    ]);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition flex items-start gap-4">
              <div className="text-blue-600 mt-1 flex-shrink-0">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================================
// UTILITIES
// ===================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
