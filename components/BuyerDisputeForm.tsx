/**
 * Buyer Dispute Form Component - KENYA ONLY
 * Allows Kenyan buyers to file disputes against sellers
 * 
 * Features:
 * - Dispute category selector
 * - Evidence file upload (multiple)
 * - Description with validation
 * - Refund amount display
 * - Timeline expectations
 * - Review before submit
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Upload,
  Trash2,
  Loader2,
  CheckCircle,
  Calendar,
  Shield,
  FileText,
  Camera,
  X,
} from 'lucide-react';
import { createDispute, KENYA_DISPUTE_CATEGORIES } from '../services/disputeService';

interface BuyerDisputeFormProps {
  order_id: string;
  product_name: string;
  seller_name: string;
  buyer_id: string;
  seller_id: string;
  order_amount: number; // in KES
  onClose?: () => void;
  onSubmitSuccess?: () => void;
}

type DisputeCategory = keyof typeof KENYA_DISPUTE_CATEGORIES;

export const BuyerDisputeForm: React.FC<BuyerDisputeFormProps> = ({
  order_id,
  product_name,
  seller_name,
  buyer_id,
  seller_id,
  order_amount,
  onClose,
  onSubmitSuccess,
}) => {
  // Form state
  const [category, setCategory] = useState<DisputeCategory>('product_not_received');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showReview, setShowReview] = useState(false);

  const categoryInfo = KENYA_DISPUTE_CATEGORIES[category];
  const allowsRefund = categoryInfo?.refundable;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    
    // Validation
    if (evidenceFiles.length + files.length > 5) {
      setErrorMessage('Maximum 5 files allowed');
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Each file must be less than 10 MB');
        return;
      }
    }

    setEvidenceFiles([...evidenceFiles, ...files]);
    setErrorMessage('');
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showReview) {
      // Validate form
      if (!title.trim()) {
        setErrorMessage('Please enter a dispute title');
        return;
      }
      if (!description.trim()) {
        setErrorMessage('Please provide details of the issue');
        return;
      }
      if (description.length < 20) {
        setErrorMessage('Please provide at least 20 characters of detail');
        return;
      }
      if (evidenceFiles.length === 0) {
        setErrorMessage('Please upload at least one file as evidence');
        return;
      }

      setShowReview(true);
      return;
    }

    // Submit
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await createDispute(
        order_id,
        buyer_id,
        seller_id,
        category,
        title,
        description,
        order_amount,
        evidenceFiles
      );

      if (result.success) {
        setSuccessMessage(
          '✅ Dispute filed successfully! ' +
          'Seller has 7 days to respond. We\'ll notify you of any updates.'
        );
        
        setTimeout(() => {
          onSubmitSuccess?.();
        }, 2000);
      } else {
        throw new Error(result.error?.message || 'Failed to create dispute');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-green-200">
        <div className="text-center">
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Dispute Filed Successfully!</h2>
          <p className="text-green-700 mb-4">{successMessage}</p>
          <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 mb-4">
            <p className="font-semibold mb-2">📅 What Happens Next:</p>
            <ul className="space-y-1 text-left">
              <li>✅ Seller has 7 days to respond to your dispute</li>
              <li>✅ We'll contact seller immediately</li>
              <li>✅ You'll receive email and SMS updates</li>
              <li>✅ If unresolved, admin will review on day 8</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            ⚖️ Kenya Dispute Resolution
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          File a dispute about your purchase. Our Kenya team will help resolve the issue fairly.
        </p>
      </div>

      {/* Order Info Box */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900 font-semibold mb-2">📦 Order Details</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Product:</span>
            <p className="font-semibold text-blue-900">{product_name}</p>
          </div>
          <div>
            <span className="text-blue-700">Seller:</span>
            <p className="font-semibold text-blue-900">{seller_name}</p>
          </div>
          <div>
            <span className="text-blue-700">Order:</span>
            <p className="font-semibold text-blue-900">#{order_id.slice(0, 8)}</p>
          </div>
          <div>
            <span className="text-blue-700">Amount:</span>
            <p className="font-semibold text-blue-900">KES {order_amount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {!showReview ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dispute Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What's the issue? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(KENYA_DISPUTE_CATEGORIES).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as DisputeCategory)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    category === key
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xl mb-1">{info.icon}</p>
                  <p className="font-semibold text-xs text-gray-900">{info.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">{categoryInfo?.description}</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Dispute Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Item arrived damaged - cracked screen"
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Detailed Explanation *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain what happened and how it affects you. Include dates, delivery timeline, communications, etc."
              maxLength={1000}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/1000</p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Upload Evidence * (Photos, Screenshots, Videos - Max 5 files, 10 MB each)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition cursor-pointer">
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf"
                multiple
                className="hidden"
                id="evidence-input"
              />
              <label htmlFor="evidence-input" className="cursor-pointer">
                {evidenceFiles.length === 0 ? (
                  <div className="text-center">
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold text-gray-700">Click to upload evidence</p>
                    <p className="text-sm text-gray-500 mt-1">Photos of damage, unboxing videos, receipt, etc.</p>
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-600">
                    <CheckCircle size={24} className="mx-auto mb-2 text-green-600" />
                    {evidenceFiles.length} file(s) selected
                  </div>
                )}
              </label>
            </div>

            {/* File List */}
            {evidenceFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {evidenceFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FileText size={18} className="text-orange-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expected Outcome */}
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-semibold text-amber-900 mb-2">📋 Possible Resolutions</p>
            <div className="space-y-1 text-xs text-amber-800">
              <p>• <span className="font-semibold">Full Refund:</span> KES {order_amount.toLocaleString()} returned to M-Pesa</p>
              <p>• <span className="font-semibold">Partial Refund:</span> Partial compensation agreed between parties</p>
              <p>• <span className="font-semibold">Replacement:</span> New item sent without additional payment</p>
              <p>• <span className="font-semibold">Rejected:</span> Dispute resolved in seller's favor</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Calendar size={16} /> Kenya Dispute Timeline
            </p>
            <div className="space-y-2 text-xs text-green-800">
              <div className="flex gap-2">
                <span className="font-bold text-green-700">Day 0:</span>
                <span>You file dispute - Seller notified immediately</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-700">Days 1-7:</span>
                <span>Seller responds & negotiation period</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-700">Day 8+:</span>
                <span>Kenya admin team reviews if unresolved</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-700">Final:</span>
                <span>Resolution + Refund processed (2-3 days)</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Review & Submit Dispute
                </>
              )}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        // Review Screen
        <div className="space-y-5">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-3">📋 Review Your Dispute</p>
            
            <div className="space-y-3">
              <div className="border-b border-blue-200 pb-3">
                <p className="text-xs text-blue-700 font-semibold">ISSUE TYPE</p>
                <p className="text-sm font-semibold text-blue-900">{categoryInfo?.label}</p>
              </div>

              <div className="border-b border-blue-200 pb-3">
                <p className="text-xs text-blue-700 font-semibold">TITLE</p>
                <p className="text-sm font-semibold text-blue-900">{title}</p>
              </div>

              <div className="border-b border-blue-200 pb-3">
                <p className="text-xs text-blue-700 font-semibold">DETAILS</p>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{description}</p>
              </div>

              <div className="border-b border-blue-200 pb-3">
                <p className="text-xs text-blue-700 font-semibold">EVIDENCE</p>
                <p className="text-sm text-blue-900">{evidenceFiles.length} file(s) attached</p>
                <div className="mt-2 space-y-1">
                  {evidenceFiles.map((file, idx) => (
                    <p key={idx} className="text-xs text-blue-700">
                      • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-blue-700 font-semibold">REFUND ELIGIBLE</p>
                <p className="text-sm font-semibold text-blue-900">
                  {allowsRefund ? `✅ Yes - Up to KES ${order_amount.toLocaleString()}` : '❌ Not refundable for this type'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-semibold text-amber-900 mb-2">⚠️ Important Notice</p>
            <p className="text-xs text-amber-800">
              By submitting this dispute, you confirm that the information provided is accurate and truthful. 
              Filing false disputes may result in account suspension. Seller will be notified and can respond within 7 days.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Confirm & Submit Dispute
                </>
              )}
            </button>
            <button
              onClick={() => setShowReview(false)}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDisputeForm;
