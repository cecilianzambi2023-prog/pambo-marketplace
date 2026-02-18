/**
 * Liquidity Dashboard - Admin/Operations View
 * ===========================================
 * 
 * Real-time view of marketplace health:
 * - Category supply/demand balance
 * - Seller response SLA compliance
 * - Critical alerts requiring intervention
 * - Smart matching performance
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Users, Package } from 'lucide-react';
import {
  getAllCategoryLiquidity,
  getLowLiquidityAlerts,
  CategoryLiquidity,
} from '../services/liquidityEngine';

interface LiquidityDashboardProps {
  onClose: () => void;
}

export const LiquidityDashboard: React.FC<LiquidityDashboardProps> = ({ onClose }) => {
  const [categoryLiquidity, setCategoryLiquidity] = useState<CategoryLiquidity[]>([]);
  const [alerts, setAlerts] = useState<
    Array<{ category: string; issue: string; recommendation: string; urgency: 'high' | 'medium' | 'low' }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'categories' | 'alerts'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [categoryData, alertsData] = await Promise.all([
        getAllCategoryLiquidity(),
        getLowLiquidityAlerts(),
      ]);

      setCategoryLiquidity(categoryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading liquidity dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'balanced':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'undersupplied':
        return <TrendingUp className="text-orange-600" size={20} />;
      case 'oversupplied':
        return <TrendingDown className="text-blue-600" size={20} />;
      case 'critical':
        return <AlertTriangle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getUrgencyBadge = (urgency: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[urgency]}`}>
        {urgency.toUpperCase()}
      </span>
    );
  };

  // Calculate overall metrics
  const totalCategories = categoryLiquidity.length;
  const healthyCategories = categoryLiquidity.filter((c) => c.liquidityScore >= 70).length;
  const criticalCategories = categoryLiquidity.filter((c) => c.status === 'critical').length;
  const avgLiquidityScore =
    categoryLiquidity.length > 0
      ? Math.round(categoryLiquidity.reduce((sum, c) => sum + c.liquidityScore, 0) / categoryLiquidity.length)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Liquidity Dashboard</h2>
              <p className="text-blue-100 text-sm">Real-time marketplace health monitoring</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          {/* High-level KPIs */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-white/80 text-xs uppercase mb-1">Health Score</div>
              <div className="text-3xl font-bold">{avgLiquidityScore}</div>
              <div className="text-xs text-white/70 mt-1">Average across categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-white/80 text-xs uppercase mb-1">Healthy</div>
              <div className="text-3xl font-bold text-green-300">
                {healthyCategories}/{totalCategories}
              </div>
              <div className="text-xs text-white/70 mt-1">Categories above 70</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-white/80 text-xs uppercase mb-1">Critical</div>
              <div className="text-3xl font-bold text-red-300">{criticalCategories}</div>
              <div className="text-xs text-white/70 mt-1">Need intervention</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-white/80 text-xs uppercase mb-1">Alerts</div>
              <div className="text-3xl font-bold text-yellow-300">{alerts.length}</div>
              <div className="text-xs text-white/70 mt-1">Active alerts</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50 px-6">
          <div className="flex space-x-6">
            {(['overview', 'categories', 'alerts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-3 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  selectedTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
                {tab === 'alerts' && alerts.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading liquidity data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-700 font-semibold">Balanced Categories</span>
                        <CheckCircle className="text-green-600" size={20} />
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {categoryLiquidity.filter((c) => c.status === 'balanced').length}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-700 font-semibold">Undersupplied</span>
                        <TrendingUp className="text-orange-600" size={20} />
                      </div>
                      <div className="text-2xl font-bold text-orange-900">
                        {categoryLiquidity.filter((c) => c.status === 'undersupplied').length}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-700 font-semibold">Oversupplied</span>
                        <TrendingDown className="text-blue-600" size={20} />
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {categoryLiquidity.filter((c) => c.status === 'oversupplied').length}
                      </div>
                    </div>
                  </div>

                  {/* Top Categories by Health */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Top Performing Categories</h3>
                    <div className="space-y-2">
                      {categoryLiquidity
                        .sort((a, b) => b.liquidityScore - a.liquidityScore)
                        .slice(0, 5)
                        .map((cat) => (
                          <div
                            key={cat.category}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(cat.status)}
                              <span className="font-medium">{cat.category}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">
                                {cat.activeListings} listings • {cat.last7DaysInquiries} inquiries
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getHealthColor(cat.liquidityScore)}`}>
                                {cat.liquidityScore}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {selectedTab === 'categories' && (
                <div className="space-y-4">
                  {categoryLiquidity
                    .sort((a, b) => a.liquidityScore - b.liquidityScore)
                    .map((cat) => (
                      <div
                        key={cat.category}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(cat.status)}
                            <div>
                              <h4 className="font-semibold text-lg">{cat.category}</h4>
                              <span className="text-sm text-gray-600 capitalize">{cat.status}</span>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-lg font-bold ${getHealthColor(cat.liquidityScore)}`}>
                            {cat.liquidityScore}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 mb-1 flex items-center">
                              <Package size={14} className="mr-1" /> Supply
                            </div>
                            <div className="font-semibold">{cat.activeListings} listings</div>
                            <div className="text-gray-500">{cat.activeSellers} sellers</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1 flex items-center">
                              <Users size={14} className="mr-1" /> Demand (7d)
                            </div>
                            <div className="font-semibold">{cat.last7DaysInquiries} inquiries</div>
                            <div className="text-gray-500">{cat.last7DaysContacts} contacts</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">D/S Ratio</div>
                            <div className="font-semibold">{cat.demandSupplyRatio.toFixed(2)}</div>
                            <div className="text-gray-500">Target: 2-5</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1 flex items-center">
                              <Clock size={14} className="mr-1" /> Response Time
                            </div>
                            <div className="font-semibold">{cat.topSellerResponseTime.toFixed(1)}h</div>
                            <div className="text-gray-500">SLA: {'<'}2h</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Alerts Tab */}
              {selectedTab === 'alerts' && (
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
                      <p className="text-gray-600">No critical liquidity alerts at this time.</p>
                    </div>
                  ) : (
                    alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${
                          alert.urgency === 'high'
                            ? 'border-red-500 bg-red-50'
                            : alert.urgency === 'medium'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-blue-500 bg-blue-50'
                        } p-4 rounded-r-lg`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle
                              className={
                                alert.urgency === 'high'
                                  ? 'text-red-600'
                                  : alert.urgency === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                              }
                              size={20}
                            />
                            <h4 className="font-semibold text-gray-900">{alert.category}</h4>
                          </div>
                          {getUrgencyBadge(alert.urgency)}
                        </div>
                        <div className="ml-7 space-y-2">
                          <p className="text-gray-700">
                            <strong>Issue:</strong> {alert.issue}
                          </p>
                          <p className="text-gray-700">
                            <strong>Recommendation:</strong> {alert.recommendation}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};
