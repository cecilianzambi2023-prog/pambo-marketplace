/**
 * SubscriptionRevenueAnalytics.tsx
 * ==================================
 *
 * Admin Dashboard showing:
 * - Revenue by subscription tier
 * - Total MRR (Monthly Recurring Revenue)
 * - Subscriber count per tier
 * - Revenue trends
 *
 * Commission: 0% (Sellers keep 100%)
 * Payment Model: Direct-Connect (No Escrow)
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabaseClient } from '../src/lib/supabaseClient';
import { SUBSCRIPTION_TIERS } from '../constants';

interface SubriptionStats {
  tier_id: string;
  tier_name: string;
  subscriber_count: number;
  monthly_revenue: number;
  annual_revenue: number;
  mrr: number; // Monthly Recurring Revenue
}

export const SubscriptionRevenueAnalytics: React.FC = () => {
  const [stats, setStats] = useState<SubriptionStats[]>([]);
  const [totalMRR, setTotalMRR] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user }
      } = await supabaseClient.auth.getUser();

      // Only allow info@pambo.biz to access analytics
      if (user?.email === 'info@pambo.biz') {
        setIsAuthorized(true);
        await fetchRevenueData();
      } else {
        setIsAuthorized(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAuthorized(false);
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Get subscription payments grouped by tier
      const { data, error } = await supabaseClient
        .from('subscription_payments')
        .select('subscription_tier_id, created_at, amount, billing_period')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate revenue by tier
      const tierStats = new Map<string, SubriptionStats>();

      (data || []).forEach((payment: any) => {
        const tierId = payment.subscription_tier_id;
        const tier = Object.values(SUBSCRIPTION_TIERS).find((t) => t.id === tierId);

        if (!tier) return;

        if (!tierStats.has(tierId)) {
          tierStats.set(tierId, {
            tier_id: tierId,
            tier_name: tier.name,
            subscriber_count: 0,
            monthly_revenue: 0,
            annual_revenue: 0,
            mrr: 0
          });
        }

        const stats = tierStats.get(tierId)!;

        if (tier.billing_period === 'MONTHLY') {
          stats.monthly_revenue += payment.amount;
          stats.mrr += tier.price; // MRR = sum of all monthly subscriptions
        } else if (tier.billing_period === 'YEARLY') {
          stats.annual_revenue += payment.amount;
          // MRR is amortized: annual / 12
          stats.mrr += tier.price / 12;
        }

        stats.subscriber_count += 1;
      });

      const statsArray = Array.from(tierStats.values());
      setStats(statsArray);

      // Calculate total MRR
      const totalMRR = statsArray.reduce((sum, s) => sum + s.mrr, 0);
      setTotalMRR(totalMRR);

      // Calculate total subscribers
      const totalSubs = statsArray.reduce((sum, s) => sum + s.subscriber_count, 0);
      setTotalSubscribers(totalSubs);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading revenue analytics...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">🔒 Access Denied</h2>
        <p className="text-slate-300">This dashboard is only accessible to administrators.</p>
        <p className="text-slate-400 text-sm mt-2">Contact info@pambo.biz for access.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Revenue Analytics</h1>
        <p className="text-slate-300">Subscription Tier Performance (Commission: 0%)</p>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total MRR */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold">KES {totalMRR.toLocaleString()}</p>
            </div>
            <TrendingUp size={40} className="opacity-30" />
          </div>
        </div>

        {/* Total Subscribers */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Subscribers</p>
              <p className="text-3xl font-bold">{totalSubscribers}</p>
            </div>
            <Users size={40} className="opacity-30" />
          </div>
        </div>

        {/* Annual Projection */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Annual Projection</p>
              <p className="text-3xl font-bold">KES {(totalMRR * 12).toLocaleString()}</p>
            </div>
            <DollarSign size={40} className="opacity-30" />
          </div>
        </div>
      </div>

      {/* TIER BREAKDOWN TABLE */}
      <div className="bg-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr className="text-white text-left">
              <th className="px-6 py-4 font-semibold">Subscription Tier</th>
              <th className="px-6 py-4 font-semibold text-right">Subscribers</th>
              <th className="px-6 py-4 font-semibold text-right">Monthly Revenue</th>
              <th className="px-6 py-4 font-semibold text-right">MRR</th>
              <th className="px-6 py-4 font-semibold text-right">Annual Projection</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, idx) => (
              <tr key={stat.tier_id} className={idx % 2 === 0 ? 'bg-slate-700' : 'bg-slate-600'}>
                <td className="px-6 py-4 text-white font-medium">{stat.tier_name}</td>
                <td className="px-6 py-4 text-right text-slate-100">{stat.subscriber_count}</td>
                <td className="px-6 py-4 text-right text-slate-100">
                  KES {stat.monthly_revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-green-300 font-semibold">
                  KES {stat.mrr.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-blue-300">
                  KES {(stat.mrr * 12).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NOTES */}
      <div className="mt-8 bg-slate-700 p-6 rounded-lg border border-slate-600">
        <h3 className="text-white font-semibold mb-3">📊 Business Model</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>
            ✅ <strong>Commission:</strong> 0% - Sellers keep 100% of their earnings
          </li>
          <li>
            ✅ <strong>Payment Model:</strong> Direct-Connect - No escrow delays
          </li>
          <li>
            ✅ <strong>Hub Access:</strong> Determined by subscription tier
          </li>
          <li>
            ✅ <strong>MRR:</strong> Monthly subscriptions (Starter/Pro/Enterprise) + Annual
            subscriptions amortized (Mkulima)
          </li>
        </ul>
      </div>
    </div>
  );
};
