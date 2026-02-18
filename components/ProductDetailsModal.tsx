import React, { useState, useMemo } from 'react';
import { X, ShieldCheck, MapPin, Star, MessageSquare, Play, ImageIcon, Send, AlertTriangle, Download, UserPlus, Phone } from 'lucide-react';
import { Product, User, Review, ListingComment } from '../types';
import { SERVICE_CATEGORIES } from '../constants';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
  sellers: User[];
    onAddReview: (listingId: string, sellerId: string, review: Omit<Review, 'date' | 'author' | 'status'>) => void | Promise<void>;
    listingComments: Record<string, ListingComment[]>;
    onAddComment: (productId: string, comment: string) => void | Promise<void>;
  isLoggedIn: boolean;
  currentUser: User;
  onToggleFollow: (sellerId: string) => void;
}

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={20}
                    className={`cursor-pointer transition-colors ${
                        (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                />
            ))}
        </div>
    );
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose, onContact, sellers, onAddReview, listingComments, onAddComment, isLoggedIn, currentUser, onToggleFollow }) => {
  const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [newListingComment, setNewListingComment] = useState('');

  const seller = useMemo(() => {
    if (!product) return null;
    return sellers.find(s => s.id === product.sellerId);
  }, [product, sellers]);

  const approvedReviews = useMemo(() => {
    return seller?.reviews?.filter(r => r.status === 'approved') || [];
  }, [seller]);
  
  const averageRating = useMemo(() => {
    if (!seller || !approvedReviews || approvedReviews.length === 0) return 0;
    const total = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
    return total / approvedReviews.length;
  }, [seller, approvedReviews]);
  
  const isFollowing = useMemo(() => {
      return currentUser && seller && currentUser.following.includes(seller.id);
  }, [currentUser, seller]);


  if (!isOpen || !product || !seller) return null;

  const isService = SERVICE_CATEGORIES.includes(product.category);
    const commentsForListing = (listingComments[product.id] || []).filter(comment => comment.status === 'approved');
    const paymentArrangementLabel = product.paymentArrangement === 'mpesa'
        ? 'M-Pesa'
        : product.paymentArrangement === 'cash_on_delivery'
            ? 'Cash on Delivery'
            : product.paymentArrangement === 'bank_transfer'
                ? 'Bank Transfer'
                : 'Jiji Direct (Buyer & Seller Arrange)';

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating > 0 && newComment.trim() !== '') {
                onAddReview(product.id, seller.id, { rating: newRating, comment: newComment });
        setNewRating(0);
        setNewComment('');
    } else {
        alert('Please provide a rating and a comment.');
    }
  };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListingComment.trim()) return;
        onAddComment(product.id, newListingComment);
        setNewListingComment('');
    };

  const handleReport = () => {
    if (confirm('Are you sure you want to report this listing to an administrator?')) {
        alert('Thank you. This listing has been reported for review.');
        onClose();
    }
  };
  
  const handleFollowClick = () => {
      if(!isLoggedIn) {
          alert("Please log in to follow sellers.");
          return;
      }
      onToggleFollow(seller.id);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
        >
            <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row overflow-hidden flex-1">
            {/* Media Section */}
            <div className="md:w-1/2 bg-gray-100 flex flex-col">
                <div className="w-full aspect-square md:aspect-[4/3] relative bg-black">
                    {product.video && product.video.length > 0 ? (
                        <video 
                            src={product.video[0]} 
                            controls 
                            className="w-full h-full object-contain"
                            poster={product.image}
                        />
                    ) : product.image ? (
                        <img src={product.image} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon size={64} className="text-gray-400" />
                        </div>
                    )}
                </div>
                
                {product.gallery && product.gallery.length > 0 && (
                    <div className="p-2 flex gap-2 overflow-x-auto bg-gray-900 scrollbar-hide">
                        {product.image && (
                            <div className="w-16 h-16 rounded border-2 border-orange-500 overflow-hidden shrink-0 cursor-pointer opacity-100">
                                <img src={product.image} loading="lazy" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {product.gallery.map((img, i) => (
                            <div key={i} className="w-16 h-16 rounded border border-gray-600 overflow-hidden shrink-0 cursor-pointer hover:border-white transition">
                                <img src={img} loading="lazy" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                    <div>
                         {product.verified && (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 w-fit mb-2">
                                <ShieldCheck size={12} /> Verified by Pambo
                            </span>
                         )}
                         <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{product.title}</h2>
                         <div className="text-gray-500 text-sm flex items-center gap-2">
                            {product.isDigital ? (
                                <>
                                    <Download size={14} /> Instant Download
                                </>
                            ) : (
                                <>
                                    <MapPin size={14} />
                                    {product.town && product.county ? `${product.town}, ${product.county}` : 'Kenya'}
                                </>
                            )}
                         </div>
                    </div>
                    {product.price && (
                        <div className="text-right shrink-0 ml-4">
                            <p className="text-2xl font-bold text-orange-600">
                                {product.currency} {product.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                                {isService ? 'Starting Rate' : 'Per Unit'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-gray-100 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full object-cover relative border-2 border-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                {product.sellerName}
                            </p>
                            <div className="flex items-center text-xs">
                                <Star size={14} className="text-yellow-400 mr-1" fill="currentColor"/>
                                <span className="font-bold text-gray-700">{averageRating.toFixed(1)}</span>
                                <span className="text-gray-400 ml-1">({approvedReviews.length || 0} reviews)</span>
                            </div>
                        </div>
                    </div>
                    {seller.id !== currentUser.id && (
                        <button 
                            onClick={handleFollowClick}
                            className={`ml-auto text-sm font-bold py-1.5 px-4 rounded-md flex items-center gap-2 transition ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            <UserPlus size={14}/>
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="prose prose-sm text-gray-600 mb-6">
                    <h3 className="text-gray-900 font-bold mb-2">Description</h3>
                    <p>{product.description}</p>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                    <div className="text-sm text-gray-700">
                        Payment Arrangement: <span className="font-semibold">{paymentArrangementLabel}</span>
                    </div>
                    {product.seller_phone && (
                        <div className="text-sm text-gray-700 flex items-center gap-2">
                            <Phone size={14} /> Seller Number: <span className="font-semibold">{product.seller_phone}</span>
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-gray-900 font-bold mb-4">Reviews ({approvedReviews.length || 0})</h3>
                    {isLoggedIn ? (
                         <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-bold mb-2">Leave a Review</h4>
                            <StarRatingInput rating={newRating} setRating={setNewRating} />
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-orange-500 outline-none mt-2"
                                rows={2}
                                placeholder="Share your experience..."
                            />
                             <button type="submit" className="bg-orange-600 text-white font-semibold text-sm py-2 px-4 rounded-md mt-2 hover:bg-orange-700 flex items-center gap-2">
                                <Send size={14}/> Submit Review
                            </button>
                        </form>
                    ) : (
                        <p className="text-sm text-gray-500 mb-4">You must be logged in to leave a review.</p>
                    )}
                   
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                        {approvedReviews && approvedReviews.length > 0 ? (
                            approvedReviews.map((review, index) => (
                                <div key={index} className="text-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-gray-800">{review.author}</p>

                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} fill="currentColor" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mt-1">{review.comment}</p>
                                    <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No reviews yet.</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                    <h3 className="text-gray-900 font-bold mb-4">Comments ({commentsForListing.length})</h3>
                    {isLoggedIn ? (
                        <form onSubmit={handleCommentSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <textarea
                                value={newListingComment}
                                onChange={(e) => setNewListingComment(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-orange-500 outline-none"
                                rows={2}
                                placeholder="Leave a quick comment for the seller..."
                            />
                            <button type="submit" className="bg-gray-900 text-white font-semibold text-sm py-2 px-4 rounded-md mt-2 hover:bg-black flex items-center gap-2">
                                <Send size={14}/> Post Comment
                            </button>
                        </form>
                    ) : (
                        <p className="text-sm text-gray-500 mb-4">You must be logged in to comment.</p>
                    )}

                    <div className="space-y-3 max-h-44 overflow-y-auto pr-2">
                        {commentsForListing.length > 0 ? (
                            commentsForListing.map((comment, index) => (
                                <div key={`${comment.date}-${index}`} className="text-sm bg-gray-50 rounded-md p-3 border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-800">{comment.author}</p>
                                        <p className="text-xs text-gray-400">{comment.date}</p>
                                    </div>
                                    <p className="text-gray-700 mt-1">{comment.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No comments yet.</p>
                        )}
                    </div>
                </div>
                
                <div className="mt-auto pt-6 space-y-3">
                    {/* Contact and Report Actions */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onContact}
                            className={`flex-1 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                                isService || product.isWholesale
                                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            <MessageSquare size={18} /> {isService ? 'Request Quote' : 'Contact Supplier'}
                        </button>
                        <button 
                            onClick={handleReport}
                            title="Report this listing"
                            className="p-3 border border-gray-300 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition"
                        >
                            <AlertTriangle size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};