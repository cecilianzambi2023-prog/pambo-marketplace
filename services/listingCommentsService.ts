import { supabase } from '../src/lib/supabaseClient';
import { buildPaginationMeta, logServiceTiming } from './serviceObservability';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

const clampPageSize = (value?: number) => {
  const parsed = Number.isFinite(value) ? Number(value) : DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE);
};

export interface CreateListingCommentInput {
  listingId: string;
  sellerId: string;
  buyerId: string;
  authorName: string;
  comment: string;
}

export interface ListingCommentRecord {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  authorName?: string;
  comment: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const createListingComment = async (input: CreateListingCommentInput) => {
  try {
    const { data, error } = await supabase
      .from('listing_comments')
      .insert({
        listingId: input.listingId,
        sellerId: input.sellerId,
        buyerId: input.buyerId,
        authorName: input.authorName,
        comment: input.comment,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, comment: data as ListingCommentRecord };
  } catch (error) {
    console.error('Create listing comment error:', error);
    return { success: false, error };
  }
};

export const getAllListingComments = async (limit = 2000) => {
  const startedAt = Date.now();
  try {
    const safeLimit = clampPageSize(limit);

    const { data, error, count } = await supabase
      .from('listing_comments')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .limit(safeLimit);

    if (error) throw error;

    logServiceTiming('listingComments.getAllListingComments', startedAt, {
      limit: safeLimit,
      resultCount: (data || []).length,
    });

    return {
      success: true,
      comments: (data || []) as ListingCommentRecord[],
      total: count || 0,
      pagination: buildPaginationMeta(count || 0, safeLimit, 0),
    };
  } catch (error) {
    console.error('Get listing comments error:', error);
    return { success: false, error };
  }
};

export const updateListingCommentStatus = async (commentId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    const { error } = await supabase
      .from('listing_comments')
      .update({ status })
      .eq('id', commentId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Update listing comment status error:', error);
    return { success: false, error };
  }
};
