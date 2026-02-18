import { supabase } from '../src/lib/supabaseClient';
import { FEATURED_LISTING_PRICE, FEATURED_LISTING_DURATION_DAYS, FEATURED_LISTING_CURRENCY } from '../constants';
import { initiateSTKPush } from './mpesaService';

export interface CreateFeaturedListingInput {
  listingId: string;
  sellerId: string;
  phone: string;
  mpesaReceiptNumber: string;
  paymentMethod: 'mpesa' | 'bank_transfer';
}

/**
 * Create a featured listing record after successful M-Pesa payment
 */
export const createFeaturedListing = async (input: CreateFeaturedListingInput) => {
  const now = new Date();
  const endDate = new Date(now.getTime() + FEATURED_LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('featured_listings')
    .insert({
      listing_id: input.listingId,
      seller_id: input.sellerId,
      featured_start_date: now.toISOString(),
      featured_end_date: endDate.toISOString(),
      duration_days: FEATURED_LISTING_DURATION_DAYS,
      amount_paid: FEATURED_LISTING_PRICE,
      currency: FEATURED_LISTING_CURRENCY,
      payment_method: input.paymentMethod,
      status: 'active',
      mpesa_receipt_number: input.mpesaReceiptNumber,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create featured listing: ${error.message}`);
  return data;
};

/**
 * Initiate featured listing payment via M-Pesa STK Push
 * Returns the STK Push request ID
 */
export const initiateFeaturedListingPayment = async (
  phone: string,
  listingId: string,
  sellerId: string,
  onSuccess: (receipt: string) => Promise<void>
) => {
  // Format phone: convert 0... to 254... if needed
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  }

  // Initiate STK Push for featured listing
  const checkoutRequestId = await initiateSTKPush(
    formattedPhone,
    FEATURED_LISTING_PRICE
  );

  return checkoutRequestId;
};

/**
 * Check if a listing is currently featured
 */
export const isListingFeatured = async (listingId: string): Promise<boolean> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('featured_listings')
    .select('id')
    .eq('listing_id', listingId)
    .eq('status', 'active')
    .gt('featured_end_date', now)
    .limit(1);

  if (error) {
    console.error('Error checking featured status:', error);
    return false;
  }

  return data && data.length > 0;
};

/**
 * Get featured listing details (if active)
 */
export const getFeaturedListingDetails = async (listingId: string) => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('featured_listings')
    .select('*')
    .eq('listing_id', listingId)
    .eq('status', 'active')
    .gt('featured_end_date', now)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is expected
    console.error('Error fetching featured listing:', error);
  }

  return data || null;
};

/**
 * Get all currently featured listings (for admin dashboard)
 */
export const getAllFeaturedListings = async (limit = 100, offset = 0) => {
  const { data, error, count } = await supabase
    .from('active_featured_listings')
    .select('*', { count: 'exact' })
    .order('featured_start_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch featured listings: ${error.message}`);
  return { data, count };
};

/**
 * Get featured listings analytics for admin dashboard
 */
export const getFeaturedListingsAnalytics = async () => {
  // Get total count
  const { count: totalFeatured } = await supabase
    .from('active_featured_listings')
    .select('*', { count: 'exact', head: true });

  // Get revenue sum
  const { data: revenueData } = await supabase
    .from('featured_listings')
    .select('amount_paid')
    .eq('status', 'active');

  const totalRevenue = revenueData?.reduce((sum, row) => sum + (row.amount_paid || 0), 0) || 0;

  // Get by payment method
  const { data: byMethod } = await supabase
    .from('featured_listings')
    .select('payment_method, amount_paid');

  const mpesaRevenue = byMethod
    ?.filter(row => row.payment_method === 'mpesa')
    .reduce((sum, row) => sum + (row.amount_paid || 0), 0) || 0;

  const bankRevenue = byMethod
    ?.filter(row => row.payment_method === 'bank_transfer')
    .reduce((sum, row) => sum + (row.amount_paid || 0), 0) || 0;

  return {
    total_featured: totalFeatured || 0,
    total_revenue: totalRevenue,
    mpesa_revenue: mpesaRevenue,
    bank_revenue: bankRevenue,
    price_per_listing: FEATURED_LISTING_PRICE,
    duration_days: FEATURED_LISTING_DURATION_DAYS,
  };
};

/**
 * Check if user can feature another listing (rate limiting)
 */
export const canSellerFeatureMore = async (sellerId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('featured_listings')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('status', 'active');

  // Allow up to 5 featured listings per seller
  return (data?.length || 0) < 5;
};
