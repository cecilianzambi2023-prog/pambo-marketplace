import React, { useEffect, useState } from 'react';
import { PricingGrid } from './PricingTierCard';
import { supabase } from '../src/lib/supabaseClient';

export const PricingPageComponent: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        } else {
          // Default to guest for demo purposes
          setUserId('guest-user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUserId('guest-user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. 0% commission on all sales, direct payments
            to your account.
          </p>
        </div>

        {/* Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
            <p className="text-gray-600">Commission on sales</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">Instant</div>
            <p className="text-gray-600">Direct M-Pesa payments</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <p className="text-gray-600">Access to all features</p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto">{userId && <PricingGrid userId={userId} />}</div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-20 bg-white rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Can I upgrade or downgrade my plan?
            </h3>
            <p className="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect
              immediately.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept M-Pesa payments for all plans. Mobile money makes it easy and fast.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">What happens after I pay?</h3>
            <p className="text-gray-600">
              Your subscription activates immediately after payment confirmation. You'll receive an
              SMS and can start using all features.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              We don't offer a free trial, but you can start with the Mkulima Starter plan (KES
              1,500 yearly) with minimal commitment.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto mt-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
        <p className="text-lg text-green-100 mb-8">
          Join thousands of sellers already using our platform. 0% commission, 100% support.
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all">
          Choose Your Plan Above
        </button>
      </div>
    </div>
  );
};
