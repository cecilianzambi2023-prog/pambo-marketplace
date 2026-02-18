/**
 * Empty State Component
 * Professional, branded messaging when no data is available
 */

import React from 'react';
import { COLORS, EMPTY_STATES, CTA_COPY, OFFSPRING_BRAND } from '../config/brand';

interface EmptyStateProps {
  type: keyof typeof EMPTY_STATES;
  actionLabel?: string;
  onAction?: () => void;
  customTitle?: string;
  customDescription?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  actionLabel,
  onAction,
  customTitle,
  customDescription,
}) => {
  const state = EMPTY_STATES[type];
  const title = customTitle || state.title;
  const description = customDescription || state.description;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary[50]} 0%, ${COLORS.gray[50]} 100%)`,
      }}
    >
      {/* Icon/Emoji */}
      <div className="text-6xl mb-6" title={state.emoji}>
        {state.emoji}
      </div>

      {/* Title */}
      <h3
        className="text-2xl font-bold mb-2"
        style={{ color: COLORS.gray[900] }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-lg max-w-md mb-8"
        style={{ color: COLORS.gray[600] }}
      >
        {description}
      </p>

      {/* Action Button */}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary[500]} 0%, ${COLORS.secondary[500]} 100%)`,
            color: 'white',
          }}
        >
          {actionLabel}
        </button>
      )}

      {/* Offspring Decor Branding */}
      <div className="mt-12 pt-4 border-t" style={{ borderColor: COLORS.gray[200] }}>
        <p className="text-sm" style={{ color: COLORS.gray[500] }}>
          Powered by <strong style={{ color: COLORS.gray[900] }}>{OFFSPRING_BRAND.name}</strong>
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
