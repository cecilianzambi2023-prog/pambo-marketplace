import React, { useEffect, useMemo, useState } from 'react';
import {
  Leaf,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Heart,
  Eye,
  Shield,
  ChevronRight,
  Plus,
  UserCircle,
  Sparkles
} from 'lucide-react';
import { secondhandService } from '../services/secondhandService';
import { SecondhandListingModal } from '../components/SecondhandListingModal';

interface SecondhandHubProps {
  user: any;
  isAdmin: boolean;
  onFollowToggle: (sellerId: string) => void;
  isFollowing: (sellerId: string) => boolean;
  onLoginRequired: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  group_name: string;
  sort_order: number;
  is_active: boolean;
}

interface SellerProfile {
  user_id: string;
  display_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  total_views: number;
  verified: boolean;
  listing_count: number;
}

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  condition: string;
  category: string | null;
  county: string | null;
  city: string | null;
  photos: string[] | null;
  videos: string[] | null;
  status: string;
  moderation_status: string;
  views: number;
  created_at: string;
  seller?: SellerProfile;
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  used: 'Used',
  fair: 'Fair'
};

export const SecondhandHub: React.FC<SecondhandHubProps> = ({
  user,
  isAdmin,
  onFollowToggle,
  isFollowing,
  onLoginRequired
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);

  const groupedCategories = useMemo(() => {
    return categories
      .filter((cat) => cat.is_active)
      .reduce<Record<string, Category[]>>((acc, cat) => {
        acc[cat.group_name] = acc[cat.group_name] || [];
        acc[cat.group_name].push(cat);
        return acc;
      }, {});
  }, [categories]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catData, listingData] = await Promise.all([
        secondhandService.getCategories(),
        secondhandService.getListings({
          category: selectedCategory || undefined,
          condition: selectedCondition || undefined,
          county: selectedCounty || undefined,
          search: searchTerm || undefined
        })
      ]);
      setCategories(catData || []);
      setListings(listingData || []);

      if (user && listingData?.length) {
        const favPairs = await Promise.all(
          listingData.map(async (listing) => {
            const status = await secondhandService.getFavoriteStatus(listing.id, user.id);
            return [listing.id, status] as const;
          })
        );
        const nextMap: Record<string, boolean> = {};
        favPairs.forEach(([listingId, status]) => {
          nextMap[listingId] = status;
        });
        setFavoriteMap(nextMap);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedCondition, selectedCounty, searchTerm]);

  const handleToggleFavorite = async (listingId: string) => {
    if (!user) {
      onLoginRequired();
      return;
    }

    if (favoriteMap[listingId]) {
      await secondhandService.removeFavorite(listingId, user.id);
      setFavoriteMap((prev) => ({ ...prev, [listingId]: false }));
    } else {
      await secondhandService.addFavorite(listingId, user.id);
      setFavoriteMap((prev) => ({ ...prev, [listingId]: true }));
    }
  };

  const handleViewListing = async (listing: Listing) => {
    setActiveListing(listing);
    await secondhandService.addView(listing.id);

    const comments = await secondhandService.getComments(listing.id);
    setCommentsMap((prev) => ({ ...prev, [listing.id]: comments || [] }));
  };

  const handlePostComment = async (listingId: string) => {
    if (!user) {
      onLoginRequired();
      return;
    }

    const content = (commentDraft[listingId] || '').trim();
    if (!content) return;

    await secondhandService.addComment({
      listingId,
      userId: user.id,
      content
    });

    const comments = await secondhandService.getComments(listingId);
    setCommentsMap((prev) => ({ ...prev, [listingId]: comments || [] }));
    setCommentDraft((prev) => ({ ...prev, [listingId]: '' }));
  };

  const handleModerateListing = async (listingId: string, status: string) => {
    await secondhandService.updateListingStatus(listingId, status);
    await loadData();
  };

  const handleModerateComment = async (commentId: string, status: string, listingId: string) => {
    await secondhandService.updateCommentStatus(commentId, status);
    const comments = await secondhandService.getComments(listingId);
    setCommentsMap((prev) => ({ ...prev, [listingId]: comments || [] }));
  };

  const handleCreateListing = async (payload: {
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
    if (!user) {
      onLoginRequired();
      return;
    }

    await secondhandService.createListing({
      ...payload,
      userId: user.id,
      sellerName: user.name,
      sellerPhone: user.phone || undefined,
      sellerWhatsapp: user.phone || undefined,
      sellerEmail: user.email || undefined
    });

    setIsModalOpen(false);
    await loadData();
  };

  const handleContactSeller = (method: 'phone' | 'whatsapp' | 'email', listing: Listing) => {
    const phone = listing.seller?.phone || listing.seller?.whatsapp;
    const email = listing.seller?.email;

    if (method === 'phone' && phone) {
      window.open(`tel:${phone}`);
    }
    if (method === 'whatsapp' && phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`);
    }
    if (method === 'email' && email) {
      window.open(`mailto:${email}`);
    }
  };

  const handleOpenSeller = async (listing: Listing) => {
    const profile = await secondhandService.getSellerProfile(listing.user_id);
    setSelectedSeller(profile || null);
  };

  const handleCategoryAction = async (category: Category, action: 'toggle' | 'edit' | 'delete') => {
    if (!isAdmin) return;

    if (action === 'toggle') {
      await secondhandService.updateCategory(category.id, { is_active: !category.is_active });
      await loadData();
      return;
    }

    if (action === 'delete') {
      if (!window.confirm('Delete this category?')) return;
      await secondhandService.deleteCategory(category.id);
      await loadData();
      return;
    }

    const name = window.prompt('Category name', category.name) || category.name;
    const group = window.prompt('Group name', category.group_name) || category.group_name;
    const sortOrder = Number(
      window.prompt('Sort order', String(category.sort_order)) || category.sort_order
    );
    await secondhandService.updateCategory(category.id, {
      name,
      group_name: group,
      sort_order: sortOrder
    });
    await loadData();
  };

  const handleCreateCategory = async () => {
    const name = window.prompt('Category name');
    if (!name) return;

    const group = window.prompt('Group name') || 'Other';
    const sortOrder = Number(window.prompt('Sort order (number)', '0') || 0);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await secondhandService.createCategory({
      name,
      slug,
      group_name: group,
      sort_order: sortOrder,
      is_active: true
    });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 text-[15px]">
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-green-700 to-lime-700 text-white">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-7">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full text-sm">
                <Leaf size={16} /> Kenya Secondhand Hub
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mt-2 leading-tight">
                Buy &amp; sell secondhand items locally
              </h1>
              <p className="text-emerald-100 mt-2 text-sm md:text-base max-w-2xl">
                A C2C marketplace for Kenya. Meet safely, inspect items, and keep cash in your
                community.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-emerald-700 px-4 py-2.5 rounded-lg font-semibold shadow hover:bg-emerald-50"
                >
                  <Plus size={18} /> Post a listing
                </button>
                <button className="flex items-center gap-2 border border-white/40 px-4 py-2.5 rounded-lg hover:bg-white/10">
                  <Shield size={18} /> Safety tips
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/20">
              <div className="flex items-center gap-3">
                <Sparkles size={18} />
                <span className="font-semibold">Trusted peer-to-peer trade</span>
              </div>
              <ul className="mt-3 space-y-2 text-emerald-100 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} /> Local meetups only, no shipping
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} /> Inspect items before paying
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} /> Verified seller badges for trusted profiles
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="text-sm font-semibold text-gray-600">Search</label>
            <div className="mt-2 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search titles, descriptions"
                className="flex-1 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="">All categories</option>
              {categories
                .filter((cat) => cat.is_active)
                .map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="">All conditions</option>
              {Object.entries(conditionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">County</label>
            <div className="mt-2 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
              <MapPin size={16} className="text-gray-400" />
              <input
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                placeholder="Nairobi, Mombasa"
                className="flex-1 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Filter size={16} /> Category groups
            </div>
            <div className="mt-4 space-y-4 text-sm">
              {Object.entries(groupedCategories).map(([group, items]: [string, Category[]]) => (
                <div key={group}>
                  <p className="font-semibold text-gray-700">{group}</p>
                  <div className="mt-2 space-y-1">
                    {items
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`block w-full text-left px-3 py-1 rounded-lg ${
                            selectedCategory === cat.slug
                              ? 'bg-emerald-100 text-emerald-700 font-semibold'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-700 text-white rounded-2xl p-4 shadow">
            <p className="font-semibold">Safety checklist</p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-100">
              <li>Meet in a public place</li>
              <li>Inspect the item before payment</li>
              <li>Use trusted payment methods</li>
              <li>Bring a friend if possible</li>
            </ul>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-2xl p-4 shadow space-y-3">
              <p className="font-semibold text-emerald-700">Admin: Categories</p>
              <button
                onClick={handleCreateCategory}
                className="w-full bg-emerald-600 text-white px-3 py-2 rounded-lg"
              >
                Add category
              </button>
              <div className="max-h-56 overflow-auto space-y-2 text-sm">
                {categories.map((cat) => (
                  <div key={cat.id} className="border border-gray-200 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{cat.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCategoryAction(cat, 'toggle')}
                        className="text-xs px-2 py-1 border rounded-lg"
                      >
                        {cat.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleCategoryAction(cat, 'edit')}
                        className="text-xs px-2 py-1 border rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCategoryAction(cat, 'delete')}
                        className="text-xs px-2 py-1 border rounded-lg text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 shadow text-center text-gray-500">
              Loading listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow text-center text-gray-500">
              No listings yet. Be the first to post!
            </div>
          ) : (
            listings.map((listing) => (
              <article key={listing.id} className="bg-white rounded-2xl p-4 shadow space-y-3">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-48 h-36 bg-emerald-50 rounded-xl flex items-center justify-center overflow-hidden">
                    {listing.photos?.[0] ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Leaf size={32} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{listing.title}</h3>
                        <p className="text-sm text-gray-500">
                          {listing.county || 'Kenya'}
                          {listing.city ? ` • ${listing.city}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(listing.id)}
                        className={`p-2 rounded-full border ${favoriteMap[listing.id] ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'border-gray-200 text-gray-400'}`}
                      >
                        <Heart size={18} fill={favoriteMap[listing.id] ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <p className="text-gray-600 mt-1.5 line-clamp-3 text-sm">
                      {listing.description || 'No description provided.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs md:text-sm">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                        {listing.currency} {listing.price.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        {conditionLabels[listing.condition] || listing.condition}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                        <Eye size={14} /> {listing.views}
                      </span>
                      {listing.moderation_status !== 'approved' && isAdmin && (
                        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                          {listing.moderation_status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => handleContactSeller('phone', listing)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700"
                      >
                        <Phone size={16} /> Call
                      </button>
                      <button
                        onClick={() => handleContactSeller('whatsapp', listing)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700"
                      >
                        <MessageSquare size={16} /> WhatsApp
                      </button>
                      <button
                        onClick={() => handleContactSeller('email', listing)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700"
                      >
                        <Mail size={16} /> Email
                      </button>
                      <button
                        onClick={() => handleViewListing(listing)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleOpenSeller(listing)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600"
                      >
                        <UserCircle size={16} /> Seller
                      </button>
                    </div>
                    {isAdmin && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleModerateListing(listing.id, 'approved')}
                          className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateListing(listing.id, 'rejected')}
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {activeListing?.id === listing.id && (
                  <div className="bg-emerald-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <MessageSquare size={16} /> Comments
                    </div>
                    <div className="space-y-3">
                      {(commentsMap[listing.id] || []).map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-white rounded-lg p-3 border border-emerald-100"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-700">
                              {comment.author_name || 'Anonymous'}
                            </p>
                            {isAdmin && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleModerateComment(comment.id, 'approved', listing.id)
                                  }
                                  className="text-xs text-emerald-600"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleModerateComment(comment.id, 'rejected', listing.id)
                                  }
                                  className="text-xs text-red-500"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={commentDraft[listing.id] || ''}
                        onChange={(e) =>
                          setCommentDraft((prev) => ({ ...prev, [listing.id]: e.target.value }))
                        }
                        placeholder="Ask a question..."
                        className="flex-1 border border-emerald-200 rounded-lg px-3 py-2"
                      />
                      <button
                        onClick={() => handlePostComment(listing.id)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      {selectedSeller && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                {selectedSeller.avatar_url ? (
                  <img
                    src={selectedSeller.avatar_url}
                    alt={selectedSeller.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle size={32} className="text-emerald-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedSeller.display_name}</h3>
                <p className="text-sm text-gray-500">{selectedSeller.location || 'Kenya'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>{selectedSeller.bio || 'No bio yet.'}</p>
              <p>Listings: {selectedSeller.listing_count}</p>
              <p>Profile views: {selectedSeller.total_views}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSeller.phone && (
                <button
                  onClick={() => window.open(`tel:${selectedSeller.phone}`)}
                  className="px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700"
                >
                  Call
                </button>
              )}
              {selectedSeller.whatsapp && (
                <button
                  onClick={() =>
                    window.open(`https://wa.me/${selectedSeller.whatsapp.replace(/\D/g, '')}`)
                  }
                  className="px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700"
                >
                  WhatsApp
                </button>
              )}
              {selectedSeller.email && (
                <button
                  onClick={() => window.open(`mailto:${selectedSeller.email}`)}
                  className="px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700"
                >
                  Email
                </button>
              )}
            </div>
            <div className="mt-5 flex justify-between">
              <button
                onClick={() => onFollowToggle(selectedSeller.user_id)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
              >
                {isFollowing(selectedSeller.user_id) ? 'Unfollow' : 'Follow'}
              </button>
              <button
                onClick={() => setSelectedSeller(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <SecondhandListingModal
        isOpen={isModalOpen}
        categories={categories.map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          group_name: cat.group_name
        }))}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateListing}
      />
    </div>
  );
};
