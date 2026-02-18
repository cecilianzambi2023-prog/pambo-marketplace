import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { initiateMPesaSTKPush, SUBSCRIPTION_TIERS, getTierPrice, getTierName, formatPhoneForMPesa, isValidMPesaPhone } from '../services/mpesaService';

interface SubscribeButtonProps {
  tier: string; // 'mkulima' | 'starter' | 'pro' | 'enterprise'
  userId: string;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

type ModalStep = 'phone' | 'processing' | 'success' | 'error';

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  tier,
  userId,
  onSuccess,
  onError,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<ModalStep>('phone');
  const [errorMessage, setErrorMessage] = useState('');
  const [merchantRequestId, setMerchantRequestId] = useState('');

  const tierInfo = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  const price = getTierPrice(tier);
  const tierDisplayName = getTierName(tier);

  if (!tierInfo) {
    return <div className="text-red-500">Invalid tier: {tier}</div>;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setStep('phone');
    setPhoneNumber('');
    setErrorMessage('');
    setMerchantRequestId('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔔 Triggering M-Pesa...');

    // Validate phone
    if (!isValidMPesaPhone(phoneNumber)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    setStep('processing');
    setErrorMessage('');

    try {
      const formattedPhone = formatPhoneForMPesa(phoneNumber);
      console.log('📱 Formatted phone number:', formattedPhone);

      // Call the M-Pesa STK Push function
      console.log('📨 Sending STK Push request to Supabase Edge Function...');
      const response = await initiateMPesaSTKPush({
        seller_id: userId,
        seller_name: '',
        phone_number: formattedPhone,
        amount: price,
        tier: tier,
        user_id: userId,
      });

      console.log('✅ STK Push response:', response);

      if (response.success && response.data) {
        console.log('🎉 Payment initiated successfully! Merchant Request ID:', response.data.merchantRequestId);
        // Payment initiated successfully
        setMerchantRequestId(response.data.merchantRequestId);
        setStep('success');

        // Call callback
        if (onSuccess) {
          onSuccess(response);
        }

        // Auto-close modal after 3 seconds
        setTimeout(() => {
          handleCloseModal();
        }, 3000);
      } else {
        console.error('❌ Payment failed:', response.message);
        // Payment failed
        setErrorMessage(response.message || 'Failed to initiate payment. Please try again.');
        setStep('error');

        if (onError) {
          onError(response.message || 'Payment initiation failed');
        }
      }
    } catch (error) {
      console.error('❌ Subscribe error:', error);
      setErrorMessage((error as any)?.message || 'An error occurred. Please try again.');
      setStep('error');

      if (onError) {
        onError((error as any)?.message || 'An error occurred');
      }
    }
  };

  // Button styling
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-lg hover:from-orange-700 hover:to-amber-700',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border-2 border-orange-600 text-orange-600 hover:bg-orange-50',
  };

  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 justify-center';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <>
      {/* Subscribe Button */}
      <button
        onClick={handleOpenModal}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass}`}
        aria-label={`Subscribe to ${tierDisplayName} plan`}
      >
        <CreditCard size={18} />
        {size === 'sm' ? 'Subscribe' : `Subscribe - KES ${price}`}
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6">
              <h2 className="text-2xl font-bold">{tierDisplayName}</h2>
              <p className="text-orange-100 mt-1">Subscribe now for premium access</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'phone' && (
                <form onSubmit={handleInitiatePayment}>
                  <div className="space-y-4">
                    {/* Plan Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-semibold">{tierDisplayName}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-lg text-orange-600">KES {price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Billing:</span>
                        <span className="font-semibold">{tierInfo.billing_period}</span>
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M-Pesa Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          placeholder="0712345678 or 254712345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your M-Pesa registered phone number
                      </p>
                      <p className="text-xs text-gray-600 mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        📱 Please keep your phone unlocked. You will receive an M-Pesa prompt to enter your PIN.
                      </p>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {errorMessage}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!phoneNumber || !!errorMessage}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="inline mr-2" size={18} />
                      Pay with M-Pesa
                    </button>

                    {/* Cancel Button */}
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {step === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin text-orange-600 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Payment</h3>
                  <p className="text-gray-600">
                    Check your phone for the M-Pesa payment prompt
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    Enter your M-Pesa PIN to complete payment
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle className="text-orange-600 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Initiated!</h3>
                  <p className="text-gray-600 mb-4">
                    Check your M-Pesa phone for the payment prompt
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Your subscription will activate</span> once you complete the M-Pesa payment on your phone
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Closing in 3 seconds...
                  </p>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Failed</h3>
                  <p className="text-gray-600 mb-4">{errorMessage}</p>
                  <button
                    onClick={() => setStep('phone')}
                    className="w-full bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700 transition-all"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="w-full mt-2 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
