import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Phone,
  Zap,
  Star,
  Package,
  Filter,
  Eye,
  UserPlus,
  UserMinus,
  Shield
} from 'lucide-react';
import { BulkSellingModal } from '../components/BulkSellingModal';
import { BulkOffering } from '../types';
import {
  adminModerateKenyaComment,
  adminModerateKenyaListing,
  adminModerateKenyaSeller,
  createKenyaListingComment,
  createKenyaWholesaleListing,
  followKenyaSeller,
  getKenyaFollowStatus,
  getKenyaListingComments,
  getKenyaSellerPage,
  getKenyaWholesaleListings,
  incrementKenyaListingViews,
  unfollowKenyaSeller,
  upsertKenyaSellerProfile
} from '../services/kenyaWholesaleService';

interface WholesaleHubProps {
  isLoggedIn: boolean;
  user: any;
  onOpenSubscription: () => void;
}

interface KenyaComment {
  id: string;
  offering_id: string;
  comment: string;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
}

interface SellerProfileView {
  sellerId: string;
  sellerName: string;
  contactPhone?: string;
  whatsappNumber?: string;
  businessLocation?: string;
  approval_status?: 'pending' | 'approved' | 'suspended' | 'rejected';
  followersCount: number;
  products: BulkOffering[];
}

export const WholesaleHub: React.FC<WholesaleHubProps> = ({
  isLoggedIn,
  user,
  onOpenSubscription
}) => {
  const [offerings, setOfferings] = useState<BulkOffering[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSellingModalOpen, setIsSellingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfileView | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [isFollowingSeller, setIsFollowingSeller] = useState(false);
  const [commentsByListing, setCommentsByListing] = useState<Record<string, KenyaComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openCommentsFor, setOpenCommentsFor] = useState<Record<string, boolean>>({});

  const categories = [
    'all',
    'electronics',
    'textiles',
    'furniture',
    'food',
    'cosmetics',
    'hardware',
    'auto-parts',
    'machinery'
  ];

  useEffect(() => {
    loadOfferings();
  }, [selectedCategory, searchTerm]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const result = await getKenyaWholesaleListings({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined,
        limit: 60
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to load offerings');
      }

      setOfferings(result.data?.listings || []);
    } catch (error) {
      console.error('Failed to load Kenya Wholesale Hub offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription =
    isLoggedIn && user?.subscriptionExpiry && user.subscriptionExpiry > Date.now();
  const isAdmin = user?.role === 'admin';

  const handleOpenSellerPage = async (sellerId: string) => {
    try {
      setSellerLoading(true);
      const sellerResponse = await getKenyaSellerPage(sellerId);
      if (!sellerResponse.success || !sellerResponse.data?.seller) {
        alert(sellerResponse.error || 'Failed to load seller page');
        return;
      }

      setSelectedSeller(sellerResponse.data.seller);

      if (isLoggedIn && user?.id) {
        const followStatus = await getKenyaFollowStatus(sellerId, user.id);
        setIsFollowingSeller(Boolean((followStatus as any).data?.isFollowing));
      } else {
        setIsFollowingSeller(false);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to load seller page');
    } finally {
      setSellerLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!selectedSeller || !isLoggedIn || !user?.id) {
      alert('Please login first to follow sellers.');
      return;
    }

    if (selectedSeller.sellerId === user.id) {
      alert('You cannot follow yourself.');
      return;
    }

    const response = isFollowingSeller
      ? await unfollowKenyaSeller(selectedSeller.sellerId, user.id)
      : await followKenyaSeller(selectedSeller.sellerId, user.id);

    if (!response.success) {
      alert(response.error || 'Failed to update follow status');
      return;
    }

    setIsFollowingSeller(!isFollowingSeller);
    setSelectedSeller((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        followersCount: Math.max(0, prev.followersCount + (isFollowingSeller ? -1 : 1))
      };
    });
  };

  const handleTrackView = async (listingId: string) => {
    await incrementKenyaListingViews(listingId);
    setOfferings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, viewsCount: (item.viewsCount || 0) + 1 } : item
      )
    );
  };

  const loadComments = async (listingId: string) => {
    const result = await getKenyaListingComments(listingId, isAdmin);
    if (!result.success) return;
    setCommentsByListing((prev) => ({
      ...prev,
      [listingId]: ((result as any).data?.comments || []) as KenyaComment[]
    }));
  };

  const toggleComments = async (listingId: string) => {
    const nextOpen = !openCommentsFor[listingId];
    setOpenCommentsFor((prev) => ({ ...prev, [listingId]: nextOpen }));
    if (nextOpen && !commentsByListing[listingId]) {
      await loadComments(listingId);
    }
  };

  const handlePostComment = async (listingId: string) => {
    if (!isLoggedIn || !user?.id) {
      alert('Please login to comment.');
      return;
    }

    const commentText = commentInputs[listingId]?.trim();
    if (!commentText) {
      alert('Please enter a comment.');
      return;
    }

    const result = await createKenyaListingComment(listingId, {
      commenterUserId: user.id,
      comment: commentText
    });

    if (!result.success) {
      alert(result.error || 'Failed to post comment');
      return;
    }

    setCommentInputs((prev) => ({ ...prev, [listingId]: '' }));
    alert('Comment submitted for moderation.');
    await loadComments(listingId);
  };

  const handleSellerStatus = async (status: 'pending' | 'approved' | 'suspended' | 'rejected') => {
    if (!selectedSeller) return;
    const notes = window.prompt('Admin note (optional):') || undefined;
    const response = await adminModerateKenyaSeller(selectedSeller.sellerId, status, notes);
    if (!response.success) {
      alert(response.error || 'Failed to update seller status');
      return;
    }
    alert(`Seller status updated to ${status}.`);
    await handleOpenSellerPage(selectedSeller.sellerId);
  };

  const handleListingModeration = async (
    listingId: string,
    status: 'pending' | 'approved' | 'rejected' | 'suspended'
  ) => {
    const notes = window.prompt('Admin moderation note (optional):') || undefined;
    const response = await adminModerateKenyaListing(listingId, status, notes);
    if (!response.success) {
      alert(response.error || 'Failed to moderate listing');
      return;
    }
    await loadOfferings();
  };

  const handleCommentModeration = async (
    commentId: string,
    status: 'pending' | 'approved' | 'rejected' | 'suspended',
    listingId: string
  ) => {
    const notes = window.prompt('Admin moderation note (optional):') || undefined;
    const response = await adminModerateKenyaComment(commentId, status, notes);
    if (!response.success) {
      alert(response.error || 'Failed to moderate comment');
      return;
    }
    await loadComments(listingId);
  };

  const handlePostListing = async (payload: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    minOrderQuantity: number;
    photos?: string[];
    videos?: string[];
  }) => {
    if (!isLoggedIn || !user?.id) {
      alert('Please login first.');
      return;
    }

    const profileResult = await upsertKenyaSellerProfile({
      sellerId: user.id,
      sellerName: user.businessName || user.name,
      contactPhone: user.phone,
      whatsappNumber: user.phone,
      businessLocation: user.county || 'Kenya'
    });

    if (!profileResult.success) {
      alert(profileResult.error || 'Failed to set seller profile');
      return;
    }

    const listingResult = await createKenyaWholesaleListing({
      sellerId: user.id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      quantity: payload.quantity,
      unit: payload.unit,
      pricePerUnit: payload.pricePerUnit,
      minOrderQuantity: payload.minOrderQuantity,
      sellerName: user.businessName || user.name,
      sellerPhone: user.phone,
      sellerEmail: user.email,
      photos: payload.photos || [],
      videos: payload.videos || []
    });

    if (!listingResult.success) {
      alert(listingResult.error || 'Failed to post listing');
      return;
    }

    alert(
      'Listing submitted successfully. It may require admin moderation before public visibility.'
    );
    setIsSellingModalOpen(false);
    await loadOfferings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F0] to-[#FAFAFA] text-[15px]">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-[#FF6700] to-[#FF8533] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-1.5">Kenya Wholesale Hub</h1>
          <p className="text-base md:text-lg text-orange-100 mb-4">
            Kenya-to-Kenya wholesale marketplace for local sellers and buyers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 text-sm">
            <div className="flex items-center gap-2">
              <Zap size={20} />
              <span>Local Bulk Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={20} />
              <span>Approved Kenya Sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={20} />
              <span>Bulk Orders Across Kenya</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-[#BDBDBD]" size={20} />
            <input
              type="text"
              placeholder="Search products, sellers, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF6700] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="card-alibaba-elevated sticky top-3">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-[#212121]">
                <Filter size={20} /> Filters
              </h3>

              <div>
                <h4 className="font-semibold text-sm text-[#424242] mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[#FFF5F0] p-2 rounded transition"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 accent-[#FF6700]"
                      />
                      <span className="text-sm text-[#424242] capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-3 bg-[#FFF5F0] rounded-lg border border-[#FF6700]/20">
                <h4 className="font-semibold text-sm text-[#FF6700] mb-2 flex items-center gap-2">
                  <MessageSquare size={16} /> Contact Sellers
                </h4>
                <div>
                  <p className="text-xs text-[#E55100] font-medium">✅ 100% FREE for all buyers!</p>
                  <p className="text-xs text-[#424242] mt-2">
                    Call or WhatsApp sellers directly. Payment is handled between buyer and seller
                    (Jiji-style).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSellingModalOpen(true)}
                className="w-full mt-3 bg-[#FF6700] hover:bg-[#E55100] text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Post Wholesale Listing
              </button>
            </div>
          </div>

          {/* Offerings Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6700]"></div>
                <p className="mt-4 text-[#424242]">Loading Kenya wholesale sellers...</p>
              </div>
            ) : offerings.length > 0 ? (
              <div className="space-y-3">
                {offerings.map((offering) => (
                  <OfferingCard
                    key={offering.id}
                    offering={offering}
                    hasSubscription={hasActiveSubscription}
                    onOpenSubscription={onOpenSubscription}
                    onViewSellerPage={() => handleOpenSellerPage(offering.sellerId)}
                    onTrackView={() => handleTrackView(offering.id)}
                    comments={commentsByListing[offering.id] || []}
                    commentsOpen={Boolean(openCommentsFor[offering.id])}
                    onToggleComments={() => toggleComments(offering.id)}
                    commentInput={commentInputs[offering.id] || ''}
                    onCommentInputChange={(value) =>
                      setCommentInputs((prev) => ({ ...prev, [offering.id]: value }))
                    }
                    onPostComment={() => handlePostComment(offering.id)}
                    isAdmin={isAdmin}
                    onModerateListing={(status) => handleListingModeration(offering.id, status)}
                    onModerateComment={(commentId, status) =>
                      handleCommentModeration(commentId, status, offering.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card-alibaba-elevated">
                <Package size={48} className="mx-auto text-[#BDBDBD] mb-4" />
                <p className="text-[#424242] mb-4">No Kenya wholesale sellers found</p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="link-primary font-semibold">
                    Clear search
                  </button>
                )}
              </div>
            )}

            {sellerLoading && (
              <div className="mt-5 card-alibaba-elevated p-5 text-center text-[#424242]">
                Loading seller page...
              </div>
            )}

            {selectedSeller && !sellerLoading && (
              <div className="mt-6 card-alibaba-elevated p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[#212121]">
                      {selectedSeller.sellerName || 'Seller'}
                    </h3>
                    <p className="text-sm text-[#424242]">Public Seller Page</p>
                    <p className="text-xs text-[#757575] mt-1">
                      Followers: {selectedSeller.followersCount || 0}
                    </p>
                    <p className="text-xs text-[#757575] mt-1">
                      Phone: {selectedSeller.contactPhone || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSeller(null)}
                    className="px-4 py-2 rounded-lg border border-[#EEEEEE] text-[#424242] hover:bg-[#FAFAFA]"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                  <a
                    href={`tel:${selectedSeller.contactPhone || ''}`}
                    className="py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-[#FF6700] hover:bg-[#E55100] text-white"
                  >
                    <Phone size={16} /> Call Seller
                  </a>
                  <a
                    href={`https://wa.me/${(selectedSeller.whatsappNumber || selectedSeller.contactPhone || '').replace(/^0/, '254')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FA24E] text-white"
                  >
                    <MessageSquare size={16} /> WhatsApp Seller
                  </a>
                </div>

                {isLoggedIn && user?.id !== selectedSeller.sellerId && (
                  <button
                    onClick={handleFollowToggle}
                    className="mb-5 px-4 py-2 rounded-lg border border-[#EEEEEE] text-[#212121] hover:bg-[#FAFAFA] font-semibold flex items-center gap-2"
                  >
                    {isFollowingSeller ? <UserMinus size={16} /> : <UserPlus size={16} />}
                    {isFollowingSeller ? 'Unfollow Seller' : 'Follow Seller'}
                  </button>
                )}

                {isAdmin && (
                  <div className="mb-5 p-3 bg-[#FAFAFA] rounded-lg border border-[#EEEEEE]">
                    <p className="text-sm font-semibold text-[#212121] mb-2 flex items-center gap-2">
                      <Shield size={16} /> Admin Seller Moderation
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSellerStatus('approved')}
                        className="px-3 py-1.5 text-sm rounded bg-green-100 text-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleSellerStatus('pending')}
                        className="px-3 py-1.5 text-sm rounded bg-yellow-100 text-yellow-700"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleSellerStatus('suspended')}
                        className="px-3 py-1.5 text-sm rounded bg-orange-100 text-orange-700"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleSellerStatus('rejected')}
                        className="px-3 py-1.5 text-sm rounded bg-red-100 text-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                <h4 className="font-semibold text-[#212121] mb-3">Seller Products</h4>
                <div className="space-y-2">
                  {selectedSeller.products.map((item) => (
                    <div
                      key={item.id}
                      className="border border-[#EEEEEE] rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-[#212121]">{item.title}</p>
                        <p className="text-xs text-[#757575]">
                          {item.category} • {item.description}
                        </p>
                      </div>
                      <p className="font-bold text-[#FF6700]">
                        KES {item.pricePerUnit?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Selling Modal */}
      {isSellingModalOpen && (
        <BulkSellingModal
          isOpen={isSellingModalOpen}
          onClose={() => setIsSellingModalOpen(false)}
          onSubmit={handlePostListing}
        />
      )}
    </div>
  );
};

interface OfferingCardProps {
  offering: BulkOffering;
  hasSubscription: boolean;
  onOpenSubscription: () => void;
  onViewSellerPage: () => void;
  onTrackView: () => void;
  comments: KenyaComment[];
  commentsOpen: boolean;
  onToggleComments: () => void;
  commentInput: string;
  onCommentInputChange: (value: string) => void;
  onPostComment: () => void;
  isAdmin: boolean;
  onModerateListing: (status: 'pending' | 'approved' | 'rejected' | 'suspended') => void;
  onModerateComment: (
    commentId: string,
    status: 'pending' | 'approved' | 'rejected' | 'suspended'
  ) => void;
}

const OfferingCard: React.FC<OfferingCardProps> = ({
  offering,
  onViewSellerPage,
  onTrackView,
  comments,
  commentsOpen,
  onToggleComments,
  commentInput,
  onCommentInputChange,
  onPostComment,
  isAdmin,
  onModerateListing,
  onModerateComment
}) => {
  const handleContact = (method: 'whatsapp' | 'phone') => {
    if (method === 'whatsapp' && offering.sellerPhone) {
      const phoneNumber = offering.sellerPhone.startsWith('0')
        ? '254' + offering.sellerPhone.substring(1)
        : offering.sellerPhone;
      const message = encodeURIComponent(
        `Hi, I'm interested in your bulk offering: ${offering.title}. Can we discuss pricing and MOQ?`
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } else if (method === 'phone' && offering.sellerPhone) {
      const phoneNumber = offering.sellerPhone.startsWith('+')
        ? offering.sellerPhone
        : '+254' + offering.sellerPhone.substring(1);
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  return (
    <div className="card-alibaba-elevated hover-lift">
      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-[#212121]">{offering.title}</h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs md:text-sm text-[#424242]">
              {offering.category && <span className="badge-primary">{offering.category}</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl md:text-2xl font-bold text-[#FF6700]">
              KES {offering.pricePerUnit?.toLocaleString()}
            </p>
            <p className="text-xs text-[#757575]">per {offering.unit || 'unit'}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#424242] mb-3 line-clamp-2 text-sm">{offering.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4 text-xs md:text-sm">
          <div className="bg-[#FAFAFA] p-2.5 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Min Order</p>
            <p className="font-bold text-[#212121]">
              {offering.minOrderQuantity || 0} {offering.unit}
            </p>
          </div>
          <div className="bg-[#FAFAFA] p-2.5 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Stock</p>
            <p className="font-bold text-[#212121]">
              {offering.quantityAvailable?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-[#FAFAFA] p-2.5 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Lead Time</p>
            <p className="font-bold text-[#212121]">{offering.leadTimeDays || 3} days</p>
          </div>
          <div className="bg-[#FAFAFA] p-2.5 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Inquiries</p>
            <p className="font-bold text-[#212121]">{offering.inquiriesCount || 0}</p>
          </div>
          <div className="bg-[#FAFAFA] p-2.5 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Views</p>
            <p className="font-bold text-[#212121]">{offering.viewsCount || 0}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-4 p-3 bg-[#FAFAFA] rounded-lg border border-[#EEEEEE]">
            <p className="text-xs font-semibold text-[#212121] mb-2 flex items-center gap-2">
              <Shield size={14} /> Admin Listing Moderation
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onModerateListing('approved')}
                className="px-2.5 py-1 text-xs rounded bg-green-100 text-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => onModerateListing('pending')}
                className="px-2.5 py-1 text-xs rounded bg-yellow-100 text-yellow-700"
              >
                Pending
              </button>
              <button
                onClick={() => onModerateListing('suspended')}
                className="px-2.5 py-1 text-xs rounded bg-orange-100 text-orange-700"
              >
                Suspend
              </button>
              <button
                onClick={() => onModerateListing('rejected')}
                className="px-2.5 py-1 text-xs rounded bg-red-100 text-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Seller Info */}
        <div className="divider-alibaba pt-4 mb-4">
          <p className="text-sm text-[#424242] mb-2">
            <strong>Seller:</strong> {offering.sellerName}
          </p>
          <p className="text-xs text-[#757575] mb-2">
            <strong>Followers:</strong> {offering.followersCount || 0}
          </p>
          {offering.sellerVerified && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F6FFED] text-[#52C41A] px-2 py-1 rounded font-semibold">
              <Star size={14} /> Verified Supplier
            </span>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleContact('whatsapp')}
            className="py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FA24E] text-white"
          >
            <MessageSquare size={16} />
            WhatsApp
          </button>
          <button
            onClick={() => handleContact('phone')}
            className="py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-[#FF6700] hover:bg-[#E55100] text-white"
          >
            <Phone size={16} />
            Call
          </button>
        </div>

        <button
          onClick={onViewSellerPage}
          className="w-full mt-3 py-2 px-4 rounded-lg border border-[#EEEEEE] text-[#424242] font-semibold hover:bg-[#FAFAFA]"
        >
          View Seller Page
        </button>

        <button
          onClick={onTrackView}
          className="w-full mt-2 py-2 px-4 rounded-lg border border-[#EEEEEE] text-[#424242] font-semibold hover:bg-[#FAFAFA] flex items-center justify-center gap-2"
        >
          <Eye size={16} /> Count View
        </button>

        <div className="mt-3 text-xs text-[#757575] flex items-center justify-between">
          <span>Photos: {Array.isArray(offering.photos) ? offering.photos.length : 0}/10</span>
          <span>Videos: {Array.isArray(offering.videos) ? offering.videos.length : 0}/2</span>
          <span>Comments: {offering.commentsCount || 0}</span>
        </div>

        <div className="mt-4">
          <button
            onClick={onToggleComments}
            className="text-sm font-semibold text-[#FF6700] hover:text-[#E55100]"
          >
            {commentsOpen ? 'Hide Comments' : 'Show Comments'}
          </button>

          {commentsOpen && (
            <div className="mt-3 space-y-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-[#EEEEEE] rounded p-2.5">
                    <p className="text-sm text-[#212121]">{comment.comment}</p>
                    <p className="text-xs text-[#757575] mt-1">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                    {isAdmin && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => onModerateComment(comment.id, 'approved')}
                          className="px-2 py-1 text-xs rounded bg-green-100 text-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onModerateComment(comment.id, 'pending')}
                          className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700"
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => onModerateComment(comment.id, 'suspended')}
                          className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => onModerateComment(comment.id, 'rejected')}
                          className="px-2 py-1 text-xs rounded bg-red-100 text-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#757575]">No approved comments yet.</p>
              )}

              <div className="space-y-2">
                <textarea
                  value={commentInput}
                  onChange={(e) => onCommentInputChange(e.target.value)}
                  rows={2}
                  placeholder="Write a comment to the seller..."
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6700]"
                />
                <button
                  onClick={onPostComment}
                  className="px-3 py-1.5 text-sm rounded bg-[#FF6700] hover:bg-[#E55100] text-white"
                >
                  Post Comment
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-[#52C41A] font-medium mt-3">
          ✅ Contact is FREE for all buyers
        </p>
      </div>
    </div>
  );
};
