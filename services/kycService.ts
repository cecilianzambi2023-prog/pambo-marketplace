/**
 * KYC (Know Your Customer) Service - KENYA ONLY
 * Handles seller identity verification for Kenyan marketplace
 * 
 * Features:
 * - Kenyan National ID verification (Primary)
 * - KRA Tax Compliance Verification (Optional)
 * - Business Registration Verification (Optional)
 * - Document upload to Supabase storage
 * - Admin approval/rejection workflow
 * - Automatic badge assignment on approval
 * - Trust score calculation
 * 
 * Compliance: CBK (Central Bank of Kenya) KYC standards
 */

import { supabase } from '../src/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Kenya-specific document types
export type DocumentType = 'national_id' | 'kra_pin' | 'cr_certificate' | 'business_license';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

// Kenya-specific document type labels and descriptions
export const KENYA_DOCUMENT_TYPES = {
  national_id: {
    label: 'Kenyan National ID',
    description: 'Government-issued Kenyan National Identity Card (required)',
    hint: 'Upload clear photo of front and back of your ID',
    icon: '🆔',
    isRequired: true,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  kra_pin: {
    label: 'KRA PIN Certificate',
    description: 'Kenya Revenue Authority Personal Identification Number (optional)',
    hint: 'Proof of tax registration from KRA',
    icon: '📋',
    isRequired: false,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  cr_certificate: {
    label: 'CR Certificate',
    description: 'Business Certificate of Registration - Kenya Corporate Registry (for businesses)',
    hint: 'Official registration from Corporate Affairs & Public Counsel Services',
    icon: '🏢',
    isRequired: false,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  business_license: {
    label: 'Business License',
    description: 'County Government Business License (if applicable)',
    hint: 'From your local County or municipal authority',
    icon: '📜',
    isRequired: false,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
};

export interface KYCDocument {
  id: string;
  seller_id: string;
  document_type: DocumentType;
  document_url: string;
  document_number: string;
  issued_date: string;
  expiry_date?: string;
  status: VerificationStatus;
  admin_review_notes?: string;
  reviewed_by_admin?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerKYCStatus {
  seller_id: string;
  verified: boolean;
  verified_documents_count: number;
  documents: KYCDocument[];
  pending_review_count: number;
  primary_document?: KYCDocument;
  trust_score: number;
  verification_expiry?: string;
}

/**
 * Upload document to Supabase storage and create record
 */
export const uploadKYCDocument = async (
  seller_id: string,
  file: File,
  documentType: DocumentType,
  documentNumber: string,
  issuedDate: string,
  expiryDate?: string
) => {
  try {
    // 1. Upload file to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${seller_id}/${documentType}/${uuidv4()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError };
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName);

    // 3. Create database record
    const { data, error } = await supabase
      .from('seller_verification_documents')
      .insert({
        seller_id,
        document_type: documentType,
        document_url: urlData.publicUrl,
        document_number: documentNumber,
        issued_date: issuedDate,
        expiry_date: expiryDate || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return { success: false, error };
    }

    return {
      success: true,
      document: data?.[0] as KYCDocument,
      message: 'Document uploaded successfully. Kenya admin team will review within 24-48 hours.',
    };
  } catch (error) {
    console.error('KYC upload error:', error);
    return { success: false, error };
  }
};

/**
 * Get seller's KYC status
 */
export const getSellerKYCStatus = async (seller_id: string): Promise<SellerKYCStatus | null> => {
  try {
    const { data: documents, error } = await supabase
      .from('seller_verification_documents')
      .select('*')
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const approvedDocs = documents?.filter(d => d.status === 'approved') || [];
    const pendingDocs = documents?.filter(d => d.status === 'pending') || [];
    
    // Trust score calculation (Kenya-focused)
    let trustScore = 0;
    if (approvedDocs.some(d => d.document_type === 'national_id')) trustScore += 40; // Verified Kenyan identity
    if (approvedDocs.some(d => d.document_type === 'kra_pin')) trustScore += 20; // KRA registered
    if (approvedDocs.some(d => d.document_type === 'cr_certificate')) trustScore += 20; // Registered business
    if (approvedDocs.some(d => d.document_type === 'business_license')) trustScore += 10; // County licensed
    
    return {
      seller_id,
      verified: approvedDocs.length > 0,
      verified_documents_count: approvedDocs.length,
      documents: documents || [],
      pending_review_count: pendingDocs.length,
      primary_document: approvedDocs[0],
      trust_score: Math.min(trustScore, 100),
      verification_expiry: approvedDocs[0]?.expiry_date,
    };
  } catch (error) {
    console.error('Get KYC status error:', error);
    return null;
  }
};

/**
 * Get pending documents for admin review
 */
export const getPendingKYCDocuments = async (limit: number = 50, offset: number = 0) => {
  try {
    const { data, error, count } = await supabase
      .from('seller_verification_documents')
      .select('*, seller:seller_id(full_name, email, phone_number)', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      documents: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('Get pending documents error:', error);
    return { success: false, error, documents: [], total: 0 };
  }
};

/**
 * Approve KYC document (admin only)
 */
export const approveKYCDocument = async (
  document_id: string,
  reviewed_by_admin: string,
  adminNotes?: string
) => {
  try {
    // 1. Update document status
    const { data: docData, error: docError } = await supabase
      .from('seller_verification_documents')
      .update({
        status: 'approved',
        reviewed_by_admin,
        reviewed_at: new Date().toISOString(),
        admin_review_notes: adminNotes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', document_id)
      .select();

    if (docError) throw docError;

    const document = docData?.[0];

    // 2. Update seller's verification status if first approval
    const kycStatus = await getSellerKYCStatus(document.seller_id);
    if (kycStatus && !kycStatus.verified) {
      const { error: sellerError } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', document.seller_id);

      if (sellerError) console.error('Seller update error:', sellerError);
    }

    // 3. Send notification to seller (optional - can add email service)
    console.log(`Document ${document_id} approved for seller ${document.seller_id}`);

    return {
      success: true,
      document,
      message: 'Document approved! Kenyan seller verified and will be notified.',
    };
  } catch (error) {
    console.error('Approve document error:', error);
    return { success: false, error };
  }
};

/**
 * Reject KYC document (admin only)
 */
export const rejectKYCDocument = async (
  document_id: string,
  reviewed_by_admin: string,
  rejectionReason: string
) => {
  try {
    const { data, error } = await supabase
      .from('seller_verification_documents')
      .update({
        status: 'rejected',
        reviewed_by_admin,
        reviewed_at: new Date().toISOString(),
        admin_review_notes: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', document_id)
      .select();

    if (error) throw error;

    return {
      success: true,
      document: data?.[0],
      message: 'Document rejected. Seller can re-upload with correct Kenya documentation.',
    };
  } catch (error) {
    console.error('Reject document error:', error);
    return { success: false, error };
  }
};

/**
 * Get seller verification badge info
 */
export const getVerificationBadge = async (seller_id: string) => {
  try {
    const kycStatus = await getSellerKYCStatus(seller_id);
    
    if (!kycStatus?.verified) {
      return { verified: false, badge: null, trustScore: 0 };
    }

    // Determine badge based on subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, is_verified')
      .eq('user_id', seller_id)
      .single();

    const badges = {
      'mkulima': { emoji: '🥉', name: 'Bronze', color: '#CD7F32' },
      'starter': { emoji: '🥈', name: 'Silver', color: '#C0C0C0' },
      'pro': { emoji: '🥇', name: 'Gold', color: '#FFD700' },
      'enterprise': { emoji: '💎', name: 'Platinum', color: '#E5E4E2' },
    };

    const badge = badges[profile?.subscription_tier as keyof typeof badges] || badges['starter'];

    return {
      verified: true,
      badge: {
        ...badge,
        tier: profile?.subscription_tier,
      },
      trustScore: kycStatus.trust_score,
      documentsCount: kycStatus.verified_documents_count,
    };
  } catch (error) {
    console.error('Get verification badge error:', error);
    return { verified: false, badge: null, trustScore: 0 };
  }
};

/**
 * Calculate seller trust score for display
 */
export const calculateTrustScore = async (seller_id: string): Promise<number> => {
  try {
    const kycStatus = await getSellerKYCStatus(seller_id);
    if (!kycStatus) return 0;

    let score = kycStatus.trust_score;

    // Add points for profile completion
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_number, avatar_url, bio')
      .eq('user_id', seller_id)
      .single();

    if (profile?.full_name) score += 5;
    if (profile?.phone_number) score += 5;
    if (profile?.avatar_url) score += 5;
    if (profile?.bio) score += 5;

    // Get rating data
    const { data: ratings } = await supabase
      .from('reviews')
      .select('rating')
      .eq('seller_id', seller_id)
      .eq('status', 'approved');

    if (ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      score += avgRating * 5; // Up to 25 points for 5-star avg
    }

    return Math.min(score, 100);
  } catch (error) {
    console.error('Calculate trust score error:', error);
    return 0;
  }
};

/**
 * Check if seller can create listings (must be verified)
 */
export const canCreateListing = async (seller_id: string): Promise<boolean> => {
  try {
    const kycStatus = await getSellerKYCStatus(seller_id);
    return kycStatus?.verified || false;
  } catch (error) {
    console.error('Can create listing check error:', error);
    return false;
  }
};

export default {
  uploadKYCDocument,
  getSellerKYCStatus,
  getPendingKYCDocuments,
  approveKYCDocument,
  rejectKYCDocument,
  getVerificationBadge,
  calculateTrustScore,
  canCreateListing,
};
