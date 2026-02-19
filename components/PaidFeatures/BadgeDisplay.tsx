import React from 'react';
import { ShieldCheck, Star, Trophy, Zap, Crown, Leaf, Award, TrendingUp } from 'lucide-react';
import { SellerBadge } from '../../types';

interface BadgeDisplayProps {
  badge: SellerBadge;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
}

const BADGE_CONFIG = {
  verified: {
    name: 'Verified Seller',
    icon: ShieldCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'ID verified and trusted seller'
  },
  premium_member: {
    name: 'Premium Member',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    description: 'Premium membership tier'
  },
  trusted_seller: {
    name: 'Trusted Seller',
    icon: Trophy,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: '4.5+ rating, 50+ sales'
  },
  super_seller: {
    name: 'Super Seller',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    description: '4.8+ rating, 200+ sales'
  },
  exclusive_partner: {
    name: 'Exclusive Partner',
    icon: TrendingUp,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Exclusive partner tier'
  },
  speed_shipper: {
    name: 'Speed Shipper',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    description: '<2 hour response time'
  },
  eco_seller: {
    name: 'Eco-Seller',
    icon: Leaf,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    description: 'Sustainability certified'
  },
  best_value: {
    name: 'Best Value',
    icon: Award,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
    description: "Editor's choice"
  }
};

const SIZE_CONFIG = {
  sm: {
    icon: 16,
    text: 'text-xs',
    padding: 'px-2 py-1'
  },
  md: {
    icon: 20,
    text: 'text-sm',
    padding: 'px-3 py-1.5'
  },
  lg: {
    icon: 24,
    text: 'text-base',
    padding: 'px-4 py-2'
  }
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  size = 'md',
  showLabel = false,
  showTooltip = true
}) => {
  if (!badge.isActive) {
    return null;
  }

  const config = BADGE_CONFIG[badge.badgeType];
  if (!config) {
    return null;
  }

  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  const badgeContent = (
    <div
      className={`flex items-center gap-1 ${sizeConfig.padding} ${config.bgColor} border ${config.borderColor} rounded-full inline-flex`}
      title={showTooltip ? `${config.name}: ${config.description}` : undefined}
    >
      <Icon size={sizeConfig.icon} className={config.color} />
      {showLabel && (
        <span className={`${sizeConfig.text} font-medium ${config.color}`}>{config.name}</span>
      )}
    </div>
  );

  if (showTooltip && !showLabel) {
    return (
      <div className="group relative inline-block">
        {badgeContent}
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 z-10">
          {config.name}
          <br />
          <span className="text-gray-300 text-xs">{config.description}</span>
        </div>
      </div>
    );
  }

  return badgeContent;
};

export default BadgeDisplay;
