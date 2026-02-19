const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '/api';

const request = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kenya-wholesale${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: result?.error || 'Request failed',
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error',
    };
  }
};

const mapListing = (row: any) => ({
  id: row.id,
  sellerId: row.seller_id,
  sellerName: row.seller_name,
  sellerPhone: row.seller_phone,
  sellerEmail: row.seller_email,
  title: row.title,
  description: row.description,
  category: row.category,
  quantityAvailable: row.quantity_available,
  unit: row.unit,
  pricePerUnit: row.price_per_unit,
  minOrderQuantity: row.min_order_quantity,
  status: row.status,
  postedDate: row.posted_date,
  viewsCount: row.views_count || 0,
  commentsCount: row.comments_count || 0,
  photos: Array.isArray(row.photos) ? row.photos : [],
  videos: Array.isArray(row.videos) ? row.videos : [],
  moderationStatus: row.moderation_status,
  moderationNotes: row.moderation_notes,
});

export const getKenyaWholesaleListings = async (params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  const response = await request<any>(`/listings?${query.toString()}`);
  if (!response.success) return response;

  return {
    success: true,
    data: {
      listings: (response.data?.listings || []).map(mapListing),
      total: response.data?.total || 0,
    },
  };
};

export const getKenyaSellerPage = async (sellerId: string) => {
  const response = await request<any>(`/sellers/${sellerId}`);
  if (!response.success) return response;

  const seller = response.data?.seller;
  return {
    success: true,
    data: {
      seller: seller
        ? {
            ...seller,
            sellerId: seller.seller_id,
            sellerName: seller.seller_name,
            contactPhone: seller.contact_phone,
            whatsappNumber: seller.whatsapp_number,
            businessLocation: seller.business_location,
            followersCount: seller.followers_count || 0,
            products: (seller.products || []).map(mapListing),
          }
        : null,
    },
  };
};

export const upsertKenyaSellerProfile = async (payload: {
  sellerId: string;
  sellerName: string;
  contactPhone?: string;
  whatsappNumber?: string;
  businessLocation?: string;
}) => {
  return request('/sellers/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const createKenyaWholesaleListing = async (payload: {
  sellerId: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  minOrderQuantity: number;
  sellerName: string;
  sellerPhone?: string;
  sellerEmail?: string;
  photos?: string[];
  videos?: string[];
}) => {
  return request('/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const incrementKenyaListingViews = async (listingId: string) => {
  return request(`/listings/${listingId}/view`, {
    method: 'POST',
  });
};

export const getKenyaListingComments = async (listingId: string, includeAll = false) => {
  const query = includeAll ? '?includeAll=true' : '';
  return request<any>(`/listings/${listingId}/comments${query}`);
};

export const createKenyaListingComment = async (
  listingId: string,
  payload: { commenterUserId: string; comment: string }
) => {
  return request(`/listings/${listingId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const followKenyaSeller = async (sellerId: string, followerUserId: string) => {
  return request(`/sellers/${sellerId}/follow`, {
    method: 'POST',
    body: JSON.stringify({ followerUserId }),
  });
};

export const unfollowKenyaSeller = async (sellerId: string, followerUserId: string) => {
  return request(`/sellers/${sellerId}/follow/${followerUserId}`, {
    method: 'DELETE',
  });
};

export const getKenyaSellerFollowersCount = async (sellerId: string) => {
  return request<any>(`/sellers/${sellerId}/followers/count`);
};

export const getKenyaFollowStatus = async (sellerId: string, userId: string) => {
  return request<any>(`/sellers/${sellerId}/followers/${userId}/status`);
};

export const adminModerateKenyaSeller = async (
  sellerId: string,
  status: 'pending' | 'approved' | 'suspended' | 'rejected',
  notes?: string
) => {
  return request(`/admin/sellers/${sellerId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
};

export const adminModerateKenyaListing = async (
  listingId: string,
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'suspended',
  moderationNotes?: string
) => {
  return request(`/admin/listings/${listingId}/moderation`, {
    method: 'PATCH',
    body: JSON.stringify({ moderationStatus, moderationNotes }),
  });
};

export const adminModerateKenyaComment = async (
  commentId: string,
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'suspended',
  moderationNotes?: string
) => {
  return request(`/admin/comments/${commentId}/moderation`, {
    method: 'PATCH',
    body: JSON.stringify({ moderationStatus, moderationNotes }),
  });
};
