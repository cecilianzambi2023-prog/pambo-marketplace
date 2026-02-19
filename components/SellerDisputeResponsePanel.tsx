/**
 * Seller Dispute Response Panel - KENYA ONLY
 * Allows sellers to respond to buyer disputes
 *
 * Features:
 * - View pending disputes
 * - Upload counter-evidence
 * - Provide response/explanation
 * - Proposed resolution
 * - Timeline tracking
 * - Response deadline alerts
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Upload,
  Loader2,
  Clock,
  FileText,
  Send,
  X,
  CheckCircle,
  Eye,
  Trash2,
  Shield,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { getSellerDisputes, getDisputeDetails, sellerRespond } from '../services/disputeService';

interface DisputeWithDetails {
  id: string;
  order_id: string;
  buyer_id: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  mpesa_receipt_number: string;
  status: string;
  evidence_urls: string[];
  created_at: string;
  buyer?: {
    full_name: string;
    avatar_url: string;
  };
  messages?: any[];
}

interface SellerDisputeResponsePanelProps {
  seller_id: string;
}

export const SellerDisputeResponsePanel: React.FC<SellerDisputeResponsePanelProps> = ({
  seller_id
}) => {
  const [disputes, setDisputes] = useState<DisputeWithDetails[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<DisputeWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [response, setResponse] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [urgentDisputesCount, setUrgentDisputesCount] = useState(0);

  useEffect(() => {
    loadSellerDisputes();
  }, [seller_id]);

  const loadSellerDisputes = async () => {
    setIsLoading(true);
    try {
      const result = await getSellerDisputes(seller_id);
      if (result.success) {
        setDisputes(result.disputes);
        setUrgentDisputesCount(result.urgent || 0);

        // Check if seller has more than 3 unresolved disputes
        const unresolvedDisputes = result.disputes.filter(
          (d) => d.status === 'seller_response_pending' || d.status === 'in_negotiation'
        );

        if (unresolvedDisputes.length > 3) {
          setErrorMessage(
            `⚠️ Account suspended: You have ${unresolvedDisputes.length} unresolved disputes (max 3 allowed). Contact support to appeal.`
          );
        }
      }
    } catch (error) {
      console.error('Load disputes error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];

    if (evidenceFiles.length + files.length > 3) {
      setErrorMessage('Maximum 3 files allowed');
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

  const calculateDaysRemaining = (createdDate: string) => {
    const created = new Date(createdDate);
    const deadline = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDispute) return;

    if (!response.trim()) {
      setErrorMessage('Please provide a response');
      return;
    }

    if (response.length < 20) {
      setErrorMessage('Response must be at least 20 characters');
      return;
    }

    setIsResponding(true);
    setErrorMessage('');

    try {
      const result = await sellerRespond(selectedDispute.id, seller_id, response, []);

      if (result.success) {
        setSuccessMessage('✅ Response submitted! Buyer will review your explanation.');
        setResponse('');
        setEvidenceFiles([]);

        // Reload disputes
        await loadSellerDisputes();

        setTimeout(() => {
          setSelectedDispute(null);
          setSuccessMessage('');
        }, 2000);
      } else {
        throw new Error(result.error?.message || 'Failed to submit response');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsResponding(false);
    }
  };

  const handleWhatsAppChat = () => {
    if (!selectedDispute) return;

    // Get buyer's phone number from dispute data
    const buyerPhone = (selectedDispute as any).buyer_phone;

    if (!buyerPhone) {
      setErrorMessage('Buyer phone number not available. Please respond here first.');
      return;
    }

    // Format phone number (assuming Kenyan format, remove +254 if present)
    const cleanPhone = buyerPhone.replace('+', '').replace(/\s/g, '');

    // Create WhatsApp message
    const message = `Hi ${selectedDispute.buyer?.full_name || 'there'}, I'd like to discuss the dispute regarding order ${selectedDispute.order_id} (KES ${selectedDispute.amount}). Let's resolve this together. #DisputeRef${selectedDispute.id}`;
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp (works on web and mobile)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 flex items-center justify-center">
        <Loader2 size={32} className="text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield size={28} />
          Kenya Seller Disputes
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Review and respond to buyer disputes to maintain your reputation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-700 font-semibold">URGENT - Awaiting Response</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{urgentDisputesCount}</p>
          <p className="text-xs text-red-600 mt-1">⏰ Respond within 7 days</p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold">Total Disputes</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{disputes.length}</p>
          <p className="text-xs text-blue-600 mt-1">All time open & closed</p>
        </div>

        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs text-green-700 font-semibold">RESOLVED</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {disputes.filter((d) => d.status === 'resolved').length}
          </p>
          <p className="text-xs text-green-600 mt-1">Successfully closed</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Disputes List */}
        <div className="col-span-1">
          <h3 className="font-semibold text-gray-900 mb-3">Your Disputes</h3>

          {disputes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
              <p className="font-semibold">No disputes! 🎉</p>
              <p className="text-sm">Keep up the good service</p>
            </div>
          ) : (
            <div className="space-y-2">
              {disputes.map((dispute) => {
                const daysRemaining = calculateDaysRemaining(dispute.created_at);
                const isUrgent = daysRemaining <= 3 && dispute.status === 'seller_response_pending';

                return (
                  <button
                    key={dispute.id}
                    onClick={() => setSelectedDispute(dispute)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedDispute?.id === dispute.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isUrgent ? 'ring-2 ring-red-500' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                          {dispute.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{dispute.buyer?.full_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              dispute.status === 'seller_response_pending'
                                ? 'bg-red-100 text-red-700 font-semibold'
                                : dispute.status === 'in_negotiation'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {dispute.status === 'seller_response_pending'
                              ? '⏳ Respond Now'
                              : dispute.status.replace('_', ' ')}
                          </span>
                          {isUrgent && (
                            <span className="text-xs font-bold text-red-600">
                              ⚠️ {daysRemaining}d left
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 shrink-0">KES {dispute.amount}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dispute Details & Response */}
        {selectedDispute ? (
          <div className="col-span-2 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            {/* Dispute Info */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedDispute.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedDispute.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-600">Dispute Amount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    KES {selectedDispute.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Category</span>
                  <p className="font-semibold text-gray-900">
                    {selectedDispute.category.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Filed</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedDispute.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`text-gray-600 ${
                      calculateDaysRemaining(selectedDispute.created_at) <= 3
                        ? 'text-red-600 font-bold'
                        : ''
                    }`}
                  >
                    Response Deadline
                  </span>
                  <p
                    className={`font-semibold ${
                      calculateDaysRemaining(selectedDispute.created_at) <= 3
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {calculateDaysRemaining(selectedDispute.created_at)} days left
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer's Evidence */}
            {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 && (
              <div className="p-5 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  📸 Buyer's Evidence ({selectedDispute.evidence_urls.length} files)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {selectedDispute.evidence_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition"
                    >
                      <Eye size={18} className="text-gray-600 mb-1" />
                      <p className="text-xs text-gray-600">View evidence #{idx + 1}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Messages/Timeline */}
            {selectedDispute.status === 'in_negotiation' && (
              <div className="p-5 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} /> Communication
                </p>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-xs text-gray-600 text-center">
                    Message history view would appear here
                  </p>
                </div>
              </div>
            )}

            {/* Response Form */}
            {selectedDispute.status === 'seller_response_pending' && (
              <form onSubmit={handleSubmitResponse} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Response *
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Explain your side of the story. What happened? How do you want to resolve this?"
                    maxLength={800}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{response.length}/800</p>
                </div>

                {/* Counter-Evidence */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Counter-Evidence (Optional - Max 3 files)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,.pdf"
                      multiple
                      className="hidden"
                      id="seller-evidence-input"
                    />
                    <label htmlFor="seller-evidence-input" className="cursor-pointer">
                      {evidenceFiles.length === 0 ? (
                        <div className="text-center">
                          <Upload size={24} className="mx-auto text-gray-400 mb-1" />
                          <p className="text-sm text-gray-700">Upload counter-evidence</p>
                          <p className="text-xs text-gray-500">
                            Receipts, messages, proof of delivery, etc.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-gray-600">
                          ✅ {evidenceFiles.length} file(s) selected
                        </div>
                      )}
                    </label>
                  </div>

                  {evidenceFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {evidenceFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-2 text-sm flex-1">
                            <FileText size={16} className="text-orange-600" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    💡 Tips for Better Response
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>✅ Be honest and professional</li>
                    <li>✅ Provide specific details with dates</li>
                    <li>✅ Offer a fair resolution</li>
                    <li>✅ Upload supporting evidence</li>
                    <li>✅ Be polite - Kenya admin reviews tone</li>
                  </ul>
                </div>

                {/* Messages */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-900 font-semibold">Error</p>
                      <p className="text-xs text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900 font-semibold">{successMessage}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isResponding}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isResponding ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Response
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppChat}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={18} />
                    Chat on WhatsApp
                  </button>
                </div>
              </form>
            )}

            {/* Resolved Badge */}
            {selectedDispute.status === 'resolved' && (
              <div className="p-5 text-center">
                <CheckCircle size={40} className="text-green-600 mx-auto mb-2" />
                <p className="font-bold text-gray-900">Dispute Resolved</p>
                <p className="text-sm text-gray-600 mt-1">
                  This dispute has been closed and resolved
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="col-span-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <MessageSquare size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-semibold">Select a dispute to respond</p>
            <p className="text-sm text-gray-500 mt-1">
              Your response helps resolve issues quickly and fairly
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDisputeResponsePanel;
