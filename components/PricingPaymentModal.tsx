import React, { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { useSubscriptionPayment } from '../hooks/useSubscriptionPayment';

interface PricingPaymentModalProps {
  isOpen: boolean;
  tier: 'mkulima' | 'starter' | 'pro' | 'enterprise' | null;
  amount: number | null;
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PricingPaymentModal: React.FC<PricingPaymentModalProps> = ({
  isOpen,
  tier,
  amount,
  userId,
  onClose,
  onSuccess
}) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const { loading, error: hookError, initiatePayment, getTierName } = useSubscriptionPayment();

  if (!isOpen || !tier || !amount) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    const result = await initiatePayment({
      tier,
      amount,
      phone,
      userId
    });

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 3000);
    } else {
      setStep('error');
    }
  };

  const formatPhone = (value: string) => {
    // Auto-format phone number as user types
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);

    // Add +254 prefix if starting with 0
    if (cleaned.startsWith('0') && cleaned.length > 1) {
      cleaned = '254' + cleaned.slice(1);
    } else if (!cleaned.startsWith('254') && cleaned.length > 0) {
      if (cleaned.length <= 9) {
        cleaned = '254' + cleaned;
      }
    }

    setPhone(cleaned);
  };

  const isPhoneValid = phone.startsWith('254') && phone.length === 12;
  const tierName = getTierName(tier);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Complete Your Payment</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 p-1 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <>
              {/* Plan Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{tierName}</span>
                  <span className="text-2xl font-bold text-green-700">
                    KES {amount?.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {tier === 'mkulima' ? '365 days access' : 'Monthly subscription'}
                </p>
                <p className="text-xs text-green-700 font-semibold mt-2">
                  ✅ You keep 100% of your sales
                </p>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => formatPhone(e.target.value)}
                      placeholder="07xxxxxx or 254712345678"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                        isPhoneValid
                          ? 'border-green-500 bg-green-50'
                          : phone && !isPhoneValid
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use your M-Pesa registered phone number
                  </p>
                  {phone && !isPhoneValid && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Please enter a valid 12-digit number (e.g., 254712345678)
                    </p>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">How it works:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Click "Pay with M-Pesa" below</li>
                    <li>2. You'll receive an M-Pesa prompt on your phone</li>
                    <li>3. Enter your M-Pesa PIN to complete</li>
                    <li>4. Your subscription activates immediately</li>
                  </ol>
                </div>

                {/* Error Message */}
                {hookError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{hookError}</p>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  type="submit"
                  disabled={!isPhoneValid || loading}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
                    isPhoneValid && !loading
                      ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>💳 Pay with M-Pesa</>
                  )}
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </form>

              {/* Security Note */}
              <p className="text-xs text-center text-gray-500 mt-4">
                🔒 Secure payment via Safaricom M-Pesa. Your data is encrypted.
              </p>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader2 size={48} className="text-green-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-gray-600 mb-4">Please check your phone for the M-Pesa prompt.</p>
              <p className="text-sm text-gray-500">Phone: {phone}</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-2">Welcome to {tierName}</p>
              <p className="text-sm text-gray-500">
                Your subscription is now active. You can start selling immediately.
              </p>
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900">
                  ✅ 100% of your sales go to you
                </p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-12">
              <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">
                {hookError || 'There was an error processing your payment.'}
              </p>
              <button
                onClick={() => setStep('form')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
