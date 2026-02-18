import { supabase } from '../src/lib/supabaseClient';
import { PamboOrder } from '../types';

/**
 * Create a new order
 */
export const createOrder = async (order: Omit<PamboOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return { success: true, order: data?.[0] };
  } catch (error) {
    console.error('Create order error:', error);
    return { success: false, error };
  }
};

/**
 * Get order by ID
 */
export const getOrder = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return { success: true, order: data };
  } catch (error) {
    console.error('Get order error:', error);
    return { success: false, error };
  }
};

/**
 * Get orders by buyer ID
 */
export const getBuyerOrders = async (buyerId: string, status?: string) => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('buyerId', buyerId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return { success: true, orders: data || [] };
  } catch (error) {
    console.error('Get buyer orders error:', error);
    return { success: false, error };
  }
};

/**
 * Get orders by seller ID
 */
export const getSellerOrders = async (sellerId: string, status?: string) => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('sellerId', sellerId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return { success: true, orders: data || [] };
  } catch (error) {
    console.error('Get seller orders error:', error);
    return { success: false, error };
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select();

    if (error) throw error;

    return { success: true, order: data?.[0] };
  } catch (error) {
    console.error('Update order status error:', error);
    return { success: false, error };
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'canceled',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select();

    if (error) throw error;

    return { success: true, order: data?.[0] };
  } catch (error) {
    console.error('Cancel order error:', error);
    return { success: false, error };
  }
};

/**
 * Get order details with listing information
 */
export const getOrderWithDetails = async (orderId: string) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Get listing details for each item in the order
    if (order?.listings && order.listings.length > 0) {
      const listingIds = order.listings.map((item: any) => item.listingId);
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, images, category')
        .in('id', listingIds);

      return {
        success: true,
        order: {
          ...order,
          listingDetails: listings || [],
        },
      };
    }

    return { success: true, order };
  } catch (error) {
    console.error('Get order with details error:', error);
    return { success: false, error };
  }
};

/**
 * Get seller's order statistics
 */
export const getSellerOrderStats = async (sellerId: string) => {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('sellerId', sellerId);

    if (!orders) {
      return {
        success: true,
        stats: {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
        },
      };
    }

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      pendingOrders: orders.filter((o) => o.status === 'processing' || o.status === 'pending').length,
      completedOrders: orders.filter((o) => o.status === 'completed').length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Get seller order stats error:', error);
    return { success: false, error };
  }
};

/**
 * Get buyer's spending statistics
 */
export const getBuyerSpendingStats = async (buyerId: string) => {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('buyerId', buyerId);

    if (!orders) {
      return {
        success: true,
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
        },
      };
    }

    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const stats = {
      totalOrders: orders.length,
      totalSpent,
      averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Get buyer spending stats error:', error);
    return { success: false, error };
  }
};

/**
 * Add tracking information to order
 */
export const updateOrderTracking = async (
  orderId: string,
  trackingData: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        tracking: trackingData,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select();

    if (error) throw error;

    return { success: true, order: data?.[0] };
  } catch (error) {
    console.error('Update order tracking error:', error);
    return { success: false, error };
  }
};
