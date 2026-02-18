import React, { useState, useEffect } from 'react';
import { subscriptionService, premiumService } from '@/services/subscriptionService';
import { paymentsService } from '@/services/paymentsService';

/**
 * PricingPlans Component
 * Shows subscription tiers for each hub
 */
export const PricingPlans: React.FC<{
  hub: string;
  currentPlan?: string;
  onSelect: (plan: string) => void;
}> = ({ hub, currentPlan, onSelect }) => {
  const plans = [
    {
      name: 'Mkulima',
      price: 1500,
      tier: 'mkulima',
      period: '1 YEAR',
      features: { listings: Infinity, images: 10, featured: 5, analytics: true, apiAccess: false, automations: 0, customBranding: false },
      description: 'Special Offer - 1 Year Protection',
      highlight: false,
      isSpecialOffer: true,
    },
    {
      name: 'Starter',
      price: 3500,
      tier: 'starter',
      period: 'Monthly',
      features: { listings: 20, images: 5, featured: 2, analytics: false, apiAccess: false, automations: 0, customBranding: false },
      description: 'Perfect for getting started',
      highlight: false,
      isSpecialOffer: false,
    },
    {
      name: 'Pro',
      price: 5000,
      tier: 'pro',
      period: 'Monthly',
      features: { listings: 50, images: 10, featured: 5, analytics: true, apiAccess: false, automations: 3, customBranding: true },
      description: 'Best for growing businesses',
      highlight: true,
      isSpecialOffer: false,
    },
    {
      name: 'Enterprise',
      price: 9000,
      tier: 'enterprise',
      period: 'Monthly',
      features: { listings: Infinity, images: 20, featured: 10, analytics: true, apiAccess: true, automations: 10, customBranding: true },
      description: 'For large-scale operations',
      highlight: false,
      isSpecialOffer: false,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
      {plans.map((plan) => (
        <div
          key={plan.tier}
          className={`rounded-lg border-2 p-8 relative ${
            plan.isSpecialOffer
              ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
              : plan.highlight 
              ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
              : 'border-gray-200 bg-white'
          }`}
        >
          {plan.isSpecialOffer && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              🎁 SPECIAL OFFER - 1 YEAR!
            </div>
          )}
          {plan.highlight && !plan.isSpecialOffer && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
          )}

          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

          <div className="mb-6">
            <div className="text-4xl font-bold text-gray-900">
              {plan.price.toLocaleString()}
              <span className="text-lg text-gray-600">/{plan.period}</span>
            </div>
            {plan.isSpecialOffer && (
              <p className="text-green-700 font-bold text-sm mt-2">✅ Safe & Supported</p>
            )}
            <p className="text-gray-600 text-sm mt-2">{plan.isSpecialOffer ? 'One-time payment' : 'Billed ' + (plan.period === 'Monthly' ? 'monthly' : 'yearly')}</p>
          </div>

          {currentPlan === plan.tier ? (
            <button
              disabled
              className="w-full py-3 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold mb-6 cursor-not-allowed"
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => onSelect(plan.tier)}
              className={`w-full py-3 px-4 rounded-lg font-semibold mb-6 transition ${
                plan.isSpecialOffer
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : plan.highlight
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Choose {plan.name}
            </button>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <span className="inline-block w-5 h-5 mr-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
                {plan.features.listings === Infinity ? 'Unlimited' : plan.features.listings} active listings
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="inline-block w-5 h-5 mr-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
                {plan.features.images} images per listing
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="inline-block w-5 h-5 mr-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
                {plan.features.featured} featured listings
              </li>
              {plan.features.analytics && (
                <li className="flex items-center text-sm text-gray-700">
                  <span className="inline-block w-5 h-5 mr-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
                  Analytics & Reports
                </li>
              )}
              {plan.features.apiAccess && (
                <li className="flex items-center text-sm text-gray-700">
                  <span className="inline-block w-5 h-5 mr-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
                  API access
                </li>
              )}
              {plan.features.automations > 0 && (
                <li className="flex items-center text-sm text-gray-700">
                  <span className="inline-block w-5 h-5 mr-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
                  {plan.features.automations} automations
                </li>
              )}
              {plan.features.customBranding && (
                <li className="flex items-center text-sm text-gray-700">
                  <span className="inline-block w-5 h-5 mr-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
                  Custom branding
                </li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * SubscriptionModal Component
 * For purchasing subscriptions via M-Pesa
 */
export const SubscriptionModal: React.FC<{
  userId: string;
  hub: string;
  selectedPlan: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ userId, hub, selectedPlan, onClose, onSuccess }) => {
  const [step, setStep] = useState<'plan' | 'payment' | 'confirm'>('payment');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const planPricing = {
    starter: 3500,
    pro: 7000,
    enterprise: 14000,
  };

  const amount = planPricing[selectedPlan as keyof typeof planPricing];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Convert 0... to 254...
    if (value.startsWith('0')) {
      value = '254' + value.slice(1);
    }
    
    setPhone(value);
  };

  const handleInitiatePayment = async () => {
    if (!phone || phone.length < 12) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Initiate subscription payment
      const response = await fetch('/api/payments/subscription/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phone,
          hub,
          plan: selectedPlan
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setTransactionId(data.subscriptionId);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Upgrade to {selectedPlan.toUpperCase()}</h2>
          <p className="text-blue-100 mt-1">{hub} Hub • {amount.toLocaleString()} KES/month</p>
        </div>

        <div className="p-6">
          {step === 'payment' && (
            <>
              <p className="text-gray-600 mb-4">
                Enter your M-Pesa phone number to start your subscription
              </p>

              <input
                type="tel"
                placeholder="254 712 345 678"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  <strong>You will receive:</strong>
                  <br />• M-Pesa STK prompt on your phone
                  <br />• Amount: <strong>{amount.toLocaleString()} KES</strong>
                  <br />• Billing cycle: Monthly (auto-renews)
                </p>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={loading || !phone}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Processing...' : 'Continue to M-Pesa'}
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Check Your Phone</h3>
                <p className="text-gray-600 mb-6">
                  You should see an M-Pesa STK prompt on {phone}
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left text-sm">
                  <p className="text-gray-700">
                    <strong>Subscription ID:</strong>
                    <br />
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs">{transactionId}</code>
                  </p>
                </div>

                <p className="text-gray-600 text-sm mb-6">
                  Complete the payment within 2 minutes
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition"
              >
                I've Completed Payment
              </button>
            </>
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * SubscriptionStatus Component
 * Shows user's active subscriptions
 */
export const SubscriptionStatus: React.FC<{
  subscriptions: any;
}> = ({ subscriptions }) => {
  if (!subscriptions) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Active Subscriptions</h3>

      {Object.entries(subscriptions).map(([hub, subs]: [string, any]) => {
        const activeSub = subs.find((s: any) => s.status === 'active');

        return (
          <div key={hub} className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
              <p className="font-semibold text-gray-900 capitalize">{hub} Hub</p>
              {activeSub ? (
                <>
                  <p className="text-sm text-gray-600">
                    Plan: <strong>{activeSub.plan.toUpperCase()}</strong> • {activeSub.monthlyPrice.toLocaleString()} KES/month
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Renews: {new Date(activeSub.nextBillingDate).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-red-600">No active subscription</p>
              )}
            </div>
            <div className="text-right">
              {activeSub && (
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Active
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default {
  PricingPlans,
  SubscriptionModal,
  SubscriptionStatus
};
