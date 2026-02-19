/**
 * Listings Grid Component
 * Reusable, data-driven component for displaying listings from any hub
 * Handles loading, error, and empty states with professional branding
 */

import React, { memo, useMemo } from 'react';
import { Star, MapPin, Zap } from 'lucide-react';
import { DatabaseListing } from '../types/database';
import { COLORS, EMPTY_STATES, CTA_COPY } from '../config/brand';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { SmartImage } from './SmartImage';

interface ListingsGridProps {
  listings: DatabaseListing[];
  loading: boolean;
  error: string | null;
  onListingClick?: (listing: DatabaseListing) => void;
  onRefetch?: () => void;
  variant?: 'grid' | 'list' | 'carousel';
  itemsPerPage?: number;
  emptyStateType?: keyof typeof EMPTY_STATES;
}

interface ListingCardProps {
  listing: DatabaseListing;
  onClick?: () => void;
}

/**
 * Listing Card Component
 */
const ListingCard: React.FC<ListingCardProps> = memo(({ listing, onClick }) => {
  const imageUrl =
    listing.images?.[0] ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop';

  // Fallback to generic products image if none provided
  const displayImage = imageUrl.startsWith('http')
    ? imageUrl
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop';

  return (
    <div
      className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
      onClick={onClick}
      style={{
        background: 'white',
        border: `1px solid ${COLORS.gray[200]}`
      }}
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <SmartImage src={displayImage} alt={listing.title} className="w-full h-full object-cover" />

        {/* Badge - Hub Type */}
        <div
          className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: COLORS.primary[500] }}
        >
          {listing.hub.charAt(0).toUpperCase() + listing.hub.slice(1)}
        </div>

        {/* Rating Badge */}
        {listing.rating > 0 && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: COLORS.success }}
          >
            <Star size={12} /> {listing.rating.toFixed(1)}
          </div>
        )}

        {/* Live Indicator */}
        {listing.isLiveNow && (
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: COLORS.danger }}
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ color: COLORS.gray[900] }}>
          {listing.title}
        </h3>

        {/* Location */}
        {listing.location && (
          <div className="flex items-center gap-1 text-xs mb-3" style={{ color: COLORS.gray[600] }}>
            <MapPin size={14} />
            {listing.location}
          </div>
        )}

        {/* Category */}
        <div
          className="text-xs mb-3 px-2 py-1 rounded-full inline-block"
          style={{ background: COLORS.primary[50], color: COLORS.primary[600] }}
        >
          {listing.category}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold" style={{ color: COLORS.primary[600] }}>
            {listing.currency} {listing.price.toLocaleString()}
          </span>
          {listing.moq && (
            <span className="text-xs" style={{ color: COLORS.gray[500] }}>
              MOQ: {listing.moq}
            </span>
          )}
        </div>

        {/* Service Type Indicator */}
        {listing.serviceType && (
          <div
            className="flex items-center gap-1 text-xs mb-3"
            style={{ color: COLORS.secondary[600] }}
          >
            <Zap size={14} />
            {listing.serviceType}
          </div>
        )}

        {/* CTA Button */}
        <button
          className="w-full py-2 rounded-lg font-semibold text-white transition-all hover:shadow-md"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary[500]} 0%, ${COLORS.secondary[500]} 100%)`
          }}
          onClick={onClick}
        >
          {CTA_COPY.viewDetails}
        </button>
      </div>
    </div>
  );
});

/**
 * Main Listings Grid Component
 */
export const ListingsGrid: React.FC<ListingsGridProps> = ({
  listings,
  loading,
  error,
  onListingClick,
  onRefetch,
  variant = 'grid',
  emptyStateType = 'listings'
}) => {
  const isEmpty = !loading && (!listings || listings.length === 0);
  const hasError = !loading && error;
  const renderedGrid = useMemo(
    () =>
      listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} onClick={() => onListingClick?.(listing)} />
      )),
    [listings, onListingClick]
  );

  const renderedList = useMemo(
    () =>
      listings.map((listing) => (
        <div
          key={listing.id}
          className="flex gap-4 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md"
          style={{
            background: 'white',
            border: `1px solid ${COLORS.gray[200]}`
          }}
          onClick={() => onListingClick?.(listing)}
        >
          <SmartImage
            src={
              listing.images?.[0] ||
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100&auto=format&fit=crop'
            }
            alt={listing.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1" style={{ color: COLORS.gray[900] }}>
              {listing.title}
            </h3>
            <p className="text-sm mb-2" style={{ color: COLORS.gray[600] }}>
              {listing.category} • {listing.hub}
            </p>
            <p className="text-lg font-bold" style={{ color: COLORS.primary[600] }}>
              {listing.currency} {listing.price.toLocaleString()}
            </p>
          </div>

          {listing.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={16} style={{ color: COLORS.warning }} />
              <span className="font-semibold">{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )),
    [listings, onListingClick]
  );

  return (
    <div>
      {/* Error State */}
      {hasError && (
        <div
          className="p-4 rounded-lg flex items-center justify-between"
          style={{ background: COLORS.gray[100], borderLeft: `4px solid ${COLORS.danger}` }}
        >
          <div>
            <p style={{ color: COLORS.danger }} className="font-semibold">
              Failed to Load Listings
            </p>
            <p style={{ color: COLORS.gray[600] }} className="text-sm">
              {error}
            </p>
          </div>
          {onRefetch && (
            <button
              onClick={onRefetch}
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-md"
              style={{ background: COLORS.primary[500] }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingState variant={variant} count={variant === 'list' ? 5 : 6} />}

      {/* Empty State */}
      {isEmpty && <EmptyState type={emptyStateType} actionLabel={CTA_COPY.browseNow} />}

      {/* Listings Grid */}
      {!loading && !hasError && !isEmpty && (
        <>
          {variant === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {renderedGrid}
            </div>
          )}

          {variant === 'list' && <div className="space-y-2 p-4">{renderedList}</div>}
        </>
      )}
    </div>
  );
};

export default ListingsGrid;
