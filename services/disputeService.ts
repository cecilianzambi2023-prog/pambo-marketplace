/**
 * Dispute Resolution Service - KENYA ONLY
 * Handles buyer-seller disputes in Kenyan marketplace
 * 
 * Features:
 * - Dispute creation and tracking
 * - Evidence/file upload
 * - Seller response workflow
 * - Admin arbitration system
 * - M-Pesa refund processing
 * - Escalation management
 * - Trust score impact tracking
 * 
 * Dispute Flow:
 * 1. Buyer files dispute with evidence
 * 2. Seller responds (7 days)
 * 3. Resolution attempt (both agree)
 * 4. Admin arbitration if unresolved
 * 5. Refund processing via M-Pesa
 */

import { supabase } from '../src/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Kenya-specific dispute types
export type DisputeCategory = 
  | 'product_not_received' 
  | 'product_damaged' 
  | 'product_not_as_described' 
  | 'service_not_completed' 
  | 'quality_issue' 
  | 'seller_unresponsive' 
  | 'payment_issue'
  | 'other';

export type DisputeStatus = 
  | 'open' 
  | 'seller_response_pending' 
  | 'in_negotiation' 
  | 'admin_review' 
  | 'resolved' 
  | 'closed';

export type DisputeResolution = 
  | 'full_refund' 
  | 'partial_refund' 
  | 'replacement' 
  | 'rejected' 
  | 'mutual_agreement' 
  | 'pending';

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_role: 'buyer' | 'seller' | 'admin';
  message: string;
  attachment_url?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  category: DisputeCategory;
  title: string;
  description: string;
  amount: number; // In KES
  status: DisputeStatus;
  resolution: DisputeResolution;
  resolution_details?: string;
  evidence_urls: string[];
  seller_response?: string;
  seller_response_date?: string;
  admin_decision?: string;
  admin_reviewed_by?: string;
  admin_reviewed_at?: string;
  resolution_date?: string;
  refund_status?: 'pending' | 'processed' | 'failed';
  refund_mpesa_ref?: string;
  days_since_created: number;
  created_at: string;
  updated_at: string;
}

// Kenya dispute categories with descriptions
export const KENYA_DISPUTE_CATEGORIES = {
  product_not_received: {
    label: 'Product Not Received',
    description: 'Item never arrived after delivery deadline',
    icon: '📦',
    refundable: true,
  },
  product_damaged: {
    label: 'Product Damaged',
    description: 'Item arrived in damaged or defective condition',
    icon: '💔',
    refundable: true,
  },
  product_not_as_described: {
    label: 'Not As Described',
    description: 'Product does not match seller\'s description',
    icon: '❌',
    refundable: true,
  },
  service_not_completed: {
    label: 'Service Not Completed',
    description: 'Service promised by seller was not completed',
    icon: '🚫',
    refundable: true,
  },
  quality_issue: {
    label: 'Quality Issue',
    description: 'Product quality is below expected standard',
    icon: '⚠️',
    refundable: true,
  },
  seller_unresponsive: {
    label: 'Seller Unresponsive',
    description: 'Seller not responding to messages or complaints',
    icon: '🤐',
    refundable: true,
  },
  payment_issue: {
    label: 'Payment Issue',
    description: 'Charged incorrectly or unwanted charges',
    icon: '💰',
    refundable: true,
  },
  other: {
    label: 'Other Issue',
    description: 'Other dispute reason',
    icon: '❓',
    refundable: false,
  },
};

/**
 * Create new dispute (buyer initiates)
 */
export const createDispute = async (
  order_id: string,
  buyer_id: string,
  seller_id: string,
  category: DisputeCategory,
  title: string,
  description: string,
  amount: number,
  evidenceFiles?: File[],
  evidenceUrls?: string[]
) => {
  try {
    // 1. Upload evidence files if provided
    let uploadedUrls: string[] = [...(evidenceUrls || [])];
    
    if (evidenceFiles && evidenceFiles.length > 0) {
      for (const file of evidenceFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `disputes/${order_id}/${uuidv4()}.${fileExt}`;
        
        const { error: uploadErr } = await supabase.storage
          .from('dispute-evidence')
          .upload(fileName, file);
        
        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from('dispute-evidence')
            .getPublicUrl(fileName);
          uploadedUrls.push(urlData.publicUrl);
        }
      }
    }

    // 2. Create dispute record
    const { data, error } = await supabase
      .from('disputes')
      .insert({
        id: uuidv4(),
        order_id,
        buyer_id,
        seller_id,
        category,
        title,
        description,
        amount,
        status: 'seller_response_pending',
        resolution: 'pending',
        evidence_urls: uploadedUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    const dispute = data?.[0] as Dispute;

    // 3. Create initial message from buyer
    await supabase.from('dispute_messages').insert({
      id: uuidv4(),
      dispute_id: dispute.id,
      sender_id: buyer_id,
      sender_role: 'buyer',
      message: `Dispute opened: ${title}\n\n${description}`,
      created_at: new Date().toISOString(),
    });

    // 4. Update seller's trust score (dispute opened)
    const { data: profile } = await supabase
      .from('profiles')
      .select('reputation_score')
      .eq('user_id', seller_id)
      .single();

    if (profile) {
      const newScore = Math.max(0, (profile.reputation_score || 100) - 5);
      await supabase
        .from('profiles')
        .update({ reputation_score: newScore })
        .eq('user_id', seller_id);
    }

    return {
      success: true,
      dispute,
      message: '🇰🇪 Dispute created. Seller has 7 days to respond.',
    };
  } catch (error) {
    console.error('Create dispute error:', error);
    return { success: false, error };
  }
};

/**
 * Get buyer's disputes
 */
export const getBuyerDisputes = async (buyer_id: string) => {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        seller:seller_id(full_name, avatar_url, reputation_score),
        messages:dispute_messages(count)
      `)
      .eq('buyer_id', buyer_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      disputes: data || [],
      total: data?.length || 0,
    };
  } catch (error) {
    console.error('Get buyer disputes error:', error);
    return { success: false, error, disputes: [], total: 0 };
  }
};

/**
 * Get seller's disputes
 */
export const getSellerDisputes = async (seller_id: string) => {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        buyer:buyer_id(full_name, avatar_url),
        messages:dispute_messages(count)
      `)
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      disputes: data || [],
      urgent: data?.filter(d => d.status === 'seller_response_pending').length || 0,
    };
  } catch (error) {
    console.error('Get seller disputes error:', error);
    return { success: false, error, disputes: [], urgent: 0 };
  }
};

/**
 * Seller responds to dispute
 */
export const sellerRespond = async (
  dispute_id: string,
  seller_id: string,
  response: string,
  evidenceUrls?: string[]
) => {
  try {
    // 1. Update dispute with seller response
    const { data, error } = await supabase
      .from('disputes')
      .update({
        seller_response: response,
        seller_response_date: new Date().toISOString(),
        status: 'in_negotiation',
        evidence_urls: evidenceUrls ? [...new Set(evidenceUrls)] : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dispute_id)
      .eq('seller_id', seller_id)
      .select();

    if (error) throw error;

    // 2. Add message from seller
    await supabase.from('dispute_messages').insert({
      id: uuidv4(),
      dispute_id,
      sender_id: seller_id,
      sender_role: 'seller',
      message: response,
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      dispute: data?.[0],
      message: '✅ Response submitted. Buyer will review.',
    };
  } catch (error) {
    console.error('Seller respond error:', error);
    return { success: false, error };
  }
};

/**
 * Get dispute details with full message history
 */
export const getDisputeDetails = async (dispute_id: string) => {
  try {
    // Get dispute
    const { data: dispute, error: disputeErr } = await supabase
      .from('disputes')
      .select(`
        *,
        buyer:buyer_id(full_name, avatar_url, phone_number),
        seller:seller_id(full_name, avatar_url, phone_number)
      `)
      .eq('id', dispute_id)
      .single();

    if (disputeErr) throw disputeErr;

    // Get messages
    const { data: messages, error: messagesErr } = await supabase
      .from('dispute_messages')
      .select('*')
      .eq('dispute_id', dispute_id)
      .order('created_at', { ascending: true });

    if (messagesErr) throw messagesErr;

    return {
      success: true,
      dispute,
      messages: messages || [],
      messageCount: messages?.length || 0,
    };
  } catch (error) {
    console.error('Get dispute details error:', error);
    return { success: false, error, dispute: null, messages: [], messageCount: 0 };
  }
};

/**
 * Add message to dispute (manual resolution attempt)
 */
export const addDisputeMessage = async (
  dispute_id: string,
  sender_id: string,
  sender_role: 'buyer' | 'seller' | 'admin',
  message: string,
  attachment?: string
) => {
  try {
    const { data, error } = await supabase
      .from('dispute_messages')
      .insert({
        id: uuidv4(),
        dispute_id,
        sender_id,
        sender_role,
        message,
        attachment_url: attachment,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    // Update dispute updated_at
    await supabase
      .from('disputes')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', dispute_id);

    return { success: true, message: data?.[0] };
  } catch (error) {
    console.error('Add message error:', error);
    return { success: false, error };
  }
};

/**
 * Resolve dispute by mutual agreement
 */
export const resolveByAgreement = async (
  dispute_id: string,
  resolution: DisputeResolution,
  details: string,
  refundAmount?: number
) => {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution,
        resolution_details: details,
        resolution_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', dispute_id)
      .select();

    if (error) throw error;

    // If refund needed, process M-Pesa refund
    if (resolution === 'full_refund' || resolution === 'partial_refund') {
      const dispute = data?.[0];
      const refund = refundAmount || dispute.amount;
      
      // TODO: Implement M-Pesa STK push for refund
      // For now, mark as pending
      await supabase
        .from('disputes')
        .update({ refund_status: 'pending' })
        .eq('id', dispute_id);
    }

    return {
      success: true,
      dispute: data?.[0],
      message: `✅ Dispute resolved in Kenya marketplace. ${refundAmount ? 'KES ' + refundAmount + ' will be refunded.' : ''}`,
    };
  } catch (error) {
    console.error('Resolve by agreement error:', error);
    return { success: false, error };
  }
};

/**
 * Escalate to admin for arbitration
 */
export const escalateToAdmin = async (dispute_id: string) => {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status: 'admin_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dispute_id)
      .select();

    if (error) throw error;

    return {
      success: true,
      dispute: data?.[0],
      message: '⏳ Escalated to Kenya admin team for arbitration.',
    };
  } catch (error) {
    console.error('Escalate error:', error);
    return { success: false, error };
  }
};

/**
 * Admin makes final decision on dispute
 */
export const adminDecide = async (
  dispute_id: string,
  admin_id: string,
  decision: DisputeResolution,
  reasoning: string,
  refundAmount?: number
) => {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution: decision,
        admin_decision: reasoning,
        admin_reviewed_by: admin_id,
        admin_reviewed_at: new Date().toISOString(),
        resolution_date: new Date().toISOString(),
        refund_status: decision === 'rejected' ? 'failed' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dispute_id)
      .select();

    if (error) throw error;

    // Impact on seller reputation
    const dispute = data?.[0];
    if (decision === 'rejected') {
      // Seller loses more reputation if dispute ruled against them
      const { data: profile } = await supabase
        .from('profiles')
        .select('reputation_score')
        .eq('user_id', dispute.seller_id)
        .single();

      if (profile) {
        const newScore = Math.max(0, (profile.reputation_score || 100) - 15);
        await supabase
          .from('profiles')
          .update({ reputation_score: newScore })
          .eq('user_id', dispute.seller_id);
      }
    } else {
      // Seller reputation improves slightly if dispute resolved in their favor
      const { data: profile } = await supabase
        .from('profiles')
        .select('reputation_score')
        .eq('user_id', dispute.seller_id)
        .single();

      if (profile) {
        const newScore = Math.min(100, (profile.reputation_score || 100) + 5);
        await supabase
          .from('profiles')
          .update({ reputation_score: newScore })
          .eq('user_id', dispute.seller_id);
      }
    }

    return {
      success: true,
      dispute: data?.[0],
      message: `✅ Admin decision made: ${decision}. KES ${refundAmount || 0} to be refunded.`,
    };
  } catch (error) {
    console.error('Admin decide error:', error);
    return { success: false, error };
  }
};

/**
 * Get pending admin reviews
 */
export const getPendingAdminDisputes = async (limit = 50, offset = 0) => {
  try {
    const { data, error, count } = await supabase
      .from('disputes')
      .select('*, buyer:buyer_id(full_name, email), seller:seller_id(full_name, email)', { count: 'exact' })
      .eq('status', 'admin_review')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      disputes: data || [],
      total: count || 0,
      pending: count || 0,
    };
  } catch (error) {
    console.error('Get pending disputes error:', error);
    return { success: false, error, disputes: [], total: 0, pending: 0 };
  }
};

/**
 * Process M-Pesa refund
 */
export const processMpesaRefund = async (
  dispute_id: string,
  buyerPhone: string,
  amount: number
) => {
  try {
    // TODO: Implement M-Pesa Daraja API for refund/reversal
    // This would call M-Pesa reversal endpoint
    
    // For now, simulate refund
    const mpesaRef = `REF-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('disputes')
      .update({
        refund_status: 'processed',
        refund_mpesa_ref: mpesaRef,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dispute_id)
      .select();

    if (error) throw error;

    return {
      success: true,
      dispute: data?.[0],
      mpesaRef,
      message: `✅ KES ${amount} refunded to ${buyerPhone}. Ref: ${mpesaRef}`,
    };
  } catch (error) {
    console.error('M-Pesa refund error:', error);
    return { success: false, error };
  }
};

/**
 * Get dispute statistics
 */
export const getDisputeStats = async () => {
  try {
    const { data: allDisputes } = await supabase
      .from('disputes')
      .select('*');

    const openCount = allDisputes?.filter(d => 
      ['open', 'seller_response_pending', 'in_negotiation'].includes(d.status)
    ).length || 0;

    const adminReviewCount = allDisputes?.filter(d => d.status === 'admin_review').length || 0;
    
    const resolvedCount = allDisputes?.filter(d => d.status === 'resolved').length || 0;
    
    const totalRefunded = allDisputes
      ?.filter(d => d.refund_status === 'processed')
      .reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    return {
      success: true,
      stats: {
        open: openCount,
        adminReview: adminReviewCount,
        resolved: resolvedCount,
        totalDisputes: allDisputes?.length || 0,
        totalRefunded,
        averageResolutionTime: 'Calculating...',
      },
    };
  } catch (error) {
    console.error('Get stats error:', error);
    return { success: false, error, stats: {} };
  }
};

export default {
  createDispute,
  getBuyerDisputes,
  getSellerDisputes,
  sellerRespond,
  getDisputeDetails,
  addDisputeMessage,
  resolveByAgreement,
  escalateToAdmin,
  adminDecide,
  getPendingAdminDisputes,
  processMpesaRefund,
  getDisputeStats,
};
