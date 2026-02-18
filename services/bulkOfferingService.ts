/**
 * BULK OFFERING SERVICE FUNCTIONS
 * Location: services/bulkOfferingService.ts
 * Purpose: CRUD operations and queries for Bulk Offerings feature
 * 
 * Functions:
 * 1. fetchBulkOfferings() - Get all active offerings
 * 2. fetchBulkOfferingById() - Get single offering details
 * 3. createBulkOffering() - Seller posts new offering
 * 4. updateBulkOffering() - Seller updates offering
 * 5. deleteBulkOffering() - Seller deletes offering
 * 6. searchBulkOfferings() - Search and filter offerings
 * 7. respondToBulkOffering() - Buyer submits inquiry
 * 8. getSellerBulkOfferings() - Seller view of their offerings
 * 9. getBulkOfferingAnalytics() - Analytics data for seller
 * 10. getBulkOfferingInquiries() - Seller view inquiry list
 */

import { supabase } from '../src/lib/supabaseClient';
import type { BulkOffering, BulkInquiry } from '../types';

// ==========================================
// 1. FETCH ALL ACTIVE BULK OFFERINGS
// ==========================================
export const fetchBulkOfferings = async (
  hub?: string,
  category?: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ data: BulkOffering[]; count: number; error: string | null }> => {
  try {
    let query = supabase
      .from('bulk_offerings')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('posted_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (hub) {
      query = query.eq('hub', hub);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as BulkOffering[],
      count: count || 0,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bulk offerings';
    console.error('Error fetching bulk offerings:', errorMessage);
    return { data: [], count: 0, error: errorMessage };
  }
};

// ==========================================
// 2. FETCH SINGLE BULK OFFERING BY ID
// ==========================================
export const fetchBulkOfferingById = async (
  offeringId: string
): Promise<{ data: BulkOffering | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('bulk_offerings')
      .select('*')
      .eq('id', offeringId)
      .single();

    if (error) throw error;

    return {
      data: data as BulkOffering,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch offering';
    console.error('Error fetching offering:', errorMessage);
    return { data: null, error: errorMessage };
  }
};

// ==========================================
// 3. CREATE NEW BULK OFFERING (Seller)
// ==========================================
export const createBulkOffering = async (
  offering: Omit<BulkOffering, 'id' | 'postedDate' | 'updatedDate' | 'responses'>
): Promise<{ data: BulkOffering | null; error: string | null }> => {
  try {
    // Validate subscription (should be checked in RLS but do client validation too)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expiry')
      .single();

    if (!profile || !['pro', 'enterprise'].includes(profile.subscription_tier)) {
      return {
        data: null,
        error: 'Upgrade to Pro or Enterprise to post bulk offerings',
      };
    }

    // Check subscription not expired
    if (new Date(profile.subscription_expiry) < new Date()) {
      return {
        data: null,
        error: 'Your subscription has expired. Please renew to continue.',
      };
    }

    // Prepare offering data
    const offeringData = {
      ...offering,
      total_value: offering.quantityAvailable * offering.pricePerUnit,
      posted_date: new Date().toISOString(),
      status: 'active',
      responses_count: 0,
    };

    const { data, error } = await supabase
      .from('bulk_offerings')
      .insert([offeringData])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Bulk offering created:', data.id);
    return {
      data: data as BulkOffering,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create offering';
    console.error('Error creating bulk offering:', errorMessage);
    return { data: null, error: errorMessage };
  }
};

// ==========================================
// 4. UPDATE BULK OFFERING (Seller Only)
// ==========================================
export const updateBulkOffering = async (
  offeringId: string,
  updates: Partial<BulkOffering>
): Promise<{ data: BulkOffering | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('bulk_offerings')
      .update({
        ...updates,
        updated_date: new Date().toISOString(),
      })
      .eq('id', offeringId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Bulk offering updated:', offeringId);
    return {
      data: data as BulkOffering,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update offering';
    console.error('Error updating bulk offering:', errorMessage);
    return { data: null, error: errorMessage };
  }
};

// ==========================================
// 5. DELETE BULK OFFERING (Seller Only)
// ==========================================
export const deleteBulkOffering = async (
  offeringId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('bulk_offerings')
      .delete()
      .eq('id', offeringId);

    if (error) throw error;

    console.log('✅ Bulk offering deleted:', offeringId);
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete offering';
    console.error('Error deleting bulk offering:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// ==========================================
// 6. SEARCH & FILTER BULK OFFERINGS
// ==========================================
export const searchBulkOfferings = async (
  searchTerm: string,
  filters?: {
    category?: string;
    hub?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }
): Promise<{ data: BulkOffering[]; error: string | null }> => {
  try {
    let query = supabase
      .from('bulk_offerings')
      .select('*')
      .eq('status', 'active');

    // Text search on title and description
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }

    // Category filter
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    // Hub filter
    if (filters?.hub) {
      query = query.eq('hub', filters.hub);
    }

    // Price range filter
    if (filters?.minPrice !== undefined) {
      query = query.gte('price_per_unit', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte('price_per_unit', filters.maxPrice);
    }

    query = query.order('posted_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return {
      data: data as BulkOffering[],
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    console.error('Error searching bulk offerings:', errorMessage);
    return { data: [], error: errorMessage };
  }
};

// ==========================================
// 7. RESPOND TO BULK OFFERING (Buyer Inquiry)
// ==========================================
export const respondToBulkOffering = async (
  offeringId: string,
  message: string,
  requestedQuantity: number
): Promise<{ data: BulkInquiry | null; error: string | null }> => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Get buyer profile
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('name, email, phone')
      .eq('id', userData.user.id)
      .single();

    const inquiryData = {
      offering_id: offeringId,
      buyer_id: userData.user.id,
      buyer_name: buyerProfile?.name || 'Anonymous',
      buyer_email: buyerProfile?.email || userData.user.email,
      buyer_phone: buyerProfile?.phone || 'Not provided',
      message,
      requested_quantity: requestedQuantity,
      status: 'new',
    };

    const { data, error } = await supabase
      .from('bulk_inquiries')
      .insert([inquiryData])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Inquiry submitted to offering:', offeringId);
    return {
      data: data as BulkInquiry,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit inquiry';
    console.error('Error responding to offering:', errorMessage);
    return { data: null, error: errorMessage };
  }
};

// ==========================================
// 8. GET SELLER'S BULK OFFERINGS
// ==========================================
export const getSellerBulkOfferings = async (
  sellerId?: string
): Promise<{ data: BulkOffering[]; error: string | null }> => {
  try {
    // If no sellerId provided, get current user's offerings
    let query = supabase.from('bulk_offerings').select('*');

    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }

    const { data, error } = await query
      .order('posted_date', { ascending: false });

    if (error) throw error;

    return {
      data: data as BulkOffering[],
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch offerings';
    console.error('Error fetching seller offerings:', errorMessage);
    return { data: [], error: errorMessage };
  }
};

// ==========================================
// 9. GET BULK OFFERING ANALYTICS (Seller)
// ==========================================
export const getBulkOfferingAnalytics = async (
  offeringId: string
): Promise<{
  data: {
    totalInquiries: number;
    totalViews: number;
    conversionRate: number;
    averageResponseTime: string;
  } | null;
  error: string | null;
}> => {
  try {
    // Get offering
    const { data: offering } = await supabase
      .from('bulk_offerings')
      .select('responses_count, views_count')
      .eq('id', offeringId)
      .single();

    if (!offering) {
      return { data: null, error: 'Offering not found' };
    }

    // Get inquiries
    const { data: inquiries } = await supabase
      .from('bulk_inquiries')
      .select('status, created_at')
      .eq('offering_id', offeringId);

    const totalInquiries = inquiries?.length || 0;
    const convertedInquiries = inquiries?.filter(i => i.status === 'converted').length || 0;
    const conversionRate = totalInquiries > 0 ? (convertedInquiries / totalInquiries) * 100 : 0;

    // Calculate average response time (mock for now)
    const averageResponseTime = '2-4 hours';

    return {
      data: {
        totalInquiries,
        totalViews: offering.views_count || 0,
        conversionRate: Math.round(conversionRate),
        averageResponseTime,
      },
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
    console.error('Error fetching analytics:', errorMessage);
    return { data: null, error: errorMessage };
  }
};

// ==========================================
// 10. GET BULK OFFERING INQUIRIES (Seller)
// ==========================================
export const getBulkOfferingInquiries = async (
  offeringId: string,
  status?: 'new' | 'replied' | 'converted' | 'rejected'
): Promise<{ data: BulkInquiry[]; error: string | null }> => {
  try {
    let query = supabase
      .from('bulk_inquiries')
      .select('*')
      .eq('offering_id', offeringId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data as BulkInquiry[],
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inquiries';
    console.error('Error fetching inquiries:', errorMessage);
    return { data: [], error: errorMessage };
  }
};

// ==========================================
// ADDITIONAL UTILITY FUNCTIONS
// ==========================================

/**
 * Get bulk offerings by category
 */
export const getBulkOfferingsByCategory = async (
  category: string
): Promise<{ data: BulkOffering[]; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('bulk_offerings')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('posted_date', { ascending: false });

    if (error) throw error;

    return { data: data as BulkOffering[], error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
    return { data: [], error: errorMessage };
  }
};

/**
 * Get top performing bulk offerings
 */
export const getTopBulkOfferings = async (
  limit: number = 10
): Promise<{ data: BulkOffering[]; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('bulk_offerings')
      .select('*')
      .eq('status', 'active')
      .order('responses_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: data as BulkOffering[], error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top offerings';
    return { data: [], error: errorMessage };
  }
};

/**
 * Update inquiry status (Seller responding)
 */
export const updateInquiryStatus = async (
  inquiryId: string,
  status: 'replied' | 'converted' | 'rejected'
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('bulk_inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', inquiryId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
    return { success: false, error: errorMessage };
  }
};

/**
 * Get all categories available
 */
export const getBulkOfferingCategories = (): string[] => {
  return ['furniture', 'decor', 'textiles', 'electronics', 'machinery', 'raw-materials', 'other'];
};

/**
 * Get all valid units
 */
export const getBulkOfferingUnits = (): string[] => {
  return ['units', 'kg', 'meters', 'liters', 'sets', 'pieces', 'boxes', 'tons'];
};

export default {
  fetchBulkOfferings,
  fetchBulkOfferingById,
  createBulkOffering,
  updateBulkOffering,
  deleteBulkOffering,
  searchBulkOfferings,
  respondToBulkOffering,
  getSellerBulkOfferings,
  getBulkOfferingAnalytics,
  getBulkOfferingInquiries,
  getBulkOfferingsByCategory,
  getTopBulkOfferings,
  updateInquiryStatus,
  getBulkOfferingCategories,
  getBulkOfferingUnits,
};
