/**
 * Real Data Service - Fetches from Supabase instead of using mock data
 * Replaces all MOCK_PRODUCTS and MOCK_SELLERS
 */

import { supabase } from '../src/lib/supabaseClient';
import { Product, User } from '../types';

/**
 * Fetch all active marketplace listings
 */
export const fetchMarketplaceListings = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('id, title, price, currency, images, category, seller_id, description, is_active, seller_name, seller_phone, seller_location, created_at')
      .eq('is_active', true)
      .limit(50);

    if (error) throw error;

    return (data || []).map((product: any) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency || 'KES',
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      category: product.category,
      isWholesale: false,
      verified: true,
      sellerId: product.seller_id,
      sellerName: product.seller_name || 'Seller',
      sellerPhone: product.seller_phone,
      location: product.seller_location,
      description: product.description,
      status: 'Active',
      listingStatus: 'active',
    }));
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    return [];
  }
};

/**
 * Fetch all Mkulima farmer listings
 */
export const fetchMkulimaListings = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('farmer_listings')
      .select('id, title, price, currency, images, category, farmer_id, description, is_active, created_at')
      .eq('is_active', true)
      .limit(50);

    if (error) throw error;

    return (data || []).map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency || 'KES',
      image: listing.images?.[0] || 'https://images.unsplash.com/photo-1488459716781-6818f956e29e?q=80&w=800&auto=format&fit=crop',
      category: listing.category,
      isWholesale: false,
      verified: true,
      sellerId: listing.farmer_id,
      sellerName: 'Farmer',
      description: listing.description,
      status: 'Active',
      listingStatus: 'active',
    }));
  } catch (error) {
    console.error('Error fetching Mkulima listings:', error);
    return [];
  }
};

/**
 * Fetch all wholesale products
 */
export const fetchWholesaleProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('wholesale_products')
      .select('id, title, bulk_price, currency, images, category, seller_id, moq, description, is_active, created_at')
      .eq('is_active', true)
      .limit(50);

    if (error) throw error;

    return (data || []).map((product: any) => ({
      id: product.id,
      title: product.title,
      price: product.bulk_price,
      currency: product.currency || 'KES',
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      category: product.category,
      isWholesale: true,
      minOrder: product.moq,
      verified: true,
      sellerId: product.seller_id,
      sellerName: 'Wholesale Seller',
      description: product.description,
      status: 'Active',
      listingStatus: 'active',
    }));
  } catch (error) {
    console.error('Error fetching wholesale products:', error);
    return [];
  }
};;

/**
 * Fetch all digital products
 */
export const fetchDigitalProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('digital_products')
      .select('*')
      .eq('status', 'active')
      .limit(50);

    if (error) throw error;

    return (data || []).map((product: any) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency || 'KES',
      image: product.preview_image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
      category: product.category,
      isWholesale: false,
      verified: true,
      sellerId: product.seller_id,
      sellerName: product.sellerName || 'Digital Seller',
      description: product.description,
      status: 'Active',
      listingStatus: product.status,
    }));
  } catch (error) {
    console.error('Error fetching digital products:', error);
    return [];
  }
};

/**
 * Fetch professional services
 */
export const fetchProfessionalServices = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('professional_services')
      .select('*')
      .eq('status', 'active')
      .limit(50);

    if (error) throw error;

    return (data || []).map((service: any) => ({
      id: service.id,
      title: service.service_name,
      price: service.hourly_rate || service.fixed_rate,
      currency: service.currency || 'KES',
      image: service.portfolio_images?.[0] || 'https://images.unsplash.com/photo-1557804506-669714d2e9d8?q=80&w=800&auto=format&fit=crop',
      category: service.category,
      isWholesale: false,
      verified: true,
      sellerId: service.provider_id,
      sellerName: service.serviceName || 'Service Provider',
      description: service.description,
      status: 'Active',
      listingStatus: service.status,
    }));
  } catch (error) {
    console.error('Error fetching professional services:', error);
    return [];
  }
};

/**
 * Fetch all sellers
 */
export const fetchAllSellers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller')
      .limit(50);

    if (error) throw error;

    return (data || []).map((seller: any) => ({
      id: seller.id,
      name: seller.full_name || 'Seller',
      email: seller.email || '',
      phone: seller.phone_number,
      role: 'seller',
      verified: true,
      avatar: seller.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      subscriptionExpiry: seller.subscription_expiry ? new Date(seller.subscription_expiry).getTime() : null,
      accountStatus: seller.account_status || 'active',
      joinDate: seller.created_at || new Date().toISOString(),
      reviews: [],
      following: [],
      followers: [],
      acceptedTermsTimestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return [];
  }
};

/**
 * Fetch all products across all categories
 */
export const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    const [marketplace, wholesale, digital] = await Promise.all([
      fetchMarketplaceListings(),
      fetchWholesaleProducts(),
      fetchDigitalProducts(),
    ]);
    
    return [...marketplace, ...wholesale, ...digital];
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};

/**
 * Fetch products by category
 */
export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    // Search across all product types
    const [marketplace, wholesale, digital] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .eq('category', category)
        .eq('status', 'active'),
      supabase
        .from('wholesale_products')
        .select('*')
        .eq('category', category)
        .eq('status', 'active'),
      supabase
        .from('digital_products')
        .select('*')
        .eq('category', category)
        .eq('status', 'active'),
    ]);

    const products: Product[] = [];

    // Process marketplace listings
    if (marketplace.data) {
      products.push(...marketplace.data.map((listing: any) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        currency: 'KES' as const,
        image: listing.images?.[0] || '',
        category: listing.category,
        isWholesale: false,
        verified: true,
        sellerId: listing.seller_id,
        sellerName: 'Seller',
        description: listing.description,
        status: 'Active' as const,
        listingStatus: listing.status,
      })));
    }

    // Process wholesale
    if (wholesale.data) {
      products.push(...wholesale.data.map((product: any) => ({
        id: product.id,
        title: product.title,
        price: product.bulk_price,
        currency: 'KES' as const,
        image: product.images?.[0] || '',
        category: product.category,
        isWholesale: true,
        minOrder: product.moq,
        verified: true,
        sellerId: product.seller_id,
        sellerName: 'Seller',
        description: product.description,
        status: 'Active' as const,
        listingStatus: product.status,
      })));
    }

    // Process digital
    if (digital.data) {
      products.push(...digital.data.map((product: any) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        currency: 'KES' as const,
        image: product.preview_image || '',
        category: product.category,
        isWholesale: false,
        verified: true,
        sellerId: product.seller_id,
        sellerName: 'Seller',
        description: product.description,
        status: 'Active' as const,
        listingStatus: product.status,
      })));
    }

    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

/**
 * Search products by title or description
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const searchTerm = `%${query}%`;

    const [marketplace, wholesale, digital] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('status', 'active'),
      supabase
        .from('wholesale_products')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('status', 'active'),
      supabase
        .from('digital_products')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('status', 'active'),
    ]);

    const products: Product[] = [];

    if (marketplace.data) {
      products.push(...marketplace.data.slice(0, 10).map(mapListingToProduct));
    }
    if (wholesale.data) {
      products.push(...wholesale.data.slice(0, 10).map(mapWholesaleToProduct));
    }
    if (digital.data) {
      products.push(...digital.data.slice(0, 10).map(mapDigitalToProduct));
    }

    return products.slice(0, 20); // Return top 20 results
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Helper functions to map Supabase data to Product type
const mapListingToProduct = (listing: any): Product => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  currency: 'KES',
  image: listing.images?.[0] || '',
  category: listing.category,
  isWholesale: false,
  verified: true,
  sellerId: listing.seller_id,
  sellerName: 'Seller',
  description: listing.description,
  status: 'Active',
  listingStatus: listing.status,
});

const mapWholesaleToProduct = (product: any): Product => ({
  id: product.id,
  title: product.title,
  price: product.bulk_price,
  currency: 'KES',
  image: product.images?.[0] || '',
  category: product.category,
  isWholesale: true,
  minOrder: product.moq,
  verified: true,
  sellerId: product.seller_id,
  sellerName: 'Seller',
  description: product.description,
  status: 'Active',
  listingStatus: product.status,
});

const mapDigitalToProduct = (product: any): Product => ({
  id: product.id,
  title: product.title,
  price: product.price,
  currency: 'KES',
  image: product.preview_image || '',
  category: product.category,
  isWholesale: false,
  verified: true,
  sellerId: product.seller_id,
  sellerName: 'Seller',
  description: product.description,
  status: 'Active',
  listingStatus: product.status,
});

export default {
  fetchMarketplaceListings,
  fetchMkulimaListings,
  fetchWholesaleProducts,
  fetchDigitalProducts,
  fetchProfessionalServices,
  fetchAllSellers,
  fetchAllProducts,
  fetchProductsByCategory,
  searchProducts,
};
