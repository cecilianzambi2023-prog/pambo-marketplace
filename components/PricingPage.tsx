import React, { useState, useEffect } from 'react';
import { PricingTable } from './PricingTable';
import { PricingPaymentModal } from './PricingPaymentModal';
import { supabase } from '../supabaseClient';

/**
 * PricingPage - Complete pricing and subscription flow
 * Combines PricingTable and PricingPaymentModal components
 */
export const PricingPage: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<
    'mkulima' | 'starter' | 'pro' | 'enterprise' | null
  >(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [currentPlan, setCurrentPlan] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Get current user and their subscription
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
          setUserId(session.user.id);

          // Fetch user's current subscription
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('user_id', session.user.id)
            .single();

          if (profile?.subscription_tier) {
            setCurrentPlan(profile.subscription_tier);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Handle plan selection
  const handleSelectPlan = (tier: 'mkulima' | 'starter' | 'pro' | 'enterprise', amount: number) => {
    if (!userId) {
      alert('Please log in first to purchase a subscription');
      return;
    }

    setSelectedTier(tier);
    setSelectedAmount(amount);
    setIsModalOpen(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = async () => {
    // Refresh user's subscription data
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single();

      if (profile?.subscription_tier) {
        setCurrentPlan(profile.subscription_tier);
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Get Started with Offspring Decor Limited
          </h1>
          <p className="text-xl text-green-100 mb-2">Choose the perfect plan for your business</p>
          <p className="text-lg text-green-50">
            Transparent pricing • No hidden commissions • Flexible plans
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="w-full">
        <PricingTable
          onSelectPlan={handleSelectPlan}
          currentPlan={currentPlan}
          isLoading={isLoading}
        />
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start selling?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of sellers on Offspring Decor Limited. Sign up today and start building
            your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#/dashboard"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Create Account
            </a>
            <a
              href="#/contact-support"
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PricingPaymentModal
        isOpen={isModalOpen}
        tier={selectedTier}
        amount={selectedAmount}
        userId={userId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTier(null);
          setSelectedAmount(null);
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PricingPage;
