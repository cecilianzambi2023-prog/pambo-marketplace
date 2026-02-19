/**
 * Seller Verification Badge Component
 * Displays trust indicators on seller profiles and listings
 *
 * Features:
 * - Subscription-based badges (Bronze, Silver, Gold, Platinum)
 * - Verification checkmark
 * - Trust score display
 * - Response time
 * - Star rating
 * - Tooltip with detailed info
 */

import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, Clock, Award, TrendingUp } from 'lucide-react';
import {
  getVerificationBadge,
  calculateTrustScore,
  getSellerKYCStatus
} from '../services/kycService';

interface SellerVerificationBadgeProps {
  seller_id: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  avgRating?: number;
  responseTime?: number;
}

interface BadgeData {
  verified: boolean;
  badge?: {
    emoji: string;
    name: string;
    color: string;
    tier: string;
  };
  trustScore: number;
  documentsCount: number;
}

export const SellerVerificationBadge: React.FC<SellerVerificationBadgeProps> = ({
  seller_id,
  size = 'md',
  showTooltip = true,
  avgRating = 0,
  responseTime = 0
}) => {
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [trustScore, setTrustScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltipContent, setShowTooltipContent] = useState(false);

  useEffect(() => {
    loadBadgeData();
  }, [seller_id]);

  const loadBadgeData = async () => {
    try {
      const [badge, score] = await Promise.all([
        getVerificationBadge(seller_id),
        calculateTrustScore(seller_id)
      ]);
      setBadgeData(badge);
      setTrustScore(score);
    } catch (error) {
      console.error('Failed to load badge data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;
  if (!badgeData?.verified) return null;

  const sizeClasses = {
    sm: 'text-sm gap-2',
    md: 'text-base gap-3',
    lg: 'text-lg gap-4'
  };

  const badgeEmojiSize = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="relative">
      {/* Badge Display */}
      <div
        className={`flex items-center ${sizeClasses[size]} cursor-pointer`}
        onMouseEnter={() => setShowTooltipContent(true)}
        onMouseLeave={() => setShowTooltipContent(false)}
      >
        {/* Verification Checkmark */}
        <div className="flex items-center gap-1">
          <ShieldCheck size={badgeEmojiSize[size]} className="text-green-600" fill="currentColor" />
          <span className="font-bold text-green-700">Verified by Pambo</span>
        </div>

        {/* Subscription Badge */}
        {badgeData.badge && (
          <div
            className="px-2 py-1 rounded-full text-white font-semibold flex items-center gap-1"
            style={{ backgroundColor: badgeData.badge.color }}
          >
            <span>{badgeData.badge.emoji}</span>
            <span>{badgeData.badge.name}</span>
          </div>
        )}

        {/* Trust Score */}
        {trustScore > 0 && (
          <div className="flex items-center gap-1 text-orange-600 font-semibold">
            <TrendingUp size={badgeEmojiSize[size]} />
            <span>{trustScore}%</span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 z-50">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
            <ShieldCheck size={24} className="text-green-600" />
            <div>
              <h3 className="font-bold text-gray-900">Verified Seller (Pambo)</h3>
              <p className="text-xs text-gray-600">{badgeData.badge?.name} Badge</p>
            </div>
          </div>

          {/* Trust Details */}
          <div className="space-y-3 text-sm">
            {/* Overall Score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-700">Trust Score</span>
                <span className="text-orange-600 font-bold">{trustScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2 text-green-700">
              <ShieldCheck size={16} />
              <span className="font-semibold">{badgeData.documentsCount} Document(s) Verified</span>
            </div>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}
                      fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
              </div>
            )}

            {/* Response Time */}
            {responseTime > 0 && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={16} />
                <span className="text-sm">
                  Avg response: <strong>{responseTime}h</strong>
                </span>
              </div>
            )}

            {/* Badge Levels */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Trust Levels:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥉</span>
                  <span className="text-gray-600">
                    <strong>Bronze:</strong> Basic verification
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥈</span>
                  <span className="text-gray-600">
                    <strong>Silver:</strong> Phone verified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥇</span>
                  <span className="text-gray-600">
                    <strong>Gold:</strong> Established seller
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💎</span>
                  <span className="text-gray-600">
                    <strong>Platinum:</strong> Premium seller
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple inline verification badge (compact)
 */
export const VerificationBadgeSimple: React.FC<{ seller_id: string }> = ({ seller_id }) => {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    loadVerification();
  }, [seller_id]);

  const loadVerification = async () => {
    const badge = await getVerificationBadge(seller_id);
    setVerified(badge.verified);
  };

  if (!verified) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
      <ShieldCheck size={14} />
      Verified by Pambo
    </span>
  );
};

/**
 * Trust Score Meter
 */
export const TrustScoreMeter: React.FC<{ seller_id: string; size?: 'sm' | 'md' | 'lg' }> = ({
  seller_id,
  size = 'md'
}) => {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScore();
  }, [seller_id]);

  const loadScore = async () => {
    const trustScore = await calculateTrustScore(seller_id);
    setScore(trustScore);
    setLoading(false);
  };

  if (loading || score === 0) return null;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700">Trust Score</span>
        <span className="text-xs font-bold text-gray-900">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`${getColor(score)} ${sizeClasses[size]} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default SellerVerificationBadge;
