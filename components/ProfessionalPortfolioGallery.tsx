/**
 * ProfessionalPortfolioGallery.tsx
 * ==================================
 * 
 * Gallery component for professional's portfolio.
 * Displays up to 10 high-resolution images and videos.
 * 
 * FEATURES:
 * - Masonry grid layout (mobile-responsive)
 * - Lightbox modal for full view
 * - Video thumbnail display
 * - Optimized for high-res images
 * - Mobile-first design
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { PortfolioMedia } from '@/types/professionalProfileTypes';

interface ProfessionalPortfolioGalleryProps {
  media: PortfolioMedia[];
  professionalName: string;
}

export const ProfessionalPortfolioGallery: React.FC<ProfessionalPortfolioGalleryProps> = ({
  media,
  professionalName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const currentMedia = selectedIndex !== null ? media[selectedIndex] : null;

  return (
    <>
      {/* GALLERY GRID */}
      <div className="portfolio-gallery">
        {media.map((item, index) => (
          <div
            key={item.id}
            className="gallery-item"
            onClick={() => openLightbox(index)}
          >
            {item.media_type === 'image' ? (
              <>
                <img src={item.media_url} alt={item.title} loading="lazy" />
              </>
            ) : (
              <>
                <img
                  src={item.thumbnail_url || 'https://via.placeholder.com/300?text=Video'}
                  alt={item.title}
                  loading="lazy"
                />
                <div className="video-overlay">
                  <Play size={40} fill="white" />
                </div>
              </>
            )}
            <div className="gallery-item-title">{item.title}</div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && currentMedia && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            {/* CLOSE BUTTON */}
            <button className="lightbox-close" onClick={closeLightbox}>
              <X size={24} />
            </button>

            {/* MAIN CONTENT */}
            <div className="lightbox-content">
              {currentMedia.media_type === 'image' ? (
                <img src={currentMedia.media_url} alt={currentMedia.title} className="lightbox-image" />
              ) : (
                <div className="lightbox-video-container">
                  <video
                    src={currentMedia.media_url}
                    controls
                    autoPlay
                    className="lightbox-video"
                  />
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="lightbox-info">
              <h3>{currentMedia.title}</h3>
              {currentMedia.description && <p>{currentMedia.description}</p>}
            </div>

            {/* NAVIGATION */}
            {media.length > 1 && (
              <div className="lightbox-navigation">
                <button
                  className="nav-btn prev"
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="progress">
                  {selectedIndex! + 1} / {media.length}
                </div>

                <button
                  className="nav-btn next"
                  onClick={goToNext}
                  disabled={selectedIndex === media.length - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* THUMBNAILS */}
            {media.length > 1 && (
              <div className="lightbox-thumbnails">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    className={`thumbnail ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    {item.media_type === 'image' ? (
                      <img src={item.media_url} alt={`Thumb ${index}`} />
                    ) : (
                      <>
                        <img src={item.thumbnail_url} alt={`Thumb ${index}`} />
                        <Play size={16} className="play-icon" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        /* GALLERY GRID - MASONRY ON MOBILE */
        .portfolio-gallery {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 0 -16px -16px -16px;
          padding: 0;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          background: #f0f0f0;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s;
        }

        .gallery-item:active img {
          transform: scale(1.05);
        }

        .gallery-item-title {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          padding: 12px 8px;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.3;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        /* LIGHTBOX - FULLSCREEN MODAL */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .lightbox-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1001;
          transition: all 0.2s;
        }

        .lightbox-close:active {
          background: rgba(255, 255, 255, 0.4);
        }

        .lightbox-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 16px 16px 16px;
          overflow: hidden;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .lightbox-video-container {
          width: 100%;
          max-height: 100%;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .lightbox-video {
          width: 100%;
          height: 100%;
        }

        .lightbox-info {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 16px;
          backdrop-filter: blur(10px);
        }

        .lightbox-info h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .lightbox-info p {
          font-size: 13px;
          margin: 0;
          opacity: 0.9;
          line-height: 1.5;
        }

        .lightbox-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
        }

        .nav-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-btn:active:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .progress {
          font-size: 14px;
          font-weight: 600;
        }

        .lightbox-thumbnails {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          overflow-x: auto;
          scroll-behavior: smooth;
        }

        .lightbox-thumbnails::-webkit-scrollbar {
          height: 6px;
        }

        .lightbox-thumbnails::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border: 2px solid transparent;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.1);
          padding: 0;
          transition: all 0.2s;
          position: relative;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail.active {
          border-color: #667eea;
          box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
        }

        .play-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        }

        /* TABLET */
        @media (min-width: 768px) {
          .portfolio-gallery {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin: 0;
            padding: 0;
          }

          .gallery-item {
            aspect-ratio: 1;
          }

          .lightbox-content {
            padding: 80px 40px 16px 40px;
          }
        }

        /* DESKTOP */
        @media (min-width: 1024px) {
          .portfolio-gallery {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </>
  );
};

export default ProfessionalPortfolioGallery;
