import React from 'react';
import { User, Product, Review, ListingComment } from '../types';
import {
  ShieldCheck,
  Clock,
  Check,
  X,
  UserCog,
  Package,
  MessageSquare,
  AlertTriangle,
  UserX,
  CheckCircle
} from 'lucide-react';

interface AdminPanelProps {
  sellers: User[];
  products: Product[];
  listingComments: Record<string, ListingComment[]>;
  onSellerStatusChange: (sellerId: string, status: User['accountStatus']) => void;
  onSellerVerificationChange: (sellerId: string, verified: boolean) => void;
  onListingStatusChange: (productId: string, status: Product['listingStatus']) => void;
  onReviewStatusChange: (reviewId: string, status: Review['status']) => void;
  onCommentStatusChange: (commentId: string, status: ListingComment['status']) => void;
}

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}> = ({ title, icon, count, children }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      {icon} {title}
      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
        {count}
      </span>
    </h2>
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">{children}</div>
  </div>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({
  sellers,
  products,
  listingComments,
  onSellerStatusChange,
  onSellerVerificationChange,
  onListingStatusChange,
  onReviewStatusChange,
  onCommentStatusChange
}) => {
  const pendingSellers = sellers.filter((s) => s.accountStatus === 'pending');
  const pendingListings = products.filter((p) => p.listingStatus === 'pending');
  const pendingReviews: { review: Review; seller: User }[] = [];
  sellers.forEach((s) => {
    s.reviews?.forEach((r) => {
      if (r.status === 'pending') {
        pendingReviews.push({ review: r, seller: s });
      }
    });
  });
  const pendingComments = Object.entries(listingComments).flatMap(
    ([listingId, comments]: [string, ListingComment[]]) => {
      const product = products.find((p) => p.id === listingId);
      if (!product) return [];

      return comments
        .filter((comment) => comment.status === 'pending')
        .map((comment) => ({ comment, product }));
    }
  );
  const activeSellers = sellers.filter((s) => s.accountStatus === 'active' && s.role !== 'admin');
  const suspendedSellers = sellers.filter((s) => s.accountStatus === 'suspended');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Pending Sellers */}
        <Section title="Pending Seller Accounts" icon={<UserCog />} count={pendingSellers.length}>
          {pendingSellers.length > 0 ? (
            pendingSellers.map((s) => (
              <div key={s.id} className="border border-gray-200 rounded p-3">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.email}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onSellerStatusChange(s.id, 'active')}
                    className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onSellerStatusChange(s.id, 'suspended')}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No pending sellers.</p>
          )}
        </Section>

        {/* Pending Listings */}
        <Section title="Pending Product Listings" icon={<Package />} count={pendingListings.length}>
          {pendingListings.length > 0 ? (
            pendingListings.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded p-3">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-gray-500">by {p.sellerName}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onListingStatusChange(p.id, 'active')}
                    className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onListingStatusChange(p.id, 'rejected')}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No pending listings.</p>
          )}
        </Section>

        {/* Pending Reviews */}
        <Section
          title="Pending Customer Reviews"
          icon={<MessageSquare />}
          count={pendingReviews.length}
        >
          {pendingReviews.length > 0 ? (
            pendingReviews.map(({ review, seller }) => (
              <div
                key={`${seller.id}-${review.date}`}
                className="border border-gray-200 rounded p-3 text-sm"
              >
                <p className="font-semibold">
                  {review.author} on {seller.name}
                </p>
                <p className="text-gray-600 my-1 italic">"{review.comment}"</p>
                <p className="text-yellow-500">Rating: {review.rating}/5</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => review.id && onReviewStatusChange(review.id, 'approved')}
                    disabled={!review.id}
                    className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => review.id && onReviewStatusChange(review.id, 'rejected')}
                    disabled={!review.id}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No pending reviews.</p>
          )}
        </Section>

        {/* Pending Comments */}
        <Section
          title="Pending Listing Comments"
          icon={<MessageSquare />}
          count={pendingComments.length}
        >
          {pendingComments.length > 0 ? (
            pendingComments.map(({ comment, product }) => (
              <div
                key={`${comment.id || comment.date}-${product.id}`}
                className="border border-gray-200 rounded p-3 text-sm"
              >
                <p className="font-semibold">
                  {comment.author} on {product.title}
                </p>
                <p className="text-gray-600 my-1 italic">"{comment.comment}"</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => comment.id && onCommentStatusChange(comment.id, 'approved')}
                    disabled={!comment.id}
                    className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => comment.id && onCommentStatusChange(comment.id, 'rejected')}
                    disabled={!comment.id}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No pending comments.</p>
          )}
        </Section>

        {/* Manage Sellers */}
        <Section title="User Management" icon={<ShieldCheck />} count={activeSellers.length}>
          {activeSellers.map((s) => (
            <div
              key={s.id}
              className="border border-gray-200 rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {s.name} {s.verified && <span className="text-blue-500">✓</span>}
                </p>
                <p className="text-sm text-gray-500">{s.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSellerVerificationChange(s.id, !s.verified)}
                  className={`font-semibold px-3 py-1 text-xs rounded-md flex items-center gap-1 ${s.verified ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  <CheckCircle size={12} /> {s.verified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  onClick={() => onSellerStatusChange(s.id, 'suspended')}
                  className="bg-red-600 text-white font-semibold px-3 py-1 text-xs rounded-md hover:bg-red-700 flex items-center gap-1"
                >
                  <UserX size={12} /> Ban
                </button>
              </div>
            </div>
          ))}
        </Section>

        {/* Suspended Sellers */}
        <Section title="Banned Users" icon={<AlertTriangle />} count={suspendedSellers.length}>
          {suspendedSellers.map((s) => (
            <div
              key={s.id}
              className="border border-red-200 rounded p-3 flex justify-between items-center bg-red-50"
            >
              <div>
                <p className="font-semibold text-red-800">{s.name}</p>
                <p className="text-sm text-red-600">{s.email}</p>
              </div>
              <button
                onClick={() => onSellerStatusChange(s.id, 'active')}
                className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600 font-semibold"
              >
                Unban
              </button>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
};
