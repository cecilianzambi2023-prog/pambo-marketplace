import React, { useState } from 'react';
import { Check, Leaf, Zap, TrendingUp, Crown, AlertCircle } from 'lucide-react';

interface PricingTableProps {
  onSelectPlan: (tier: 'mkulima' | 'starter' | 'pro' | 'enterprise', amount: number) => void;
  currentPlan?: string;
  isLoading?: boolean;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  onSelectPlan,
  currentPlan,
  isLoading = false
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const plans = [
    {
      id: 'mkulima',
      name: 'Mkulima Mdogo',
      icon: Leaf,
      badge: '🎁 SPECIAL OFFER',
      price: 1500,
      period: '1 YEAR',
      periodLabel: 'One-time payment',
      description: 'Perfect for small-scale farmers. Connect your farm directly to market.',
      tagline: '✅ Safe & Supported',
      features: [
        'Unlimited farm product listings',
        '10 high-quality images per listing',
        '5 featured product slots',
        'Market prices & trends',
        'Direct buyer connections',
        'Dedicated farmer support',
        'Annual subscription (365 days)',
        '100% of your sales'
      ],
      isSpecial: true,
      color: 'green',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50'
    },
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      badge: 'ENTRY-LEVEL',
      price: 3500,
      period: 'MONTHLY',
      periodLabel: 'Billed monthly',
      description: 'Perfect for getting started with your online business.',
      tagline: 'Best for beginners',
      features: [
        '20 active product listings',
        '5 images per listing',
        '2 featured product slots',
        'Basic seller analytics',
        'Email support',
        'Monthly renewal',
        'Access to all 6 marketplace hubs',
        '100% of your sales'
      ],
      isSpecial: false,
      color: 'blue',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: TrendingUp,
      badge: 'POPULAR',
      price: 5000,
      period: 'MONTHLY',
      periodLabel: 'Billed monthly',
      description: 'Perfect for growing businesses and serious sellers.',
      tagline: 'Best for growth',
      features: [
        '50 active product listings',
        '10 images per listing',
        '5 featured product slots',
        'Advanced seller analytics',
        'Priority support (24-48hrs)',
        'Custom storefront branding',
        'Bulk upload tools',
        '100% of your sales'
      ],
      isSpecial: false,
      color: 'purple',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      badge: 'FOR LARGE SELLERS',
      price: 9000,
      period: 'MONTHLY',
      periodLabel: 'Billed monthly',
      description: 'For large-scale operations and enterprise sellers.',
      tagline: 'Maximum power',
      features: [
        'Unlimited product listings',
        '20 images per listing',
        '10 featured product slots',
        'Real-time analytics dashboard',
        '24/7 dedicated account manager',
        'Custom API access',
        'Advanced integrations',
        '100% of your sales'
      ],
      isSpecial: false,
      color: 'amber',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50'
    }
  ];

  const handleSelectPlan = (tier: 'mkulima' | 'starter' | 'pro' | 'enterprise', amount: number) => {
    setSelectedTier(tier);
    // Trigger the payment flow
    onSelectPlan(tier, amount);
  };

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Offspring Decor Limited Marketplace
        </h2>
        <p className="text-xl text-gray-600 mb-4">Simple, transparent pricing for all sellers</p>

        {/* Commission Notice */}
        <div className="inline-flex items-center gap-3 bg-green-100 border border-green-400 rounded-full px-6 py-3 mb-8">
          <Check size={20} className="text-green-600" />
          <span className="text-lg font-bold text-green-800">
            Sellers keep 100% of their sales — No Commissions!
          </span>
        </div>

        <p className="text-gray-600">
          Choose the plan that fits your business. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedTier === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 transition-all duration-300 ${
                plan.isSpecial
                  ? `${plan.borderColor} ${plan.bgColor} shadow-2xl transform scale-105`
                  : plan.isPopular
                    ? `${plan.borderColor} ${plan.bgColor} shadow-lg transform scale-[1.02]`
                    : `border-gray-200 bg-white shadow-md`
              } ${isSelected ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap ${
                    plan.isSpecial
                      ? 'bg-green-600'
                      : plan.isPopular
                        ? 'bg-purple-600'
                        : 'bg-gray-600'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    plan.isSpecial
                      ? 'bg-green-200 text-green-700'
                      : plan.isPopular
                        ? 'bg-purple-200 text-purple-700'
                        : plan.color === 'blue'
                          ? 'bg-blue-200 text-blue-700'
                          : 'bg-amber-200 text-amber-700'
                  }`}
                >
                  <Icon size={24} />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                {/* Tagline */}
                {plan.tagline && (
                  <p
                    className={`text-sm font-semibold mb-4 ${
                      plan.isSpecial ? 'text-green-700' : 'text-gray-700'
                    }`}
                  >
                    {plan.tagline}
                  </p>
                )}

                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-gray-900">
                      KES {plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600 text-sm">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-gray-500">{plan.periodLabel}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div
                        className={`mt-1 rounded-full p-0.5 ${
                          plan.isSpecial
                            ? 'bg-green-200'
                            : plan.isPopular
                              ? 'bg-purple-200'
                              : plan.color === 'blue'
                                ? 'bg-blue-200'
                                : 'bg-amber-200'
                        }`}
                      >
                        <Check
                          size={14}
                          className={`${
                            plan.isSpecial
                              ? 'text-green-700'
                              : plan.isPopular
                                ? 'text-purple-700'
                                : plan.color === 'blue'
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {currentPlan === plan.id ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id as any, plan.price)}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                      plan.buttonColor
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading && isSelected ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Buy Now
                        <Zap size={16} />
                      </>
                    )}
                  </button>
                )}

                {/* 100% Note */}
                <p className="text-xs text-center text-gray-600 mt-4">
                  ✅ You keep 100% of your sales
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex gap-3 mb-4">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Why Offspring Decor Limited?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  ✓ <strong>No hidden commissions</strong> — We believe in transparency
                </li>
                <li>
                  ✓ <strong>Seller-first platform</strong> — Your success is our success
                </li>
                <li>
                  ✓ <strong>Flexible plans</strong> — Change anytime without penalties
                </li>
                <li>
                  ✓ <strong>Mkulima support</strong> — Special pricing for farmers (1,500 KES/year)
                </li>
                <li>
                  ✓ <strong>24/7 support</strong> — Pro and Enterprise get dedicated help
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Can I change plans?</h4>
            <p className="text-gray-600">
              Yes! Upgrade or downgrade anytime. Changes take effect on your next renewal date.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">What about refunds?</h4>
            <p className="text-gray-600">
              Full refund within 7 days of purchase if you're not satisfied. No questions asked.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Is Mkulima really 1 year?</h4>
            <p className="text-gray-600">
              Yes! Mkulima is a special offer: 1,500 KES for 365 days. Designed to support farmers.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">What payment methods?</h4>
            <p className="text-gray-600">
              M-Pesa, bank transfer, and card payments. We support all major payment methods in
              Kenya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
