/**
 * Admin KYC Review Queue Component - KENYA ONLY
 * Displays pending Kenya seller documents for admin review and approval/rejection
 * 
 * Features:
 * - List pending Kenyan seller documents
 * - Document preview
 * - Approve/Reject with notes
 * - Filtering by document type
 * - Seller contact display
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Check,
  X,
  FileText,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Clock,
} from 'lucide-react';
import { getPendingKYCDocuments, approveKYCDocument, rejectKYCDocument, KENYA_DOCUMENT_TYPES } from '../services/kycService';

interface PendingDocument {
  id: string;
  seller_id: string;
  document_type: string;
  document_url: string;
  document_number: string;
  created_at: string;
  seller?: {
    full_name: string;
    email: string;
    phone_number: string;
  };
}

interface AdminKYCQueueProps {
  adminId: string;
}

export const AdminKYCQueue: React.FC<AdminKYCQueueProps> = ({ adminId }) => {
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [totalPending, setTotalPending] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPendingDocuments();
  }, []);

  const loadPendingDocuments = async () => {
    setIsLoading(true);
    try {
      const result = await getPendingKYCDocuments(20, 0);
      if (result.success) {
        setDocuments(result.documents);
        setTotalPending(result.total);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedDoc) return;
    setIsApproving(true);
    try {
      const result = await approveKYCDocument(selectedDoc.id, adminId, approvalNotes);
      if (result.success) {
        setSuccessMessage(`✅ Document approved for ${selectedDoc.seller?.full_name}`);
        setDocuments(docs => docs.filter(d => d.id !== selectedDoc.id));
        setSelectedDoc(null);
        setApprovalNotes('');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoc || !rejectionNotes.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setIsRejecting(true);
    try {
      const result = await rejectKYCDocument(selectedDoc.id, adminId, rejectionNotes);
      if (result.success) {
        setSuccessMessage(`❌ Document rejected for ${selectedDoc.seller?.full_name}`);
        setDocuments(docs => docs.filter(d => d.id !== selectedDoc.id));
        setSelectedDoc(null);
        setRejectionNotes('');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredDocs = filterType === 'all'
    ? documents
    : documents.filter(d => d.document_type === filterType);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText size={28} />
          Kenya KYC Seller Verification Queue
        </h2>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-orange-600 font-semibold">
            <Clock size={16} className="inline mr-1" />
            {totalPending} Pending Review (Kenya)
          </span>
          <span className="text-gray-600">
            Avg review time: &lt;2 hours
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Document List */}
        <div className="col-span-2">
          {/* Filter */}
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Kenya Documents</option>
              <option value="national_id">Kenyan National ID</option>
              <option value="kra_pin">KRA PIN Certificate</option>
              <option value="cr_certificate">CR Certificate</option>
              <option value="business_license">Business License</option>
            </select>
            <span className="text-sm text-gray-600 ml-auto">
              {filteredDocs.length} documents
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-orange-600 animate-spin" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No pending documents</p>
              <p className="text-sm">All verifications are up to date! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedDoc?.id === doc.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {doc.seller?.full_name || 'Unknown Seller'}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.document_type === 'national_id' ? 'bg-blue-100 text-blue-700' :
                          doc.document_type === 'kra_pin' ? 'bg-purple-100 text-purple-700' :
                          doc.document_type === 'cr_certificate' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {KENYA_DOCUMENT_TYPES[doc.document_type as keyof typeof KENYA_DOCUMENT_TYPES]?.label || doc.document_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{doc.seller?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Doc: {doc.document_number} • Submitted {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className={`text-gray-400 transition-transform ${
                        selectedDoc?.id === doc.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview & Actions */}
        {selectedDoc ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden sticky top-6">
            {/* Document Preview */}
            <div className="bg-gray-100 h-64 flex items-center justify-center border-b border-gray-200 overflow-hidden">
              {selectedDoc.document_url?.endsWith('.pdf') ? (
                <div className="text-center">
                  <FileText size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">PDF Document</p>
                  <a
                    href={selectedDoc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 text-sm font-semibold mt-2 hover:underline"
                  >
                    View Full PDF
                  </a>
                </div>
              ) : (
                <img
                  src={selectedDoc.document_url}
                  alt="Document preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Seller Info */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">{selectedDoc.seller?.full_name}</h3>
              <p className="text-xs text-orange-600 font-semibold mb-3">📍 Kenya Seller</p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Email:</span>
                  <a href={`mailto:${selectedDoc.seller?.email}`} className="text-orange-600 ml-1">
                    {selectedDoc.seller?.email}
                  </a>
                </p>
                <p>
                  <span className="text-gray-600">Phone:</span>
                  <a href={`tel:${selectedDoc.seller?.phone_number}`} className="text-orange-600 ml-1">
                    {selectedDoc.seller?.phone_number}
                  </a>
                </p>
                <p>
                  <span className="text-gray-600">Document:</span>
                  <span className="ml-1 font-semibold">{selectedDoc.document_number}</span>
                </p>
              </div>
            </div>

            {/* Action Section */}
            <div className="p-4 space-y-4">
              {/* Approval Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={e => setApprovalNotes(e.target.value)}
                  placeholder="e.g., Document clearly shows valid ID..."
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>

              {/* Rejection Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={e => setRejectionNotes(e.target.value)}
                  placeholder="e.g., Document is blurry, please re-upload..."
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded transition"
                >
                  {isApproving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionNotes.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded transition"
                >
                  {isRejecting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      Reject
                    </>
                  )}
                </button>
              </div>

              {/* Clear Button */}
              <button
                onClick={() => setSelectedDoc(null)}
                className="w-full py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <Eye size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-semibold">Select a document to review</p>
            <p className="text-sm text-gray-500 mt-1">Click any document on the left</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKYCQueue;
