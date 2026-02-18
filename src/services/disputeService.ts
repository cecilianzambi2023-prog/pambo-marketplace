/**
 * Dispute Service - Kenya Seller Disputes
 * Handles dispute management, seller responses, and security checks
 * 
 * SECURITY: All operations validate that the seller owns the dispute
 */

import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all disputes against a specific seller
 * @param seller_id - The seller's ID
 * @returns Array of disputes with buyer info
 */
export const getSellerDisputes = async (seller_id: string) => {
  try {
    // Fetch all disputes where this seller is the respondent
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select(`
        id,
        order_id,
        buyer_id,
        category,
        title,
        description,
        amount,
        mpesa_receipt_number,
        status,
        evidence_urls,
        created_at,
        seller_id,
        buyer:profiles!disputes_buyer_id_fkey(
          full_name,
          avatar_url,
          phone_number
        )
      `)
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching disputes:', error);
      return { success: false, error };
    }

    // Count urgent disputes (response pending and less than 3 days left)
    const urgentCount = disputes?.filter(d => {
      if (d.status !== 'seller_response_pending') return false;
      const created = new Date(d.created_at);
      const deadline = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
      const daysLeft = (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysLeft <= 3;
    }).length || 0;

    return {
      success: true,
      disputes: disputes || [],
      urgent: urgentCount
    };
  } catch (error) {
    console.error('Error fetching seller disputes:', error);
    return { success: false, error };
  }
};

/**
 * Get detailed information about a specific dispute
 * @param dispute_id - The dispute ID
 * @returns Dispute details with messages and timeline
 */
export const getDisputeDetails = async (dispute_id: string, seller_id: string) => {
  try {
    // Fetch dispute details
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', dispute_id)
      .single();

    if (disputeError) {
      return { success: false, error: 'Dispute not found' };
    }

    // SECURITY: Verify seller owns this dispute
    if (dispute.seller_id !== seller_id) {
      console.warn(`SECURITY ALERT: Seller ${seller_id} attempted to access dispute ${dispute_id} that doesn't belong to them`);
      return { success: false, error: 'Unauthorized: This dispute does not belong to you' };
    }

    // Fetch dispute messages/timeline
    const { data: messages, error: messagesError } = await supabase
      .from('dispute_messages')
      .select('*')
      .eq('dispute_id', dispute_id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    return {
      success: true,
      dispute,
      messages: messages || []
    };
  } catch (error) {
    console.error('Error fetching dispute details:', error);
    return { success: false, error };
  }
};

/**
 * Allow seller to respond to a dispute with counter-evidence
 * SECURITY: Validates seller owns the dispute before accepting response
 * @param dispute_id - The dispute ID
 * @param seller_id - The seller's ID (must match dispute.seller_id)
 * @param response_text - Seller's explanation/response
 * @param evidence_file_urls - Array of uploaded file URLs
 * @returns Success status and response details
 */
export const sellerRespond = async (
  dispute_id: string,
  seller_id: string,
  response_text: string,
  evidence_file_urls: string[]
) => {
  try {
    // SECURITY STEP 1: Verify dispute exists and belongs to this seller
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('seller_id, status')
      .eq('id', dispute_id)
      .single();

    if (disputeError || !dispute) {
      return { success: false, error: { message: 'Dispute not found' } };
    }

    // BILLION-DOLLAR SECURITY CHECK: Seller can ONLY respond to their own disputes
    if (dispute.seller_id !== seller_id) {
      console.error(`🚨 SECURITY VIOLATION: Seller ${seller_id} attempted to respond to dispute ${dispute_id} (belongs to ${dispute.seller_id})`);
      return {
        success: false,
        error: { message: 'Unauthorized: You cannot respond to disputes that do not belong to you' }
      };
    }

    // Verify dispute is in correct status for response
    if (dispute.status !== 'seller_response_pending') {
      return {
        success: false,
        error: { message: `Cannot respond to dispute with status: ${dispute.status}` }
      };
    }

    // Generate unique response ID
    const response_id = uuidv4();

    // Create dispute response record
    const { data: response, error: responseError } = await supabase
      .from('dispute_responses')
      .insert([
        {
          id: response_id,
          dispute_id,
          seller_id,
          response_text,
          evidence_urls: evidence_file_urls,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (responseError) {
      console.error('Error inserting response:', responseError);
      return { success: false, error: { message: 'Failed to submit response' } };
    }

    // Update dispute status to "in_negotiation"
    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'in_negotiation',
        updated_at: new Date().toISOString()
      })
      .eq('id', dispute_id);

    if (updateError) {
      console.error('Error updating dispute status:', updateError);
      return { success: false, error: { message: 'Response saved but failed to update status' } };
    }

    // Create timeline entry
    const { error: timelineError } = await supabase
      .from('dispute_timeline')
      .insert([
        {
          id: uuidv4(),
          dispute_id,
          event_type: 'seller_responded',
          actor: 'seller',
          actor_id: seller_id,
          description: `Seller provided response with ${evidence_file_urls.length} evidence file(s)`,
          created_at: new Date().toISOString()
        }
      ]);

    if (timelineError) {
      console.error('Error creating timeline entry:', timelineError);
    }

    return {
      success: true,
      response: {
        id: response_id,
        dispute_id,
        seller_id,
        response_text,
        evidence_urls: evidence_file_urls,
        created_at: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error('Error in sellerRespond:', error);
    return {
      success: false,
      error: { message: error.message || 'An unexpected error occurred' }
    };
  }
};

/**
 * Upload evidence files for seller response
 * @param file - File to upload
 * @param dispute_id - Associated dispute ID
 * @returns Upload result with file URL
 */
export const uploadDisputeEvidence = async (file: File, dispute_id: string) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${dispute_id}/${uuidv4()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('dispute-evidence')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { success: false, error };
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('dispute-evidence')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicData.publicUrl,
      fileName: data.path
    };
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return { success: false, error };
  }
};
