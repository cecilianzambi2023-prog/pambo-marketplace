import { User, Review, Product } from '../types';
import { supabaseClient } from '../src/lib/supabaseClient';

/**
 * Fetch a seller's profile information
 */
export const fetchSellerProfile = async (sellerId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', sellerId)
      .single();

    if (error || !data) {
      console.error('Error fetching seller profile:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Fetch seller profile error:', error);
    return null;
  }
};

/**
 * Fetch all reviews for a specific seller
 */
export const fetchSellerReviews = async (sellerId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('sellerId', sellerId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching seller reviews:', error);
      return [];
    }

    return (data || []) as Review[];
  } catch (error) {
    console.error('Fetch seller reviews error:', error);
    return [];
  }
};

/**
 * Fetch all products from a specific seller
 */
export const fetchSellerProducts = async (sellerId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('sellerId', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller products:', error);
      return [];
    }

    return (data || []) as Product[];
  } catch (error) {
    console.error('Fetch seller products error:', error);
    return [];
  }
};

/**
 * Fetch seller with all related data (profile, reviews, products)
 */
export const fetchSellerWithDetails = async (sellerId: string) => {
  try {
    const [seller, reviews, products] = await Promise.all([
      fetchSellerProfile(sellerId),
      fetchSellerReviews(sellerId),
      fetchSellerProducts(sellerId),
    ]);

    return {
      seller,
      reviews,
      products,
    };
  } catch (error) {
    console.error('Fetch seller with details error:', error);
    return {
      seller: null,
      reviews: [],
      products: [],
    };
  }
};

/**
 * Add a review to a seller's profile
 */
export const addSellerReview = async (
  review: Review,
  currentUserId: string
): Promise<Review | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .insert([
        {
          ...review,
          date: new Date().toISOString(),
          author: review.author || currentUserId,
          status: 'pending', // Requires admin approval
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding seller review:', error);
      return null;
    }

    return data as Review;
  } catch (error) {
    console.error('Add seller review error:', error);
    return null;
  }
};

/**
 * Delete a seller review (admin-only action should be enforced by caller/RLS)
 */
export const deleteSellerReview = async (reviewId: string): Promise<boolean> => {
  try {
    const { error } = await supabaseClient
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting seller review:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete seller review error:', error);
    return false;
  }
};

/**
 * Get seller average rating
 */
export const getSellerAverageRating = (reviews: Review[]): number => {
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  if (approvedReviews.length === 0) return 0;
  const total = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((total / approvedReviews.length).toFixed(1));
};

/**
 * Get seller rating distribution
 */
export const getSellerRatingDistribution = (reviews: Review[]) => {
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  approvedReviews.forEach(review => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
  });

  return distribution;
};

export default {
  fetchSellerProfile,
  fetchSellerReviews,
  fetchSellerProducts,
  fetchSellerWithDetails,
  addSellerReview,
  deleteSellerReview,
  getSellerAverageRating,
  getSellerRatingDistribution,
};
