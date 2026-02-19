/**
 * Pambo Backend API Client
 * Handles all API calls to the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class PamboApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error?.message || result.error || 'Unknown error',
        };
      }

      return {
        success: true,
        data: result.data || result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // ========================
  // AUTHENTICATION ENDPOINTS
  // ========================

  async verifyToken(token: string) {
    return this.request('POST', '/auth/verify-token', { token });
  }

  async getUser(userId: string) {
    return this.request('POST', '/auth/get-user', { userId });
  }

  async updateProfile(userId: string, data: any) {
    return this.request('POST', '/auth/update-profile', {
      userId,
      ...data,
    });
  }

  async getSellerProfile(userId: string) {
    return this.request('POST', '/auth/seller-profile', { userId });
  }

  // ========================
  // LISTINGS ENDPOINTS
  // ========================

  async createListing(data: any) {
    return this.request('POST', '/listings', data);
  }

  async getListing(listingId: string) {
    return this.request('GET', `/listings/${listingId}`);
  }

  async getListingsByHub(hub: string, limit: number = 20, offset: number = 0) {
    return this.request(
      'GET',
      `/listings/hub/${hub}?limit=${limit}&offset=${offset}`
    );
  }

  async getSellerListings(sellerId: string) {
    return this.request('GET', `/listings/seller/${sellerId}`);
  }

  async updateListing(listingId: string, data: any) {
    return this.request('PUT', `/listings/${listingId}`, data);
  }

  async deleteListing(listingId: string) {
    return this.request('DELETE', `/listings/${listingId}`);
  }

  async searchListings(query: string, hub?: string, limit: number = 20) {
    let url = `/listings/search/${query}?limit=${limit}`;
    if (hub) url += `&hub=${hub}`;
    return this.request('GET', url);
  }

  // ========================
  // ORDERS ENDPOINTS
  // ========================

  async createOrder(data: any) {
    return this.request('POST', '/orders', data);
  }

  async getOrder(orderId: string) {
    return this.request('GET', `/orders/${orderId}`);
  }

  async getBuyerOrders(buyerId: string, limit: number = 20, offset: number = 0) {
    return this.request(
      'GET',
      `/orders/buyer/${buyerId}?limit=${limit}&offset=${offset}`
    );
  }

  async getSellerOrders(sellerId: string, status?: string, limit: number = 20, offset: number = 0) {
    let url = `/orders/seller/${sellerId}?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return this.request('GET', url);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request('PATCH', `/orders/${orderId}/status`, { status });
  }

  async updateOrder(orderId: string, data: any) {
    return this.request('PUT', `/orders/${orderId}`, data);
  }

  async cancelOrder(orderId: string) {
    return this.request('DELETE', `/orders/${orderId}`);
  }

  // ========================
  // PAYMENTS ENDPOINTS
  // ========================

  async initiateMpesaPayment(phone: string, amount: number, orderId: string, description?: string) {
    return this.request('POST', '/payments/mpesa/initiate', {
      phone,
      amount,
      orderId,
      description,
    });
  }

  async getPaymentStatus(orderId: string) {
    return this.request('GET', `/payments/${orderId}`);
  }

  async verifyMpesaPayment(orderId: string) {
    return this.request('POST', `/payments/mpesa/verify`, { orderId });
  }

  async getSellerPayouts(sellerId: string) {
    return this.request('GET', `/payments/seller/${sellerId}/payouts`);
  }

  // ========================
  // REVIEWS ENDPOINTS
  // ========================

  async createReview(data: any) {
    return this.request('POST', '/reviews', data);
  }

  async getListingReviews(listingId: string, limit: number = 20, offset: number = 0) {
    return this.request(
      'GET',
      `/reviews/listing/${listingId}?limit=${limit}&offset=${offset}`
    );
  }

  async getSellerReviews(sellerId: string) {
    return this.request('GET', `/reviews/seller/${sellerId}`);
  }

  async markReviewHelpful(reviewId: string) {
    return this.request('POST', `/reviews/${reviewId}/helpful`);
  }

  async updateReview(reviewId: string, data: any) {
    return this.request('PUT', `/reviews/${reviewId}`, data);
  }

  async deleteReview(reviewId: string) {
    return this.request('DELETE', `/reviews/${reviewId}`);
  }

  // ========================
  // ADMIN ENDPOINTS
  // ========================

  async getAdminDashboard() {
    return this.request('GET', '/admin/dashboard');
  }

  async getAdminUsers(limit: number = 20, offset: number = 0, search?: string) {
    let url = `/admin/users?limit=${limit}&offset=${offset}`;
    if (search) url += `&search=${search}`;
    return this.request('GET', url);
  }

  async banUser(userId: string, reason: string) {
    return this.request('PATCH', `/admin/users/${userId}/ban`, { reason });
  }

  async unbanUser(userId: string) {
    return this.request('PATCH', `/admin/users/${userId}/unban`);
  }

  async removeListing(listingId: string, reason: string) {
    return this.request('PATCH', `/admin/listings/${listingId}/remove`, { reason });
  }

  async getAdminLogs(limit: number = 50, offset: number = 0) {
    return this.request('GET', `/admin/activity-logs?limit=${limit}&offset=${offset}`);
  }

  async getReports(limit: number = 20, offset: number = 0, status?: string) {
    let url = `/admin/reports?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return this.request('GET', url);
  }

  // ========================
  // SUBSCRIPTION ENDPOINTS
  // ========================

  async initiateSubscription(userId: string, phone: string, hub: string, plan: string) {
    return this.request('POST', '/payments/subscription/initiate', {
      userId,
      phone,
      hub,
      plan
    });
  }

  async getUserSubscriptions(userId: string) {
    return this.request('GET', `/payments/subscription/${userId}`);
  }

  async activateSubscription(subscriptionId: string, transactionId: string) {
    return this.request('POST', `/payments/subscription/${subscriptionId}/activate`, {
      transactionId
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.request('POST', `/payments/subscription/${subscriptionId}/cancel`);
  }
}

// Create and export singleton instance
export const apiClient = new PamboApiClient();
export default apiClient;
