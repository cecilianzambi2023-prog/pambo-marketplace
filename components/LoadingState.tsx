/**
 * Loading State Component
 * Professional skeleton/loading UI while data is being fetched
 */

import React from 'react';
import { COLORS, LOADING_COPY } from '../config/brand';

interface LoadingStateProps {
  message?: string;
  count?: number; // Number of skeleton items to show
  variant?: 'cards' | 'list' | 'grid';
}

const SkeletonCard: React.FC = () => (
  <div
    className="p-4 rounded-lg animate-pulse"
    style={{ background: COLORS.gray[100] }}
  >
    <div
      className="h-48 rounded-md mb-4"
      style={{ background: COLORS.gray[200] }}
    />
    <div
      className="h-4 rounded mb-2"
      style={{ background: COLORS.gray[200], width: '70%' }}
    />
    <div
      className="h-4 rounded"
      style={{ background: COLORS.gray[200], width: '40%' }}
    />
  </div>
);

const SkeletonListItem: React.FC = () => (
  <div className="flex gap-4 py-4 px-4 border-b" style={{ borderColor: COLORS.gray[200] }}>
    <div
      className="w-20 h-20 rounded-lg flex-shrink-0 animate-pulse"
      style={{ background: COLORS.gray[200] }}
    />
    <div className="flex-1">
      <div
        className="h-4 rounded mb-2 animate-pulse"
        style={{ background: COLORS.gray[200], width: '60%' }}
      />
      <div
        className="h-3 rounded animate-pulse"
        style={{ background: COLORS.gray[200], width: '40%' }}
      />
    </div>
  </div>
);

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = LOADING_COPY.loading,
  count = 6,
  variant = 'grid',
}) => {
  const items = Array.from({ length: count });

  return (
    <div className="w-full">
      {/* Loading Message */}
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full animate-spin"
            style={{
              borderTop: `2px solid ${COLORS.primary[500]}`,
              borderRight: `2px solid ${COLORS.gray[200]}`,
              borderBottom: `2px solid ${COLORS.gray[200]}`,
              borderLeft: `2px solid ${COLORS.gray[200]}`,
            }}
          />
          <p style={{ color: COLORS.gray[600] }}>{message}</p>
        </div>
      </div>

      {/* Skeleton Items */}
      {variant === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {items.map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {variant === 'cards' && (
        <div className="grid gap-4 p-4">
          {items.map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {variant === 'list' && (
        <div>
          {items.map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingState;
