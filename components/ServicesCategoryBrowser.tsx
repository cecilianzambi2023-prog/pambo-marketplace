/**
 * ServicesCategoryBrowser.tsx
 * ============================
 * 
 * Data-driven services category browser.
 * 
 * ARCHITECTURE:
 * - Loads 40+ categories from database (not hardcoded)
 * - Mobile-first design for low-end Android phones
 * - Optimized for 3G connections (efficient images, lazy loading)
 * - URL routing: /services/:category-slug
 * - Large buttons for touch on small screens
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceCategoriesCached, getServicesByCategory, getCategoryStats } from '../services/servicesCategoryService';
import { ServiceCategory } from '../types/servicesCategoryTypes';
import { Search, MapPin, Star, Phone, MessageCircle } from 'lucide-react';

// ========================================================
// CATEGORY GRID VIEW (Homepage)
// ========================================================

export const ServicesCategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Uses caching to reduce API calls on 3G
        const cats = await getServiceCategoriesCached();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter categories by search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="services-loading">
        <div className="loading-spinner">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="services-browser">
      {/* HEADER */}
      <div className="services-header">
        <h1>🛠️ Professional Services</h1>
        <p>Find trusted providers in your area</p>
      </div>

      {/* SEARCH */}
      <div className="search-wrapper">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* CATEGORIES GRID (MOBILE-FIRST) */}
      <div className="categories-grid">
        {filteredCategories.map(category => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => navigate(`/services/${category.slug}`)}
          >
            {/* ICON */}
            <div className="category-icon">{category.icon || '🔧'}</div>

            {/* NAME */}
            <h3>{category.name}</h3>

            {/* DESCRIPTION */}
            {category.description && <p className="category-desc">{category.description}</p>}

            {/* CTA BUTTON */}
            <button className="view-btn">View Providers →</button>
          </div>
        ))}
      </div>

      {/* NO RESULTS */}
      {filteredCategories.length === 0 && (
        <div className="no-results">
          <p>No services found matching "{searchQuery}"</p>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .services-browser {
          background: #fafafa;
          min-height: 100vh;
          padding: 0;
        }

        .services-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }

        .services-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .services-header p {
          font-size: 14px;
          margin: 0;
          opacity: 0.9;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .search-wrapper svg {
          color: #999;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px; /* Prevents zoom on iOS */
          padding: 12px;
        }

        .search-input::placeholder {
          color: #ccc;
        }

        /* MOBILE GRID: 2 columns */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 12px;
        }

        .category-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .category-card:active {
          border-color: #667eea;
          background: #f9f9f9;
        }

        .category-icon {
          font-size: 40px;
          margin-bottom: 8px;
        }

        .category-card h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .category-desc {
          font-size: 11px;
          color: #999;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .view-btn {
          width: 100%;
          padding: 10px 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:active {
          background: #5568d3;
          transform: scale(0.95);
        }

        .no-results {
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

        /* TABLET: 3 columns */
        @media (min-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            padding: 20px;
          }

          .category-card h3 {
            font-size: 16px;
          }
        }

        /* DESKTOP: 4 columns */
        @media (min-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

// ========================================================
// CATEGORY DETAIL VIEW (/services/:category-slug)
// ========================================================

export const ServiceCategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadServices = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const response = await getServicesByCategory(slug, {
          county_id: selectedCounty,
          per_page: 50,
        });
        setListings(response.listings);

        const categoryStats = await getCategoryStats(slug);
        setStats(categoryStats);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [slug, selectedCounty]);

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
        <button onClick={() => navigate('/services')} className="back-btn">
          ← Back
        </button>
        <h1>{slug?.replace('-', ' ').toUpperCase()}</h1>
        {stats && <p className="stats-line">{stats.total_providers} providers available</p>}
      </div>

      {/* SERVICE LISTING CARDS */}
      <div className="listings-container">
        {listings.length === 0 ? (
          <div className="no-listings">
            <p>No services found in your area</p>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.id} className="service-listing-card">
              {/* HEADER */}
              <div className="listing-header">
                <div>
                  <h3>{listing.title}</h3>
                  {listing.verification_badge && (
                    <span className={`badge ${listing.verification_badge}`}>
                      {listing.verification_badge.toUpperCase()}
                    </span>
                  )}
                </div>
                {listing.rating && (
                  <div className="rating">
                    <Star size={14} fill="currentColor" />
                    {listing.rating.toFixed(1)}
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
                  <span className="seller-name">by {listing.profiles.full_name}</span>
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
                    href={`https://wa.me/${listing.whatsapp}?text=Hi, I'm interested in your ${slug?.replace('-', ' ')} service`}
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

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .listing-header h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1a1a1a;
        }

        .badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
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

        .rating {
          display: flex;
          gap: 4px;
          align-items: center;
          color: #ffc107;
          font-size: 13px;
          font-weight: 600;
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

export default ServicesCategoryGrid;
