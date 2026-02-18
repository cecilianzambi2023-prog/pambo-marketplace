/**
 * Seller KYC Form Component - KENYA ONLY
 * Allows Kenyan sellers to upload identity & business verification documents
 * 
 * Features:
 * - Kenyan National ID verification
 * - KRA PIN & Business License upload
 * - File upload with validation
 * - Document type selector
 * - Status tracking
 * - Admin approval feedback
 */

import React, { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, FileText, Loader2, X, CheckCircle, Clock } from 'lucide-react';
import { uploadKYCDocument, getSellerKYCStatus, SellerKYCStatus, KENYA_DOCUMENT_TYPES } from '../services/kycService';

interface SellerKYCFormProps {
  seller_id: string;
  onClose?: () => void;
  onSubmitSuccess?: () => void;
}

type DocumentType = 'national_id' | 'kra_pin' | 'cr_certificate' | 'business_license';

const DOCUMENT_TYPES = KENYA_DOCUMENT_TYPES;

export const SellerKYCForm: React.FC<SellerKYCFormProps> = ({ seller_id, onClose, onSubmitSuccess }) => {
  // Form state
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('national_id');
  const [file, setFile] = useState<File | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<SellerKYCStatus | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load KYC status on mount
  useEffect(() => {
    loadKYCStatus();
  }, [seller_id]);

  const loadKYCStatus = async () => {
    const status = await getSellerKYCStatus(seller_id);
    setKycStatus(status);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
      setErrorMessage('Only JPG, PNG, or PDF files allowed');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5 MB');
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Validation
      if (!file) {
        throw new Error('Please select a file to upload');
      }
      if (!documentNumber.trim()) {
        throw new Error('Please enter document number');
      }
      if (!issuedDate) {
        throw new Error('Please select issued date');
      }

      // Simulate progress
      setUploadProgress(30);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(60);

      // Upload
      const result = await uploadKYCDocument(
        seller_id,
        file,
        selectedDocType,
        documentNumber,
        issuedDate,
        expiryDate || undefined
      );

      setUploadProgress(100);

      if (result.success) {
        setSuccessMessage(result.message);
        setFile(null);
        setPreview(null);
        setDocumentNumber('');
        setIssuedDate('');
        setExpiryDate('');

        // Reload status
        await loadKYCStatus();

        // Auto close after 2 seconds
        setTimeout(() => {
          onSubmitSuccess?.();
        }, 2000);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🛡️ Kenya Seller Verification
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Verify your identity as a Kenyan seller. Upload documents to build trust with buyers. Verified sellers get a trust badge ✅
        </p>
      </div>

      {/* Status Summary */}
      {kycStatus && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-blue-900">Your Kenya Verification Status</p>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-blue-700">{kycStatus.verified_documents_count}</span>
                  <p className="text-blue-600">Approved Doc</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-700">{kycStatus.pending_review_count}</span>
                  <p className="text-blue-600">Under Review</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-700">{kycStatus.trust_score}%</span>
                  <p className="text-blue-600">Trust Score</p>
                </div>
              </div>
            </div>
            {kycStatus.verified && (
              <div className="text-right">
                <CheckCircle size={32} className="text-green-500" />
                <p className="text-green-700 font-semibold text-sm mt-1">Verified Kenya</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing Documents */}
      {kycStatus?.documents && kycStatus.documents.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Your Documents</h3>
          <div className="space-y-2">
            {kycStatus.documents.map(doc => (
              <div
                key={doc.id}
                className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                  doc.status === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : doc.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {doc.status === 'approved' && <Check size={20} className="text-green-600" />}
                  {doc.status === 'pending' && <Clock size={20} className="text-yellow-600" />}
                  {doc.status === 'rejected' && <AlertCircle size={20} className="text-red-600" />}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {DOCUMENT_TYPES[doc.document_type]?.label || doc.document_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {doc.status === 'approved' && '✅ Approved'}
                      {doc.status === 'pending' && '⏳ Pending Review'}
                      {doc.status === 'rejected' && `❌ Rejected: ${doc.admin_review_notes}`}
                      {doc.status === 'expired' && '⚠️ Expired - Please re-upload'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Document Type Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Document Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(DOCUMENT_TYPES).map(([type, info]) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedDocType(type as DocumentType)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedDocType === type
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-xl mb-1">{info.icon}</p>
                <p className="font-semibold text-sm text-gray-900">{info.label}</p>
                {info.isRequired && (
                  <p className="text-xs text-red-600 font-semibold">Required</p>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {DOCUMENT_TYPES[selectedDocType]?.description}
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Upload Document *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition cursor-pointer">
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              {preview ? (
                <div className="text-center">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto mb-2 rounded" />
                  <p className="text-sm text-gray-600">{file?.name}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG or PDF (max 5 MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {selectedDocType === 'national_id' ? 'Kenya ID Number *' : 'Document Number *'}
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={e => setDocumentNumber(e.target.value)}
              placeholder={selectedDocType === 'national_id' ? 'e.g., 12345678-0001-01' : 'e.g., 12345678'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Issued Date *
            </label>
            <input
              type="date"
              value={issuedDate}
              onChange={e => setIssuedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Expiry Date (optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Expiry Date (if applicable)
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Upload Failed</p>
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Upload Successful</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !file}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Document
              </>
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Close
            </button>
          )}
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>⏱️ What happens next?</strong> Our admin team reviews uploaded documents within 24-48 hours.
          Once approved, you'll get a trust badge on your profile and get more visibility! 🚀
        </p>
      </div>
    </div>
  );
};

export default SellerKYCForm;
