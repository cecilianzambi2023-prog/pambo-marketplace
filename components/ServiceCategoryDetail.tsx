/**
 * ServiceCategoryDetail.tsx
 * =========================
 * 
 * Detail page for a single service category (/services/:slug).
 * Shows all service providers in the category.
 * 
 * FEATURES:
 * - Displays providers with phone & WhatsApp buttons (large touch targets)
 * - Verification badges (Bronze → Platinum)
 * - Ratings and reviews count
 * - County filtering support
 * - Direct contact (no in-app messaging, no escrow)
 * - Optimized for 3G and low-end Android phones
 */

import React, { useState, useEffect } from 'react';
import { getServicesByCategory, getCategoryStats } from '../services/servicesCategoryService';
import { Star, Phone, MessageCircle, ArrowLeft } from 'lucide-react';

interface ServiceListing {
  id: string;
  title: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  verification_badge?: string;
  rating?: number;
  reviews_count?: number;
  follower_count?: number;
  profiles?: {
    full_name: string;
  };
}

interface CategoryStats {
  total_providers: number;
  avg_rating: number;
  verified_count: number;
}

interface ServiceCategoryDetailProps {
  categorySlug: string;
  onBackClick?: () => void;
}

export const ServiceCategoryDetail: React.FC<ServiceCategoryDetailProps> = ({ categorySlug, onBackClick }) => {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | undefined>();

  // Placeholder images for service categories
  const placeholderImages = [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=870&auto=format&fit=crop', // Handyman
    'https://images.unsplash.com/photo-1596799321942-332d56a7f0e2?q=80&w=870&auto=format&fit=crop', // Painter
    'https://images.unsplash.com/photo-1598211053429-24753a0cec46?q=80&w=870&auto=format&fit=crop', // Cleaning
    'https://images.unsplash.com/photo-1508935495248-35436ee3aa82?q=80&w=870&auto=format&fit=crop', // Solar
    'https://images.unsplash.com/photo-1621607512214-6c3490343443?q=80&w=870&auto=format&fit=crop', // Barber
    'https://images.unsplash.com/photo-1550974868-9a6f3a3a40b2?q=80&w=870&auto=format&fit=crop', // Tailor
    'https://images.unsplash.com/photo-1545174787-a0651a025622?q=80&w=870&auto=format&fit=crop', // Laundry
    'https://images.unsplash.com/photo-1598214886343-7b4155f9f6b6?q=80&w=870&auto=format&fit=crop', // Water
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?q=80&w=870&auto=format&fit=crop', // Photographer
  ];

  const getImageUrl = (index: number) => {
    return placeholderImages[index % placeholderImages.length];
  };

  useEffect(() => {
    const loadServices = async () => {
      if (!categorySlug) return;

      try {
        setLoading(true);
        const response = await getServicesByCategory(categorySlug.toLowerCase(), {
          county_id: selectedCounty,
          per_page: 50,
        });
        setListings(response.listings);

        const categoryStats = await getCategoryStats(categorySlug.toLowerCase());
        setStats(categoryStats);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [categorySlug, selectedCounty]);

  if (loading) {
    return (
      <div className="services-loading">
        <div className="loading-spinner">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="service-detail">
      {/* BACK BUTTON & HEADER */}
      <div className="detail-header">
        <button 
          onClick={() => {
            if (onBackClick) {
              onBackClick();
            }
          }} 
          className="back-btn flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>{categorySlug?.replace('-', ' ').toUpperCase()}</h1>
        {stats && <p className="stats-line">{stats.total_providers} providers available</p>}
      </div>

      {/* COUNTY FILTER DROPDOWN */}
      <div className="county-filter-container mb-6 px-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by City/County:</label>
        <select 
          value={selectedCounty || ''}
          onChange={(e) => setSelectedCounty(e.target.value || undefined)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Cities</option>
          <option value="nairobi">Nairobi</option>
          <option value="mombasa">Mombasa</option>
          <option value="kisumu">Kisumu</option>
          <option value="nakuru">Nakuru</option>
          <option value="eldoret">Eldoret</option>
          <option value="kericho">Kericho</option>
          <option value="kisii">Kisii</option>
          <option value="nyeri">Nyeri</option>
          <option value="muranga">Murang'a</option>
          <option value="kiambu">Kiambu</option>
          <option value="machakos">Machakos</option>
          <option value="makueni">Makueni</option>
          <option value="kajiado">Kajiado</option>
          <option value="isiolo">Isiolo</option>
          <option value="samburu">Samburu</option>
          <option value="turkana">Turkana</option>
          <option value="kitale">Kitale</option>
          <option value="bungoma">Bungoma</option>
          <option value="busia">Busia</option>
          <option value="siaya">Siaya</option>
          <option value="homa-bay">Homa Bay</option>
          <option value="migori">Migori</option>
          <option value="bomet">Bomet</option>
          <option value="narok">Narok</option>
          <option value="kilifi">Kilifi</option>
          <option value="lamu">Lamu</option>
          <option value="tana-river">Tana River</option>
        </select>
      </div>
      <div className="listings-container">
        {listings.length === 0 ? (
          <div className="no-listings">
            <p>No services found in your area</p>
          </div>
        ) : (
          listings.map((listing, index) => (
            <div key={listing.id} className="service-listing-card">
              {/* SERVICE IMAGE */}
              <div className="service-image-container">
                <img 
                  src={getImageUrl(index)} 
                  alt={listing.title}
                  className="service-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(listing.title);
                  }}
                />
              </div>
              
              {/* HEADER: NAME + BADGE + RATING */}
              <div className="listing-header">
                <div className="header-left">
                  <h3>{listing.title}</h3>
                  {listing.verification_badge && (
                    <span className={`badge ${listing.verification_badge.toLowerCase()}`}>
                      ✓ {listing.verification_badge.toUpperCase()}
                    </span>
                  )}
                </div>
                {listing.rating && (
                  <div className="rating-box">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(listing.rating || 0) ? 'star filled' : 'star'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="rating-value">{listing.rating.toFixed(1)}</div>
                  </div>
                )}
              </div>

              {/* STATS: REVIEWS + FOLLOWERS */}
              <div className="listing-stats">
                {listing.reviews_count !== undefined && (
                  <div className="stat-item">
                    <span className="stat-value">{listing.reviews_count}</span>
                    <span className="stat-label">Review{listing.reviews_count !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {listing.follower_count !== undefined && (
                  <div className="stat-item">
                    <span className="stat-value">{listing.follower_count}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              {listing.description && (
                <p className="listing-description">{listing.description}</p>
              )}

              {/* SELLER INFO */}
              {listing.profiles && (
                <div className="seller-info">
                  <span className="seller-name">👤 {listing.profiles.full_name}</span>
                </div>
              )}

              {/* CONTACT BUTTONS (LARGE, MOBILE-FRIENDLY) */}
              <div className="contact-actions">
                {listing.phone && (
                  <a href={`tel:${listing.phone}`} className="action-btn call-btn">
                    <Phone size={18} />
                    <span>Call Now</span>
                  </a>
                )}
                {listing.whatsapp && (
                  <a
                    href={`https://wa.me/${listing.whatsapp}?text=Hi, I'm interested in your ${categorySlug?.replace('-', ' ')} service`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn whatsapp-btn"
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .service-detail {
          background: #fafafa;
          min-height: 100vh;
          padding-bottom: 20px;
        }

        .detail-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
        }

        .detail-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .stats-line {
          font-size: 13px;
          margin: 0;
          opacity: 0.9;
        }

        .listings-container {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .service-listing-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }

        .service-listing-card:active {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .service-image-container {
          width: 100%;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
          background: #f0f0f0;
        }

        .service-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }

        .header-left {
          flex: 1;
        }

        .listing-header h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1a1a1a;
        }

        .rating-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: #fff8f0;
          border-radius: 8px;
          min-width: 60px;
        }

        .rating-stars {
          display: flex;
          gap: 2px;
          font-size: 16px;
        }

        .star {
          color: #ddd;
        }

        .star.filled {
          color: #ffc107;
        }

        .rating-value {
          font-size: 12px;
          font-weight: 700;
          color: #ffc107;
        }

        .listing-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .stat-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }

        .badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .badge.platinum {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
        }

        .badge.gold {
          background: #ffd700;
          color: #333;
        }

        .badge.silver {
          background: #c0c0c0;
          color: #333;
        }

        .badge.bronze {
          background: #cd7f32;
          color: white;
        }

        .listing-description {
          font-size: 13px;
          color: #666;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }

        .seller-info {
          font-size: 12px;
          color: #999;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .seller-name {
          font-weight: 500;
        }

        /* CONTACT BUTTONS - LARGE FOR MOBILE */
        .contact-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 48px; /* Minimum touch target */
        }

        .call-btn {
          background: #10b981;
          color: white;
        }

        .call-btn:active {
          background: #059669;
          transform: scale(0.98);
        }

        .whatsapp-btn {
          background: #25d366;
          color: white;
        }

        .whatsapp-btn:active {
          background: #20ba5a;
          transform: scale(0.98);
        }

        .no-listings {
          text-align: center;
          padding: 60px 24px;
          color: #999;
        }

        .services-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .loading-spinner {
          text-align: center;
          color: #999;
        }

        /* TABLET & DESKTOP */
        @media (min-width: 768px) {
          .listings-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }

          .action-btn {
            padding: 16px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceCategoryDetail;
