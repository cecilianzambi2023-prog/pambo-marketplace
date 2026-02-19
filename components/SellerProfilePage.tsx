import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Gift,
  TrendingUp,
  Users,
  Package,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Heart,
  Share2,
  Flag,
  Trash2
} from 'lucide-react';
import { Product, User, Review, ListingComment, SellerBadge } from '../types';
import { BadgeDisplay } from './PaidFeatures/BadgeDisplay';
import { SmartImage } from './SmartImage';

interface SellerProfilePageProps {
  seller: User | null;
  isOpen: boolean;
  onClose: () => void;
  sellerProducts: Product[];
  sellerReviews: Review[];
  onAddReview: (
    sellerId: string,
    review: Omit<Review, 'date' | 'author' | 'status'>
  ) => void | Promise<void>;
  isLoggedIn: boolean;
  currentUser: User;
  onToggleFollow: (sellerId: string) => void;
  onProductClick?: (product: Product) => void;
  isAdmin?: boolean;
  onDeleteReview?: (reviewId: string) => void | Promise<void>;
}

export const SellerProfilePage: React.FC<SellerProfilePageProps> = ({
  seller,
  isOpen,
  onClose,
  sellerProducts,
  sellerReviews,
  onAddReview,
  isLoggedIn,
  currentUser,
  onToggleFollow,
  onProductClick,
  isAdmin = false,
  onDeleteReview
}) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'about' | 'products' | 'reviews'>('about');

  if (!isOpen || !seller) return null;

  const approvedReviews = useMemo(() => {
    return sellerReviews.filter((r) => r.status === 'approved');
  }, [sellerReviews]);

  const averageRating = useMemo(() => {
    if (approvedReviews.length === 0) return 0;
    const total = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / approvedReviews.length).toFixed(1);
  }, [approvedReviews]);

  const isFollowing = useMemo(() => {
    return currentUser && currentUser.following.includes(seller.id);
  }, [currentUser, seller]);

  const activeProducts = useMemo(() => {
    return sellerProducts.filter((p) => p.status === 'Active' && p.listingStatus === 'active');
  }, [sellerProducts]);

  const joinedDate = new Date(seller.joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please log in to leave a review');
      return;
    }
    if (newRating > 0 && newComment.trim() !== '') {
      onAddReview(seller.id, {
        rating: newRating,
        comment: newComment,
        listingId: undefined,
        buyerId: currentUser.id
      });
      setNewRating(0);
      setNewComment('');
    } else {
      alert('Please provide a rating and a comment.');
    }
  };

  const handleReportSeller = () => {
    if (confirm('Are you sure you want to report this seller?')) {
      alert('Thank you. This seller has been reported for review.');
    }
  };

  const handleFollowToggle = () => {
    onToggleFollow(seller.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <SmartImage
              src={seller.avatar || 'https://via.placeholder.com/64'}
              alt={seller.name}
              className="w-16 h-16 rounded-full border-4 border-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{seller.name}</h2>
                {seller.verified && (
                  <ShieldCheck size={24} className="text-yellow-300" title="Verified Seller" />
                )}
              </div>
              <p className="text-blue-100">Joined {joinedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Seller Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-400" size={20} />
              <span className="text-gray-600 text-sm font-medium">Rating</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
            <p className="text-xs text-gray-500">({approvedReviews.length} reviews)</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-blue-600" size={20} />
              <span className="text-gray-600 text-sm font-medium">Active Listings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeProducts.length}</p>
            <p className="text-xs text-gray-500">Products available</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-600" size={20} />
              <span className="text-gray-600 text-sm font-medium">Followers</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{seller.followers?.length || 0}</p>
            <p className="text-xs text-gray-500">People following</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-600" size={20} />
              <span className="text-gray-600 text-sm font-medium">Business Type</span>
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {seller.businessType?.replace('_', ' ') || 'Individual'}
            </p>
            <p className="text-xs text-gray-500">{seller.businessCategory || 'General'}</p>
          </div>
        </div>

        {/* Badges Section */}
        {seller.badges && seller.badges.length > 0 && (
          <div className="px-6 pt-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-3">Seller Badges</h3>
            <div className="flex flex-wrap gap-3">
              {seller.badges.map((badge) => (
                <BadgeDisplay key={badge.id} badge={badge} size="md" showLabel={true} />
              ))}
            </div>
          </div>
        )}

        {/* Contact & Action Buttons */}
        <div className="px-6 py-4 flex flex-wrap gap-3 border-b bg-gray-50">
          <button
            onClick={handleFollowToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              isFollowing
                ? 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Heart size={18} filled={isFollowing} />
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          {seller.contactPhone && (
            <a
              href={`tel:${seller.contactPhone}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
            >
              <Phone size={18} />
              Call Seller
            </a>
          )}

          {seller.email && (
            <a
              href={`mailto:${seller.email}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Mail size={18} />
              Email
            </a>
          )}

          <button
            onClick={handleReportSeller}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
          >
            <Flag size={18} />
            Report
          </button>

          <button
            onClick={() => {
              const sellerUrl = `${window.location.origin}${window.location.pathname}#/seller/${seller.id}`;
              
              if (navigator.share) {
                navigator.share({
                  title: `${seller.name}'s Shop on Pambo`,
                  text: `Check out ${seller.name}'s listings on Pambo Kenya`,
                  url: sellerUrl
                }).catch((err) => console.log('Share cancelled', err));
              } else if (navigator.clipboard) {
                // Copy to clipboard as fallback
                navigator.clipboard.writeText(sellerUrl)
                  .then(() => alert('Seller profile link copied to clipboard!'))
                  .catch(() => alert(`Share this seller: ${sellerUrl}`));
              } else {
                alert(`Share this seller: ${sellerUrl}`);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 transition"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b sticky top-[120px] bg-white z-10">
          <div className="flex">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-3 px-4 font-medium border-b-2 transition ${
                activeTab === 'about'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 px-4 font-medium border-b-2 transition ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Products ({activeProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 px-4 font-medium border-b-2 transition ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews ({approvedReviews.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Seller</h3>
                <p className="text-gray-700 leading-relaxed">
                  {seller.bio ||
                    `${seller.name} is a reliable seller on Pambo. They have been selling on our platform since ${joinedDate} with an impressive rating of ${averageRating} stars based on customer reviews.`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seller.businessName && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award size={18} className="text-blue-600" />
                      Business Name
                    </h4>
                    <p className="text-gray-700">{seller.businessName}</p>
                  </div>
                )}

                {seller.contactPhone && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Phone size={18} className="text-green-600" />
                      Phone
                    </h4>
                    <a
                      href={`tel:${seller.contactPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {seller.contactPhone}
                    </a>
                  </div>
                )}

                {seller.county && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-red-600" />
                      Location
                    </h4>
                    <p className="text-gray-700">{seller.county}</p>
                  </div>
                )}

                {seller.workingHours && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock size={18} className="text-orange-600" />
                      Working Hours
                    </h4>
                    <p className="text-gray-700">{seller.workingHours}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Why Buy From This Seller?</h4>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>✓ Verified seller with a {averageRating} star rating</li>
                      <li>✓ {approvedReviews.length} positive customer reviews</li>
                      <li>✓ {activeProducts.length} quality listings</li>
                      <li>✓ Trusted by {seller.followers?.length || 0}+ followers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Active Listings ({activeProducts.length})
              </h3>
              {activeProducts.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No active listings at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProducts.slice(0, 12).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => onProductClick?.(product)}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden border border-gray-200"
                    >
                      <div className="aspect-square bg-gray-200 overflow-hidden">
                        <SmartImage
                          src={product.image || 'https://via.placeholder.com/300'}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">
                          {product.title}
                        </h4>
                        <p className="text-lg font-bold text-gray-900">
                          KES {product.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                          <span>{product.county}</span>
                          {product.averageRating && (
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-400" fill="currentColor" />
                              {product.averageRating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Summary */}
              {approvedReviews.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-900">{averageRating}</p>
                      <div className="flex justify-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= Math.round(Number(averageRating))
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on {approvedReviews.length} reviews
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = approvedReviews.filter((r) => r.rating === rating).length;
                        const percentage = Math.round((count / approvedReviews.length) * 100);
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-12">
                              {rating} ★
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Add Review Form */}
              {isLoggedIn && currentUser.id !== seller.id && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-600" />
                    Share Your Experience
                  </h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={24}
                            className={`cursor-pointer transition-colors ${
                              star <= newRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill={star <= newRating ? 'currentColor' : 'none'}
                            onClick={() => setNewRating(star)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience with this seller... (Optional: mention specific product)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      Post Review
                    </button>
                  </form>
                </div>
              )}

              {!isLoggedIn && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Want to leave a review?</strong> Please log in to your account first.
                    </p>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Customer Reviews ({approvedReviews.length})
                </h4>
                {approvedReviews.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">
                      No reviews yet. Be the first to review this seller!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedReviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.author}</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={
                                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }
                                  fill="currentColor"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                            {isAdmin && onDeleteReview && (
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this review?')) {
                                    onDeleteReview(review.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                                title="Admin: Delete review"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
