const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '/api';

const request = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/secondhand${endpoint}`, {
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

export const secondhandService = {
  getCategories: async () => {
    const response = await request<any>('/categories');
    return response.success ? response.data?.categories || [] : [];
  },
  getListings: async (params?: {
    category?: string;
    search?: string;
    condition?: string;
    county?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.condition) query.set('condition', params.condition);
    if (params?.county) query.set('county', params.county);
    if (params?.city) query.set('city', params.city);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const response = await request<any>(`/listings?${query.toString()}`);
    if (!response.success) return [];
    const listings = response.data?.listings || [];
    return listings.map((listing: any) => ({
      ...listing,
      currency: 'KES',
      views: listing.views_count ?? listing.views ?? 0,
      photos: Array.isArray(listing.photos) ? listing.photos : [],
      videos: Array.isArray(listing.videos) ? listing.videos : [],
      seller: {
        user_id: listing.seller_id,
        display_name: listing.seller_name || 'Seller',
        phone: listing.seller_phone || null,
        whatsapp: listing.seller_whatsapp || null,
        email: listing.seller_email || null,
        location: [listing.county, listing.city].filter(Boolean).join(', '),
        bio: null,
        avatar_url: null,
        total_views: listing.views_count ?? 0,
        verified: false,
        listing_count: 0,
      },
    }));
  },
  getSellerProfile: async (sellerId: string) => {
    const response = await request<any>(`/sellers/${sellerId}`);
    if (!response.success) return null;

    const seller = response.data?.seller;
    if (!seller) return null;

    const listings = Array.isArray(seller.listings) ? seller.listings : [];
    return {
      user_id: seller.seller_id,
      display_name: seller.seller_name || 'Seller',
      phone: seller.contact_phone || null,
      whatsapp: seller.whatsapp_number || null,
      email: seller.email || null,
      location: [seller.county, seller.city].filter(Boolean).join(', '),
      bio: null,
      avatar_url: null,
      total_views: seller.total_views || 0,
      verified: seller.approval_status === 'approved',
      listing_count: listings.length,
    };
  },
  createListing: async (payload: {
    userId: string;
    sellerName?: string;
    sellerPhone?: string;
    sellerWhatsapp?: string;
    sellerEmail?: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    category?: string;
    county?: string;
    city?: string;
    photos?: string[];
    videos?: string[];
  }) => {
    return request('/listings', {
      method: 'POST',
      body: JSON.stringify({
        sellerId: payload.userId,
        sellerName: payload.sellerName,
        sellerPhone: payload.sellerPhone,
        sellerWhatsapp: payload.sellerWhatsapp,
        sellerEmail: payload.sellerEmail,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        condition: payload.condition,
        category: payload.category,
        county: payload.county,
        city: payload.city,
        photos: payload.photos,
        videos: payload.videos,
      }),
    });
  },
  addView: async (listingId: string) => {
    return request(`/listings/${listingId}/view`, { method: 'POST' });
  },
  getComments: async (listingId: string, includeAll = false) => {
    const query = includeAll ? '?includeAll=true' : '';
    const response = await request<any>(`/listings/${listingId}/comments${query}`);
    if (!response.success) return [];
    const comments = response.data?.comments || [];
    return comments.map((comment: any) => ({
      ...comment,
      content: comment.comment,
      author_name: 'Buyer',
    }));
  },
  addComment: async (payload: { listingId: string; userId: string; content: string }) => {
    return request(`/listings/${payload.listingId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ commenterUserId: payload.userId, comment: payload.content }),
    });
  },
  addFavorite: async (listingId: string, userId: string) => {
    return request(`/listings/${listingId}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },
  removeFavorite: async (listingId: string, userId: string) => {
    return request(`/listings/${listingId}/favorites/${userId}`, { method: 'DELETE' });
  },
  getFavoriteStatus: async (listingId: string, userId: string) => {
    const response = await request<any>(`/listings/${listingId}/favorites/${userId}/status`);
    return response.success ? Boolean(response.data?.isFavorite) : false;
  },
  updateListingStatus: async (listingId: string, moderationStatus: string) => {
    return request(`/admin/listings/${listingId}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify({ moderationStatus }),
    });
  },
  updateCommentStatus: async (commentId: string, moderationStatus: string) => {
    return request(`/admin/comments/${commentId}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify({ moderationStatus }),
    });
  },
  createCategory: async (payload: {
    name: string;
    slug?: string;
    group_name: string;
    sort_order?: number;
    is_active?: boolean;
  }) => {
    return request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        slug: payload.slug,
        groupName: payload.group_name,
        sortOrder: payload.sort_order,
        isActive: payload.is_active,
      }),
    });
  },
  updateCategory: async (id: string, payload: {
    name?: string;
    slug?: string;
    group_name?: string;
    sort_order?: number;
    is_active?: boolean;
  }) => {
    return request(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: payload.name,
        slug: payload.slug,
        groupName: payload.group_name,
        sortOrder: payload.sort_order,
        isActive: payload.is_active,
      }),
    });
  },
  deleteCategory: async (id: string) => {
    return request(`/admin/categories/${id}`, { method: 'DELETE' });
  },
};
