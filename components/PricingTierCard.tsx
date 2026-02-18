import React from 'react';
import { Check, Star, Zap, MessageCircle } from 'lucide-react';
import { SUBSCRIPTION_TIERS, getTierPrice, getTierHubs } from '../services/mpesaService';
import { SubscribeButton } from './SubscribeButton';

interface PricingTierCardProps {
  tier: string;
  userId: string;
  isPopular?: boolean;
}

export const PricingTierCard: React.FC<PricingTierCardProps> = ({ tier, userId, isPopular = false }) => {
  const tierInfo = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  const price = getTierPrice(tier);
  const hubs = getTierHubs(tier);

  if (!tierInfo) return null;

  const features = [
    { label: 'Access to hub(s)', value: hubs.join(', ') || 'None' },
    { label: 'Billing period', value: tierInfo.billing_period },
    { label: 'Tier level', value: tierInfo.name },
    { label: 'Support', value: tier === 'enterprise' ? 'Priority' : 'Standard' },
    { label: 'Direct connect', value: 'Yes' },
    { label: 'Commission', value: '0%' },
  ];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isPopular
          ? 'bg-gradient-to-br from-orange-600 to-amber-600 text-white shadow-2xl scale-105'
          : 'bg-white border border-gray-200 hover:shadow-lg'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Star size={12} fill="currentColor" />
          POPULAR
        </div>
      )}

      {/* Header */}
      <div className={`p-6 ${isPopular ? 'bg-orange-700' : 'bg-gray-50'}`}>
        <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-800'}`}>
          {tierInfo.name}
        </h3>
        <p className={`text-sm ${isPopular ? 'text-orange-100' : 'text-gray-600'}`}>
          {tierInfo.description}
        </p>
      </div>

      {/* Price */}
      <div className={`px-6 pt-6 ${isPopular ? 'text-white' : 'text-gray-800'}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">KES {price}</span>
          <span className={`text-sm ${isPopular ? 'text-orange-100' : 'text-gray-500'}`}>
            /{tierInfo.billing_period.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className={`px-6 py-6 space-y-3 ${isPopular ? 'text-orange-50' : 'text-gray-600'}`}>
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Check className={`${isPopular ? 'text-orange-200' : 'text-orange-500'} shrink-0 mt-1`} size={18} />
            <div>
              <div className={`text-sm font-medium ${isPopular ? 'text-orange-100' : 'text-gray-700'}`}>
                {feature.label}
              </div>
              <div className={`text-xs ${isPopular ? 'text-orange-200' : 'text-gray-500'}`}>
                {feature.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe Button & WhatsApp Backup */}
      <div className="px-6 pb-6 space-y-3">
        {/* M-Pesa Payment Button */}
        <SubscribeButton
          tier={tier}
          userId={userId}
          variant={isPopular ? 'primary' : 'outline'}
          fullWidth
          size="lg"
          onSuccess={() => {
            console.log(`Subscribed to ${tier}`);
          }}
        />

        {/* WhatsApp Direct Connect Button */}
        <a
          href={`https://wa.me/254745442796?text=Hi%20I%20want%20to%20subscribe%20to%20the%20${tierInfo.name}%20plan%20(KES%20${price})`}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
            isPopular
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
              : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
          }`}
        >
          <MessageCircle size={18} />
          Direct Connect via WhatsApp
        </a>
      </div>
    </div>
  );
};

interface PricingGridProps {
  userId: string;
}

export const PricingGrid: React.FC<PricingGridProps> = ({ userId }) => {
  const tiers = ['mkulima', 'starter', 'pro', 'enterprise'];
  const popularTier = 'pro'; // Pro tier is the most popular

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
      {tiers.map((tier) => (
        <PricingTierCard
          key={tier}
          tier={tier}
          userId={userId}
          isPopular={tier === popularTier}
        />
      ))}
    </div>
  );
};
