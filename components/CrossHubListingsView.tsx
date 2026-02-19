/**
 * CrossHubListingsView.tsx
 * =========================
 *
 * Component that displays user's listings across ALL hubs in one unified view
 * Enables user to see their full selling presence across the 6 hubs
 *
 * ARCHITECTURE:
 * - Shared: User profile (users are same across all hubs)
 * - Segregated: Listings (each hub has sep listings, filtered by hub_id)
 * - Query: Fetch listings WHERE created_by = userId AND hub_id IN (all hubs)
 * - Display: Group by hub, show aggregated stats and per-hub listing counts
 */

import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../src/lib/supabaseClient';
import { getHub, HUB_CONFIGS } from '../config/HubConfig';
import { useHub } from '../contexts/HubContext';

// ======================
// TYPES
// ======================

interface HubListing {
  id: string;
  hub_id: string;
  title: string;
  price: number;
  status: 'active' | 'sold' | 'archived';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface HubStats {
  hub_id: string;
  listing_count: number;
  active_count: number;
  total_gmv: number;
  listings: HubListing[];
}

// ======================
// MAIN COMPONENT
// ======================

export const CrossHubListingsView: React.FC = () => {
  const [stats, setStats] = useState<HubStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const { currentHub } = useHub();

  // ===== FETCH USER'S LISTINGS ACROSS ALL HUBS =====

  useEffect(() => {
    const fetchCrossHubListings = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) {
          setStats([]);
          return;
        }

        // Fetch listings for this user across ALL hubs
        const { data: allListings, error } = await supabaseClient
          .from('listings')
          .select('id, hub_id, title, price, status, image_url, created_at, updated_at')
          .eq('created_by', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching listings:', error);
          setStats([]);
          return;
        }

        // Group listings by hub
        const hubListingsMap = new Map<string, HubListing[]>();

        // Initialize empty arrays for all hubs
        for (const hubConfig of HUB_CONFIGS) {
          hubListingsMap.set(hubConfig.id, []);
        }

        // Sort listings into hubs
        if (allListings) {
          for (const listing of allListings) {
            const hub = hubListingsMap.get(listing.hub_id);
            if (hub) {
              hub.push(listing);
            }
          }
        }

        // Calculate stats for each hub
        const hubStats: HubStats[] = [];

        for (const [hubId, listings] of hubListingsMap) {
          const activeCount = listings.filter((l) => l.status === 'active').length;
          const totalGmv = listings
            .filter((l) => l.status === 'sold')
            .reduce((sum, l) => sum + (l.price || 0), 0);

          hubStats.push({
            hub_id: hubId,
            listing_count: listings.length,
            active_count: activeCount,
            total_gmv: totalGmv,
            listings: listings.sort(
              (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
          });
        }

        setStats(hubStats.filter((s) => s.listing_count > 0 || s.hub_id === currentHub)); // Show all or at least current hub
      } catch (err) {
        console.error('Failed to fetch cross-hub listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCrossHubListings();
  }, [currentHub]);

  // ===== RENDER LOADING =====

  if (loading) {
    return (
      <div className="cross-hub-view loading">
        <div className="loading-spinner">Loading your listings across all hubs...</div>
      </div>
    );
  }

  // ===== RENDER EMPTY STATE =====

  if (stats.length === 0 || stats.every((s) => s.listing_count === 0)) {
    return (
      <div className="cross-hub-view empty">
        <div className="empty-state">
          <h3>No Listings Yet</h3>
          <p>You haven't created any listings yet. Start by listing a product in any hub.</p>
        </div>
      </div>
    );
  }

  // ===== CALCULATE TOTALS =====

  const totalListings = stats.reduce((sum, s) => sum + s.listing_count, 0);
  const totalActive = stats.reduce((sum, s) => sum + s.active_count, 0);
  const totalGMV = stats.reduce((sum, s) => sum + s.total_gmv, 0);

  // ===== RENDER SUMMARY =====

  return (
    <div className="cross-hub-view">
      {/* HEADER SECTION */}
      <div className="chv-header">
        <h2>📊 Your Presence Across All Hubs</h2>
        <p className="chv-subtitle">
          View your complete selling presence. Listings are segregated by hub, but your profile and
          subscription tier apply across all hubs.
        </p>
      </div>

      {/* OVERALL STATS */}
      <div className="chv-summary-cards">
        <div className="summary-card">
          <div className="card-number">{totalListings}</div>
          <div className="card-label">Total Listings</div>
          <div className="card-detail">Across all hubs</div>
        </div>
        <div className="summary-card active">
          <div className="card-number">{totalActive}</div>
          <div className="card-label">Active Now</div>
          <div className="card-detail">Ready to sell</div>
        </div>
        <div className="summary-card gmv">
          <div className="card-number">{totalGMV.toLocaleString()} KES</div>
          <div className="card-label">Total GMV</div>
          <div className="card-detail">Lifetime value</div>
        </div>
      </div>

      {/* HUB BREAKDOWN */}
      <div className="chv-hub-breakdown">
        <h3>💼 Listings by Hub</h3>

        <div className="hub-grid">
          {stats
            .filter((s) => s.listing_count > 0)
            .sort((a, b) => b.listing_count - a.listing_count)
            .map((hubStat) => {
              const hubConfig = getHub(hubStat.hub_id as any);
              if (!hubConfig) return null;

              return (
                <div key={hubStat.hub_id} className={`hub-card hub-${hubStat.hub_id}`}>
                  {/* HUB HEADER */}
                  <div className="hub-card-header">
                    <div className="hub-icon" style={{ backgroundColor: hubConfig.color }}>
                      {hubConfig.icon}
                    </div>
                    <div className="hub-info">
                      <h4>{hubConfig.displayName}</h4>
                      <p className="hub-category">{hubConfig.category}</p>
                    </div>
                    <button
                      className="hub-navigate-btn"
                      onClick={() => setSelectedHub(hubStat.hub_id)}
                    >
                      View →
                    </button>
                  </div>

                  {/* HUB STATS */}
                  <div className="hub-stats">
                    <div className="hub-stat-item">
                      <span className="stat-label">Total</span>
                      <span className="stat-value">{hubStat.listing_count}</span>
                    </div>
                    <div className="hub-stat-item">
                      <span className="stat-label">Active</span>
                      <span className="stat-value active">{hubStat.active_count}</span>
                    </div>
                    <div className="hub-stat-item">
                      <span className="stat-label">GMV</span>
                      <span className="stat-value gmv">
                        {hubStat.total_gmv.toLocaleString()} KES
                      </span>
                    </div>
                  </div>

                  {/* RECENT LISTINGS */}
                  <div className="hub-recent-listings">
                    <p className="recent-label">Recent:</p>
                    <ul>
                      {hubStat.listings.slice(0, 3).map((listing) => (
                        <li key={listing.id}>
                          <span className="listing-title">{listing.title.substring(0, 25)}...</span>
                          <span className={`listing-status ${listing.status}`}>
                            {listing.status}
                          </span>
                        </li>
                      ))}
                      {hubStat.listings.length > 3 && (
                        <li className="more-listings">+{hubStat.listings.length - 3} more</li>
                      )}
                    </ul>
                  </div>

                  {/* RULES & LIMITS */}
                  <div className="hub-rules">
                    <p className="rules-label">Hub-specific rules:</p>
                    <ul>
                      {hubConfig.rules.commissionFee > 0 && (
                        <li>💰 {hubConfig.rules.commissionFee}% commission</li>
                      )}
                      {hubConfig.rules.verificationRequired && <li>✅ Verification required</li>}
                      {hubConfig.features.escrow && <li>🔒 Escrow protection</li>}
                      {hubConfig.features.shipping && <li>📦 Shipping available</li>}
                    </ul>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ARCHITECTURE INFO */}
      <div className="chv-architecture-info">
        <h3>🏗️ Architecture: How This Works</h3>
        <div className="architecture-boxes">
          <div className="arch-box shared">
            <h4>SHARED (Across All Hubs)</h4>
            <ul>
              <li>✅ Your Profile</li>
              <li>✅ Subscription Tier</li>
              <li>✅ Verification Badge</li>
              <li>✅ M-Pesa Account</li>
            </ul>
            <p className="explanation">
              You have ONE profile. When you upgrade your subscription in any hub, it applies to ALL
              hubs.
            </p>
          </div>

          <div className="arch-box segregated">
            <h4>SEGREGATED (Per Hub)</h4>
            <ul>
              <li>📍 Listings</li>
              <li>📊 Analytics</li>
              <li>⭐ Reviews</li>
              <li>💬 Messages</li>
            </ul>
            <p className="explanation">
              Each hub has its own listings, analytics, and reviews. Your Marketplace listings don't
              appear in Mkulima.
            </p>
          </div>
        </div>
      </div>

      {/* DETAILED HUB VIEW (if selected) */}
      {selectedHub && (
        <DetailedHubView
          hubId={selectedHub}
          stats={stats.find((s) => s.hub_id === selectedHub)}
          onClose={() => setSelectedHub(null)}
        />
      )}

      {/* STYLES */}
      <style>{`
        .cross-hub-view {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .chv-header {
          margin-bottom: 32px;
        }

        .chv-header h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .chv-subtitle {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }

        .chv-summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .summary-card {
          background: #f5f5f5;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s;
        }

        .summary-card:hover {
          background: #efefef;
          transform: translateY(-2px);
        }

        .summary-card.active {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
        }

        .summary-card.gmv {
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
        }

        .card-number {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .card-label {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          opacity: 0.8;
        }

        .card-detail {
          font-size: 12px;
          opacity: 0.7;
        }

        .chv-hub-breakdown {
          margin-bottom: 40px;
        }

        .chv-hub-breakdown h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #1a1a1a;
        }

        .hub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .hub-card {
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          transition: all 0.2s;
        }

        .hub-card:hover {
          border-color: #999;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .hub-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fafafa;
          border-bottom: 1px solid #e0e0e0;
        }

        .hub-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }

        .hub-info {
          flex: 1;
        }

        .hub-info h4 {
          font-size: 14px;
          font-weight: 700;
          margin: 0;
          color: #1a1a1a;
        }

        .hub-category {
          font-size: 12px;
          color: #999;
          margin: 4px 0 0 0;
        }

        .hub-navigate-btn {
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .hub-navigate-btn:hover {
          background: #1976D2;
        }

        .hub-stats {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #fafafa;
          border-bottom: 1px solid #e0e0e0;
        }

        .hub-stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #999;
          font-weight: 600;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .stat-value.active {
          color: #4CAF50;
        }

        .stat-value.gmv {
          color: #2196F3;
        }

        .hub-recent-listings {
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
        }

        .recent-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .hub-recent-listings ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .hub-recent-listings li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .hub-recent-listings li:last-child {
          border-bottom: none;
        }

        .listing-title {
          flex: 1;
          color: #1a1a1a;
          font-weight: 500;
        }

        .listing-status {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .listing-status.active {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .listing-status.sold {
          background: #bbdefb;
          color: #1565c0;
        }

        .more-listings {
          color: #2196F3;
          text-align: center;
          justify-content: center !important;
          font-weight: 600;
        }

        .hub-rules {
          padding: 16px;
        }

        .rules-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .hub-rules ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .hub-rules li {
          font-size: 12px;
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 4px;
          color: #666;
        }

        .chv-architecture-info {
          margin-top: 40px;
          padding: 24px;
          background: #f9f9f9;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
        }

        .chv-architecture-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #1a1a1a;
        }

        .architecture-boxes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .arch-box {
          background: white;
          border-radius: 8px;
          padding: 16px;
          border-left: 4px solid #2196F3;
        }

        .arch-box.shared {
          border-left-color: #4CAF50;
        }

        .arch-box.segregated {
          border-left-color: #FF9800;
        }

        .arch-box h4 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .arch-box ul {
          list-style: none;
          padding: 0;
          margin: 0 0 12px 0;
        }

        .arch-box li {
          font-size: 13px;
          padding: 4px 0;
          color: #666;
        }

        .explanation {
          font-size: 12px;
          color: #999;
          line-height: 1.5;
          margin: 0;
          font-style: italic;
        }

        .loading {
          text-align: center;
          padding: 60px 24px;
        }

        .loading-spinner {
          font-size: 16px;
          color: #666;
        }

        .empty {
          text-align: center;
          padding: 60px 24px;
        }

        .empty-state h3 {
          font-size: 20px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #999;
        }
      `}</style>
    </div>
  );
};

// ======================
// DETAILED HUB VIEW
// ======================

interface DetailedHubViewProps {
  hubId: string;
  stats?: HubStats;
  onClose: () => void;
}

const DetailedHubView: React.FC<DetailedHubViewProps> = ({ hubId, stats, onClose }) => {
  const hubConfig = getHub(hubId as any);

  if (!hubConfig || !stats) {
    return null;
  }

  return (
    <div className="detailed-hub-view-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon" style={{ backgroundColor: hubConfig.color }}>
              {hubConfig.icon}
            </div>
            <div>
              <h2>{hubConfig.displayName}</h2>
              <p>{hubConfig.category}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <h3>All Listings ({stats.listing_count} total)</h3>
          <div className="listings-table">
            {stats.listings.map((listing) => (
              <div key={listing.id} className="listing-row">
                <div className="listing-info">
                  <h4>{listing.title}</h4>
                  <p className="listing-meta">
                    {new Date(listing.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="listing-price">{listing.price.toLocaleString()} KES</div>
                <div className={`listing-badge ${listing.status}`}>{listing.status}</div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .detailed-hub-view-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
          }

          .modal-title-row {
            display: flex;
            gap: 12px;
            align-items: center;
            flex: 1;
          }

          .modal-icon {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
          }

          .modal-header h2 {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 4px 0;
          }

          .modal-header p {
            font-size: 13px;
            color: #999;
            margin: 0;
          }

          .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-close:hover {
            color: #1a1a1a;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-body h3 {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 16px 0;
            color: #1a1a1a;
          }

          .listings-table {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .listing-row {
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }

          .listing-info {
            flex: 1;
            min-width: 0;
          }

          .listing-info h4 {
            font-size: 13px;
            font-weight: 600;
            margin: 0 0 4px 0;
            color: #1a1a1a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .listing-meta {
            font-size: 11px;
            color: #999;
            margin: 0;
          }

          .listing-price {
            font-size: 13px;
            font-weight: 700;
            color: #2196F3;
            white-space: nowrap;
          }

          .listing-badge {
            font-size: 11px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .listing-badge.active {
            background: #c8e6c9;
            color: #2e7d32;
          }

          .listing-badge.sold {
            background: #bbdefb;
            color: #1565c0;
          }

          .listing-badge.archived {
            background: #f5f5f5;
            color: #999;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CrossHubListingsView;
