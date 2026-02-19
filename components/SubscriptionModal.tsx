import React, { useState } from 'react';
import { Check, X, ShieldCheck, Wallet, ClipboardCheck, Loader2, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_FEE, FREE_LISTING_LIMIT } from '../constants';

interface SubscriptionModalProps {
  isOpen: boolean;
  isExpired: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  isExpired,
  onClose,
  onConfirmPayment
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsConfirming(true);
    // Simulate backend verification delay
    setTimeout(() => {
      onConfirmPayment();
      setIsConfirming(false);
    }, 2000);
  };

  const title = isExpired ? 'Renew Your VVVIP Plan' : 'Upgrade to VVVIP';
  const subtitle = isExpired
    ? 'Your access has expired. Renew to keep your premium benefits.'
    : 'Activate your VVVIP seller benefits for one month with a payment of KES 3,500.';
  const buttonText = isExpired ? "I've Paid, Renew My Account" : "I've Paid, Activate VVVIP";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className={`p-8 text-center ${isExpired ? 'bg-red-800' : 'bg-blue-800'}`}>
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white ${isExpired ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-300 text-sm">{subtitle}</p>
        </div>

        <div className="p-8">
          <ul className="text-sm text-gray-600 space-y-3 mb-6 text-left">
            <li className="flex items-start gap-3">
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <strong>Full Business Autonomy</strong>
                <p className="text-xs text-gray-500">
                  Manage your own page, products, and customer interactions independently. Your
                  business is your own.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <strong>Post Professional Service Ads</strong>
                <p className="text-xs text-gray-500">
                  List your skills on our dedicated services marketplace.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <strong>Priority Placement</strong>
                <p className="text-xs text-gray-500">
                  Your listings appear higher in search results.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <strong>VVVIP Seller Badge</strong>
                <p className="text-xs text-gray-500">
                  Build trust with a verified premium badge on your profile.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <strong>Unlimited Product Listings</strong>
                <p className="text-xs text-gray-500">
                  Post as many products as you need with no limits.
                </p>
              </div>
            </li>
          </ul>
          {/* FIX: Correct the message about free listings to reflect the limit. */}
          <div className="text-sm p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 mb-6">
            <strong>Free Plan:</strong> Includes up to{' '}
            <strong>{FREE_LISTING_LIMIT} product listings</strong>. Upgrade for unlimited!
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-center text-gray-800 mb-3">
              Pay KES {SUBSCRIPTION_FEE} with M-Pesa
            </h3>
            <ol className="text-sm text-gray-600 space-y-2 text-left">
              <li>1. Go to **M-Pesa** on your phone</li>
              <li>2. Select **Lipa na M-Pesa**</li>
              <li>3. Select **Pay Bill**</li>
              <li>
                4. Enter Business No: <strong className="text-gray-900">714888</strong>
              </li>
              <li>
                5. Enter Account No: <strong className="text-gray-900">396334</strong>
              </li>
              <li>
                6. Enter Amount: <strong className="text-gray-900">KES {SUBSCRIPTION_FEE}</strong>
              </li>
              <li>7. Complete the transaction on your phone</li>
            </ol>
            <p className="text-xs text-center mt-3 text-gray-500">
              Account Name: OFFSPRING DECOR LIMITED
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-wait"
          >
            {isConfirming ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Verifying Payment...
              </>
            ) : (
              <>
                <ClipboardCheck size={20} /> {buttonText}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your account will be upgraded automatically after payment confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
