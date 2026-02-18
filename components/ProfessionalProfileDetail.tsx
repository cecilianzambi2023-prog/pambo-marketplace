/**
 * ProfessionalProfileDetail.tsx
 * ==============================
 * 
 * Professional detail page with dynamic routing.
 * URL: /professionals/:id
 * 
 * Shows:
 * - Professional info (name, bio, rating, followers)
 * - Verified Pro badge (if subscription active)
 * - Sub-categories they offer
 * - Portfolio gallery (10+ images/videos)
 * - Follow button (real-time)
 * - Quick action buttons (Call + WhatsApp)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfessionalProfile, followProfessional, unfollowProfessional } from '@/services/professionalProfileService';
import { ProfessionalDetailView } from '@/types/professionalProfileTypes';
import { Star, Phone, MessageCircle, Heart, ArrowLeft } from 'lucide-react';
import ProfessionalPortfolioGallery from './ProfessionalPortfolioGallery';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

export const ProfessionalProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [professional, setProfessional] = useState<ProfessionalDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  useEffect(() => {
    const loadProfessional = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const prof = await getProfessionalProfile(id, user?.id);
        setProfessional(prof);
        setIsFollowing(prof.follow_stats?.is_following || false);
        setFollowerCount(prof.follow_stats?.total_followers || 0);
      } catch (err) {
        console.error('Failed to load professional:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfessional();
  }, [id, user?.id]);

  const handleFollowToggle = async () => {
    if (!user || !id) {
      alert('Please log in to follow professionals');
      return;
    }

    setIsFollowingLoading(true);

    try {
      if (isFollowing) {
        const result = await unfollowProfessional(user.id, id);
        if (result.success) {
          setIsFollowing(false);
          setFollowerCount(result.new_follower_count);
        }
      } else {
        const result = await followProfessional(user.id, id);
        if (result.success) {
          setIsFollowing(true);
          setFollowerCount(result.new_follower_count);
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Failed to update follow status');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="professional-loading">
        <div className="loading-spinner">Loading professional...</div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="professional-not-found">
        <p>Professional not found</p>
        <button onClick={() => navigate('/services')}>← Back to Services</button>
      </div>
    );
  }

  return (
    <div className="professional-detail">
      {/* HEADER */}
      <div className="professional-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* PROFESSIONAL INFO CARD */}
      <div className="professional-info-card">
        {/* AVATAR + NAME + VERIFIED BADGE */}
        <div className="pro-header-section">
          {professional.avatar_url && (
            <img src={professional.avatar_url} alt={professional.full_name} className="pro-avatar" />
          )}
          <div className="pro-name-section">
            <h1>{professional.full_name}</h1>
            {professional.is_verified && (
              <span className={`verified-badge ${professional.verification_badge}`}>
                ✓ VERIFIED PRO
              </span>
            )}
          </div>
        </div>

        {/* RATING + STATS */}
        <div className="pro-rating-stats">
          {professional.rating && (
            <div className="rating-item">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(professional.rating || 0) ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              <div className="rating-value">{professional.rating.toFixed(1)}</div>
              {professional.reviews_count && (
                <div className="review-count">({professional.reviews_count} reviews)</div>
              )}
            </div>
          )}

          <div className="follower-item">
            <div className="follower-count">{followerCount}</div>
            <div className="follower-label">Followers</div>
          </div>
        </div>

        {/* BIO */}
        {professional.bio && (
          <p className="pro-bio">{professional.bio}</p>
        )}

        {/* ACTION BUTTONS ROW */}
        <div className="pro-actions">
          {/* FOLLOW BUTTON */}
          <button
            onClick={handleFollowToggle}
            disabled={isFollowingLoading}
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
          >
            <Heart size={18} fill={isFollowing ? 'currentColor' : 'none'} />
            <span>{isFollowing ? 'Following' : 'Follow'}</span>
          </button>

          {/* SHARE BUTTON */}
          <button className="share-btn" onClick={() => {
            const url = `${window.location.origin}/professionals/${professional.id}`;
            navigator.share && navigator.share({ title: professional.full_name, url });
          }}>
            <span>Share</span>
          </button>
        </div>

        {/* CONTACT BUTTONS */}
        <div className="contact-buttons">
          {professional?.phone && (
            <a href={`tel:${professional.phone}`} className="action-btn call-btn">
              <Phone size={18} />
              <span>Call Now</span>
            </a>
          )}
          {professional?.whatsapp && (
            <a
              href={`https://wa.me/${professional.whatsapp}?text=Hi ${professional.full_name}, I'm interested in your services`}
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

      {/* SUB-CATEGORIES SECTION */}
      {professional.subcategories && professional.subcategories.length > 0 && (
        <div className="subcategories-section">
          <h2>Services Offered</h2>
          <div className="subcategories-grid">
            {professional.subcategories.map((subcat) => (
              <div key={subcat.id} className="subcat-card">
                <h3>{subcat.subcategory_name}</h3>
                {subcat.description && <p>{subcat.description}</p>}
                {subcat.price_estimate && (
                  <div className="price">From KES {subcat.price_estimate.toLocaleString()}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PORTFOLIO GALLERY */}
      {professional.portfolio && professional.portfolio.media_items.length > 0 && (
        <div className="portfolio-section">
          <h2>Portfolio ({professional.portfolio.total_items}/10)</h2>
          <ProfessionalPortfolioGallery
            media={professional.portfolio.media_items}
            professionalName={professional.full_name}
          />
        </div>
      )}

      {/* CONTACT INFO CARD */}
      <div className="contact-info-card">
        <h3>Contact & Location</h3>
        {professional.county_id && (
          <p>📍 Operating in {professional.county_id}</p>
        )}
        {professional.email && (
          <p>📧 {professional.email}</p>
        )}
        {professional.phone && (
          <p>📱 {professional.phone}</p>
        )}
        {professional.whatsapp && (
          <p>💬 WhatsApp: {professional.whatsapp}</p>
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .professional-detail {
          background: #fafafa;
          min-height: 100vh;
          padding-bottom: 20px;
        }

        .professional-header {
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
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .professional-info-card {
          background: white;
          margin: 12px;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .pro-header-section {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .pro-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #667eea;
        }

        .pro-name-section h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #1a1a1a;
        }

        .verified-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .verified-badge.platinum {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
        }

        .verified-badge.gold {
          background: #ffd700;
          color: #333;
        }

        .verified-badge.silver {
          background: #c0c0c0;
          color: #333;
        }

        .verified-badge.bronze {
          background: #cd7f32;
          color: white;
        }

        .pro-rating-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .rating-item {
          flex: 1;
        }

        .rating-stars {
          display: flex;
          gap: 2px;
          font-size: 18px;
          margin-bottom: 4px;
        }

        .star {
          color: #ddd;
        }

        .star.filled {
          color: #ffc107;
        }

        .rating-value {
          font-size: 16px;
          font-weight: 700;
          color: #667eea;
        }

        .review-count {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }

        .follower-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .follower-count {
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
        }

        .follower-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }

        .pro-bio {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .pro-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .follow-btn,
        .share-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .follow-btn.following {
          background: #667eea;
          color: white;
        }

        .follow-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .contact-buttons {
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
          min-height: 48px;
        }

        .call-btn {
          background: #10b981;
          color: white;
        }

        .whatsapp-btn {
          background: #25d366;
          color: white;
        }

        .subcategories-section {
          margin: 20px 12px;
          background: white;
          padding: 16px;
          border-radius: 12px;
        }

        .subcategories-section h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #1a1a1a;
        }

        .subcategories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        .subcat-card {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .subcat-card:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .subcat-card h3 {
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1a1a1a;
        }

        .subcat-card p {
          font-size: 11px;
          color: #999;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .price {
          font-size: 12px;
          font-weight: 600;
          color: #667eea;
        }

        .portfolio-section {
          margin: 20px 12px;
          background: white;
          padding: 16px;
          border-radius: 12px;
        }

        .portfolio-section h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #1a1a1a;
        }

        .contact-info-card {
          margin: 20px 12px;
          background: white;
          padding: 16px;
          border-radius: 12px;
        }

        .contact-info-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #1a1a1a;
        }

        .contact-info-card p {
          font-size: 14px;
          color: #666;
          margin: 0 0 8px 0;
        }

        .professional-loading,
        .professional-not-found {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #fafafa;
        }

        .loading-spinner {
          text-align: center;
          color: #999;
        }

        @media (min-width: 768px) {
          .professional-info-card {
            max-width: 600px;
            margin: 20px auto;
          }

          .subcategories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalProfileDetail;
