import React, { useState } from 'react';
import { X, Star, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { FEATURED_LISTING_PRICE, FEATURED_LISTING_DURATION_DAYS } from '../constants';

interface FeaturedListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phone: string) => Promise<void>;
  listingTitle: string;
  listingPrice?: number;
}

export const FeaturedListingModal: React.FC<FeaturedListingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  listingTitle,
  listingPrice
}) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Convert 0... to 254...
    if (value.startsWith('0')) {
      value = '254' + value.slice(1);
    }
    
    setPhone(value);
  };

  const handleConfirm = async () => {
    if (!phone || phone.length < 12) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm(phone);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPhone('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-screen overflow-auto animate-fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <Star size={24} className="fill-yellow-300" />
            <h2 className="text-xl font-bold">Feature Your Listing</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-green-600 fill-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Featured! 🎉</h3>
            <p className="text-gray-600 mb-4">Your listing will be featured for {FEATURED_LISTING_DURATION_DAYS} days</p>
            <p className="text-sm text-gray-500">Payment confirmed via M-Pesa. Redirecting...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 mb-3">Why Feature Your Listing?</h3>
              
              <div className="flex gap-3">
                <TrendingUp size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Get More Visibility</p>
                  <p className="text-xs text-gray-600">Appear at the top of search results</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Star size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Featured Badge</p>
                  <p className="text-xs text-gray-600">Special ⭐ badge shows seller quality</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{FEATURED_LISTING_DURATION_DAYS} Days Promotion</p>
                  <p className="text-xs text-gray-600">Boost your sales this week</p>
                </div>
              </div>
            </div>

            {/* Listing Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Featured Listing</p>
              <p className="font-semibold text-gray-900 text-sm line-clamp-2">{listingTitle}</p>
              {listingPrice && (
                <p className="text-orange-600 font-bold text-sm mt-2">KES {listingPrice.toLocaleString()}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Featured for {FEATURED_LISTING_DURATION_DAYS} Days</span>
                <span className="text-2xl font-bold text-orange-600">KES {FEATURED_LISTING_PRICE}</span>
              </div>
              <p className="text-xs text-gray-600">One-time payment via M-Pesa</p>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="0712345678 or 254712345678"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ✓ Your M-Pesa registered phone number
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                You'll receive an M-Pesa prompt on your phone to complete the payment
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || !phone}
                className="flex-1 px-4 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Star size={18} className="fill-white" />
                    Feature for KES {FEATURED_LISTING_PRICE}
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
