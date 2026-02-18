/**
 * Admin Dispute Center - ADMIN ONLY
 * Centralized dashboard for managing disputes across all hubs
 * 
 * Access Control: Only info@pambo.biz can access
 * Features:
 * - View all disputes (Marketplace, Wholesale, Services)
 * - Filter by status (Urgent, Pending, Resolved)
 * - Real-time dispute updates
 * - Evidence review
 * - Admin resolution tools
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Filter,
  Eye,
  MessageSquare,
  TrendingUp,
  Shield,
  Download,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  mpesa_receipt_number: string;
  status: string;
  hub: 'marketplace' | 'wholesale' | 'services';
  evidence_urls: string[];
  created_at: string;
  updated_at: string;
  buyer?: {
    full_name: string;
    avatar_url: string;
  };
  seller?: {
    full_name: string;
    avatar_url: string;
  };
}

type FilterType = 'all' | 'urgent' | 'pending_seller' | 'resolved';

export const DisputeCenter: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    pending: 0,
    resolved: 0
  });

  // SECURITY: Check admin access on mount
  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Load disputes when authorized
  useEffect(() => {
    if (isAuthorized) {
      loadAllDisputes();
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(loadAllDisputes, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  // Apply filters
  useEffect(() => {
    applyFilters(selectedFilter);
  }, [disputes, selectedFilter]);

  /**
   * SECURITY: Verify only admin email can access
   */
  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const adminEmail = 'info@pambo.biz';
      
      if (user?.email === adminEmail) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthorized(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  /**
   * Load all disputes from all hubs
   */
  const loadAllDisputes = async () => {
    try {
      setIsLoading(true);
      
      // Fetch disputes from all hubs
      const { data: allDisputes, error } = await supabase
        .from('disputes')
        .select(`
          id,
          order_id,
          buyer_id,
          seller_id,
          category,
          title,
          description,
          amount,
          mpesa_receipt_number,
          status,
          hub,
          evidence_urls,
          created_at,
          updated_at,
          buyer:profiles!disputes_buyer_id_fkey(
            full_name,
            avatar_url
          ),
          seller:profiles!disputes_seller_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load disputes error:', error);
        return;
      }

      setDisputes(allDisputes || []);
      setLastRefresh(new Date().toLocaleTimeString());
      
      // Calculate stats
      if (allDisputes) {
        const urgent = allDisputes.filter(d => {
          if (d.status !== 'seller_response_pending') return false;
          const created = new Date(d.created_at);
          const deadline = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
          const daysLeft = (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          return daysLeft <= 3;
        }).length;

        const pending = allDisputes.filter(d => d.status === 'seller_response_pending').length;
        const resolved = allDisputes.filter(d => d.status === 'resolved').length;

        setStats({
          total: allDisputes.length,
          urgent,
          pending,
          resolved
        });
      }
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters to disputes list
   */
  const applyFilters = (filter: FilterType) => {
    let filtered = disputes;

    switch (filter) {
      case 'urgent':
        filtered = disputes.filter(d => {
          if (d.status !== 'seller_response_pending') return false;
          const created = new Date(d.created_at);
          const deadline = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
          const daysLeft = (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          return daysLeft <= 3;
        });
        break;
      case 'pending_seller':
        filtered = disputes.filter(d => d.status === 'seller_response_pending');
        break;
      case 'resolved':
        filtered = disputes.filter(d => d.status === 'resolved');
        break;
      case 'all':
      default:
        filtered = disputes;
    }

    setFilteredDisputes(filtered);
  };

  const getHubBadgeColor = (hub: string) => {
    switch (hub) {
      case 'marketplace': return 'bg-blue-100 text-blue-700';
      case 'wholesale': return 'bg-purple-100 text-purple-700';
      case 'services': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'seller_response_pending': return 'bg-red-100 text-red-700 font-semibold';
      case 'in_negotiation': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysRemaining = (createdDate: string) => {
    const created = new Date(createdDate);
    const deadline = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diff = deadline.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  // ACCESS CONTROL CHECK
  if (isCheckingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto mb-2 text-orange-600 animate-spin" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg border-2 border-red-200">
          <Lock size={48} className="mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
          <p className="text-red-700">This page is restricted to admins only.</p>
          <p className="text-sm text-red-600 mt-2">Contact support if you believe this is a mistake.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield size={32} className="text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">Dispute Center</h1>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                ADMIN ONLY
              </span>
            </div>
            <button
              onClick={loadAllDisputes}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <p className="text-gray-600">Manage disputes across Marketplace, Wholesale, and Services hubs</p>
          {lastRefresh && <p className="text-xs text-gray-500 mt-2">Last updated: {lastRefresh}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">TOTAL DISPUTES</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-red-200">
            <p className="text-xs text-red-700 font-semibold">🚨 URGENT</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.urgent}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-yellow-200">
            <p className="text-xs text-yellow-700 font-semibold">⏳ PENDING SELLER</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <p className="text-xs text-green-700 font-semibold">✅ RESOLVED</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('urgent')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              selectedFilter === 'urgent'
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-700 border-2 border-red-200 hover:border-red-400'
            }`}
          >
            <AlertCircle size={16} /> Urgent
          </button>
          <button
            onClick={() => setSelectedFilter('pending_seller')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              selectedFilter === 'pending_seller'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-yellow-700 border-2 border-yellow-200 hover:border-yellow-400'
            }`}
          >
            <Clock size={16} /> Pending Seller
          </button>
          <button
            onClick={() => setSelectedFilter('resolved')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              selectedFilter === 'resolved'
                ? 'bg-green-600 text-white'
                : 'bg-white text-green-700 border-2 border-green-200 hover:border-green-400'
            }`}
          >
            <CheckCircle size={16} /> Resolved
          </button>
        </div>

        {/* Disputes Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <RefreshCw size={32} className="mx-auto mb-2 text-orange-600 animate-spin" />
              <p>Loading disputes...</p>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">No disputes found</p>
              <p className="text-sm">All {selectedFilter} disputes have been resolved 🎉</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Hub</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDisputes.map(dispute => (
                    <tr key={dispute.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">#{dispute.order_id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">{dispute.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {dispute.buyer?.avatar_url && (
                            <img
                              src={dispute.buyer.avatar_url}
                              alt="Buyer"
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span>{dispute.buyer?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {dispute.seller?.avatar_url && (
                            <img
                              src={dispute.seller.avatar_url}
                              alt="Seller"
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span>{dispute.seller?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getHubBadgeColor(dispute.hub)}`}>
                          {dispute.hub.charAt(0).toUpperCase() + dispute.hub.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-orange-600">
                        KES {dispute.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadgeColor(dispute.status)}`}>
                          {dispute.status === 'seller_response_pending' ? '⏳ Awaiting' : dispute.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {dispute.status === 'seller_response_pending' ? (
                          <span className={`font-bold ${getDaysRemaining(dispute.created_at) <= 3 ? 'text-red-600' : 'text-gray-700'}`}>
                            {getDaysRemaining(dispute.created_at)}d
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1">
                          <Eye size={16} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>Showing {filteredDisputes.length} of {disputes.length} disputes</p>
        </div>
      </div>
    </div>
  );
};

export default DisputeCenter;
