/**
 * Admin Dispute Review Queue - KENYA ONLY
 * Allows Kenya admins to review and arbitrate unresolved disputes
 * 
 * Features:
 * - View all admin_review disputes
 * - Evidence review (buyer & seller)
 * - Decision making interface
 * - Refund processing
 * - Seller reputation impact
 * - Audit trail
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
  Eye,
  DollarSign,
  Scale,
  MessageSquare,
  Clock,
  User,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { 
  getPendingAdminDisputes, 
  getDisputeDetails, 
  adminDecide,
  processMpesaRefund 
} from '../services/disputeService';

interface AdminDisputeDetail {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  evidence_urls: string[];
  seller_response?: string;
  created_at: string;
  buyer?: {
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url: string;
  };
  seller?: {
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url: string;
  };
}

interface AdminDisputeQueueProps {
  admin_id: string;
}

type Decision = 'full_refund' | 'partial_refund' | 'replacement' | 'rejected' | 'mutual_agreement';

export const AdminDisputeQueue: React.FC<AdminDisputeQueueProps> = ({ admin_id }) => {
  const [disputes, setDisputes] = useState<AdminDisputeDetail[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeciding, setIsDeciding] = useState(false);
  const [decision, setDecision] = useState<Decision>('full_refund');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [reasoning, setReasoning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAdminDisputes();
  }, [admin_id]);

  useEffect(() => {
    if (selectedDispute) {
      setRefundAmount(selectedDispute.amount);
    }
  }, [selectedDispute]);

  const loadAdminDisputes = async () => {
    setIsLoading(true);
    try {
      const result = await getPendingAdminDisputes();
      if (result.success) {
        setDisputes(result.disputes);
      }
    } catch (error) {
      console.error('Load disputes error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeDecision = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDispute) return;

    if (!reasoning.trim()) {
      setErrorMessage('Please provide reasoning for your decision');
      return;
    }

    if (reasoning.length < 30) {
      setErrorMessage('Reasoning must be at least 30 characters');
      return;
    }

    setIsDeciding(true);
    setErrorMessage('');

    try {
      // Make decision
      const result = await adminDecide(
        selectedDispute.id,
        admin_id,
        decision,
        reasoning,
        decision === 'full_refund' || decision === 'partial_refund' ? refundAmount : undefined
      );

      if (result.success) {
        // Process M-Pesa refund if needed
        if ((decision === 'full_refund' || decision === 'partial_refund') && selectedDispute.buyer?.phone_number) {
          await processMpesaRefund(
            selectedDispute.id,
            selectedDispute.buyer.phone_number,
            refundAmount
          );
        }

        setSuccessMessage(`✅ Decision recorded: ${decision}. Buyer & Seller notified.`);
        setReasoning('');
        setDecision('full_refund');

        // Reload disputes
        await loadAdminDisputes();

        setTimeout(() => {
          setSelectedDispute(null);
          setSuccessMessage('');
        }, 2000);
      } else {
        throw new Error(result.error?.message || 'Failed to make decision');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsDeciding(false);
    }
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
          <Scale size={28} />
          Kenya Admin Dispute Arbitration
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Review escalated disputes and make final arbitration decisions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-700 font-semibold">PENDING REVIEW</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{disputes.length}</p>
          <p className="text-xs text-red-600 mt-1">Awaiting admin decision</p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold">TOTAL AT RISK</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            KES {disputes.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">Potential refund total</p>
        </div>

        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs text-green-700 font-semibold">AVG RESOLUTION TIME</p>
          <p className="text-2xl font-bold text-green-700 mt-1">6-8 hours</p>
          <p className="text-xs text-green-600 mt-1">Kenya admin team standard</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Disputes List */}
        <div className="col-span-1">
          <h3 className="font-semibold text-gray-900 mb-3">Cases for Arbitration</h3>

          {disputes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
              <p className="font-semibold">All clear! 🎉</p>
              <p className="text-sm">No pending disputes for review</p>
            </div>
          ) : (
            <div className="space-y-2">
              {disputes.map(dispute => (
                <button
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedDispute?.id === dispute.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {dispute.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {dispute.buyer?.full_name} vs {dispute.seller?.full_name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                          ⚖️ Under Review
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-600">Amount</p>
                      <p className="font-bold text-orange-600">KES {dispute.amount}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dispute Details */}
        {selectedDispute ? (
          <div className="col-span-2 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            {/* Case Header */}
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedDispute.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedDispute.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Dispute ID</p>
                  <p className="text-sm font-mono text-gray-900">{selectedDispute.id.slice(0, 8)}</p>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <User size={14} /> BUYER
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedDispute.buyer?.full_name}
                  </p>
                  <a href={`mailto:${selectedDispute.buyer?.email}`} className="text-xs text-orange-600 mt-1">
                    {selectedDispute.buyer?.email}
                  </a>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight size={20} className="text-gray-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <User size={14} /> SELLER
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedDispute.seller?.full_name}
                  </p>
                  <a href={`mailto:${selectedDispute.seller?.email}`} className="text-xs text-orange-600 mt-1">
                    {selectedDispute.seller?.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Evidence Tabs */}
            <div className="p-5 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {/* Buyer's Evidence */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3">📸 Buyer's Evidence</p>
                  {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDispute.evidence_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition text-xs"
                        >
                          <Eye size={16} className="text-gray-600" />
                          <span className="truncate">Evidence #{idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No evidence uploaded</p>
                  )}
                </div>

                {/* Seller's Response */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3">💬 Seller's Response</p>
                  {selectedDispute.seller_response ? (
                    <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700 max-h-32 overflow-y-auto">
                      {selectedDispute.seller_response}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No response from seller</p>
                  )}
                </div>
              </div>
            </div>

            {/* Decision Form */}
            <form onSubmit={handleMakeDecision} className="p-5 space-y-4">
              {/* Decision Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Arbitration Decision *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'full_refund', label: '✅ Full Refund', desc: 'Buyer wins - full refund' },
                    { value: 'partial_refund', label: '⚖️ Partial Refund', desc: 'Partial resolution' },
                    { value: 'replacement', label: '🔄 Replacement', desc: 'Seller sends replacement' },
                    { value: 'rejected', label: '❌ Rejected', desc: 'Dispute not valid' },
                    { value: 'mutual_agreement', label: '🤝 Mutual Agreement', desc: 'Both parties agreed' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setDecision(opt.value as Decision);
                        if (opt.value === 'full_refund' || opt.value === 'partial_refund') {
                          setRefundAmount(selectedDispute.amount);
                        }
                      }}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        decision === opt.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-600">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Refund Amount */}
              {(decision === 'full_refund' || decision === 'partial_refund') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Refund Amount (KES) *
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-gray-600" />
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={e => setRefundAmount(Math.min(selectedDispute.amount, Math.max(0, parseFloat(e.target.value) || 0)))}
                      min="0"
                      max={selectedDispute.amount}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Max: KES {selectedDispute.amount.toLocaleString()} (Order amount)
                  </p>
                </div>
              )}

              {/* Reasoning */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Decision Reasoning (Admin Notes) *
                </label>
                <textarea
                  value={reasoning}
                  onChange={e => setReasoning(e.target.value)}
                  placeholder="Explain your decision based on evidence. This is shown to both parties."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{reasoning.length}/500</p>
              </div>

              {/* Important Notes */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">⚖️ Kenya Arbitration Standards</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✅ Base decision on available evidence</li>
                  <li>✅ Consider seller reputation history</li>
                  <li>✅ Apply fairness principle</li>
                  <li>✅ Be impartial and transparent</li>
                  <li>✅ Document all reasoning</li>
                </ul>
              </div>

              {/* Messages */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-semibold">{successMessage}</p>
                </div>
              )}

              {/* Decision Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isDeciding}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isDeciding ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Record Decision & Notify Parties
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="col-span-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Scale size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-semibold">Select a dispute to review</p>
            <p className="text-sm text-gray-500 mt-1">Review evidence and make an admin arbitration decision</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDisputeQueue;
