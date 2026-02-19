import React, { useState } from 'react';
import { User, Product, Order, LiveStream } from '../types';
import {
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Calendar,
  Clock,
  AlertTriangle,
  Package,
  Briefcase,
  Lock,
  LogOut,
  Settings,
  List,
  EyeOff,
  Eye,
  CircleDotDashed,
  Check,
  X,
  Phone,
  ShoppingCart,
  Wifi,
  Users,
  Truck,
  CreditCard,
  Grid3X3
} from 'lucide-react';
import { SERVICE_CATEGORIES, FREE_LISTING_LIMIT } from '../constants';
import { ProductCard } from './ProductCard';
import { OrderStatusTracker } from './OrderStatusTracker';
import { PricingGrid } from './PricingTierCard';
import { CategoryGrid } from './CategoryGrid';
import { SmartImage } from './SmartImage';

interface DashboardProps {
  user: User;
  listings: Product[];
  orders: Order[];
  sales: Order[];
  isSubscriptionActive: boolean;
  onAddListing: (type: 'product' | 'service') => void;
  onEditListing: (product: Product) => void;
  onDeleteListing: (productId: string) => void;
  onManageSubscription: () => void;
  onLogout: () => void;
  onDeleteAccountRequest: () => void;
  onProductStatusChange: (productId: string, status: Product['status']) => void;
  onOrderStatusChange: (orderId: string, status: Order['status']) => void;
  onUpdateProfile: (details: { phone?: string }) => void;
  onGoLive: () => void;
  liveStreams: LiveStream[];
  sellers: User[];
}

type DashboardTab =
  | 'listings'
  | 'orders'
  | 'sales'
  | 'followers'
  | 'subscription'
  | 'categories'
  | 'settings';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({
  title,
  value,
  icon
}) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
    <div className="bg-orange-100 text-orange-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ListingStatusBadge: React.FC<{ status: Product['listingStatus'] }> = ({ status }) => {
  const statusMap = {
    pending: { text: 'Pending Approval', color: 'yellow', icon: <Clock size={12} /> },
    active: { text: 'Active', color: 'green', icon: <Check size={12} /> },
    rejected: { text: 'Rejected', color: 'red', icon: <X size={12} /> }
  };
  const { text, color, icon } = statusMap[status];
  const bgColor = `bg-${color}-500`;
  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md ${bgColor} text-white`}
    >
      {icon} {text}
    </span>
  );
};

const ProductStatusControl: React.FC<{
  product: Product;
  onStatusChange: (productId: string, status: Product['status']) => void;
}> = ({ product, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses: Product['status'][] = ['Active', 'Out of Stock', 'Hidden'];

  const handleSelect = (status: Product['status']) => {
    onStatusChange(product.id, status);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-2 right-2 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
      >
        {product.status === 'Active' && <Eye size={14} />}
        {product.status === 'Out of Stock' && <CircleDotDashed size={14} />}
        {product.status === 'Hidden' && <EyeOff size={14} />}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="py-1">
            {statuses.map((s) => (
              <a
                key={s}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(s);
                }}
                className={`block px-4 py-2 text-sm ${product.status === s ? 'font-bold text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AccountSettings: React.FC<{
  user: User;
  onDeleteAccountRequest: () => void;
  onUpdateProfile: (details: { phone?: string }) => void;
}> = ({ user, onDeleteAccountRequest, onUpdateProfile }) => {
  const [phone, setPhone] = useState(user.phone || '');

  const handleSave = () => {
    onUpdateProfile({ phone });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Profile</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone Number
          </label>
          <p className="text-xs text-gray-500 mb-2">
            This number will be shown to buyers who want to contact you.
          </p>
          <div className="relative w-full md:w-1/2">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              className="w-full pl-10 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:border-orange-500 outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-700 transition"
        >
          Save Changes
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="p-4 border-2 border-red-300 bg-red-50 rounded-lg">
          <h4 className="text-md font-bold text-red-800">Danger Zone</h4>
          <p className="text-sm text-red-600 mt-1 mb-4">
            Request to permanently delete your account and all associated data. This action is
            irreversible and requires admin approval.
          </p>
          <button
            onClick={onDeleteAccountRequest}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2"
          >
            <AlertTriangle size={16} />
            Request Account Deletion
          </button>
        </div>
      </div>
    </div>
  );
};

const MyOrders: React.FC<{ orders: Order[]; onConfirmDelivery: (orderId: string) => void }> = ({
  orders,
  onConfirmDelivery
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 mb-6">My Order History</h3>
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3">
                <p className="font-bold text-sm text-gray-800">Order ID: {order.id}</p>
                <p className="text-xs text-gray-500">
                  Date: {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <OrderStatusTracker status={order.status} />
                </div>
                {order.status === 'Delivered' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center mb-4">
                    <p className="text-sm text-blue-800 mb-2">
                      The seller has marked this item as delivered. Please confirm receipt to
                      release payment.
                    </p>
                    <button
                      onClick={() => onConfirmDelivery(order.id)}
                      className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      Confirm Receipt & Release Funds
                    </button>
                  </div>
                )}
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 py-2">
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      KES {item.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-3 text-right">
                <p className="text-md font-bold text-gray-900">
                  Total: KES {order.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SalesManagement: React.FC<{
  sales: Order[];
  onStatusChange: (orderId: string, status: Order['status']) => void;
}> = ({ sales, onStatusChange }) => {
  const StatusChanger: React.FC<{ order: Order }> = ({ order }) => {
    const availableStatuses: Order['status'][] = ['Processing', 'Shipped', 'Delivered'];
    if (order.status === 'Completed' || order.status === 'Cancelled') return null;

    const currentIndex = availableStatuses.indexOf(order.status);
    const nextStatus = availableStatuses[currentIndex + 1];

    if (!nextStatus) return null;

    return (
      <button
        onClick={() => onStatusChange(order.id, nextStatus)}
        className="bg-blue-600 text-white font-bold text-sm py-1.5 px-3 rounded-md hover:bg-blue-700"
      >
        Mark as {nextStatus}
      </button>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 mb-6">My Sales</h3>
      {sales.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any sales yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">Order ID: {sale.id}</p>
                  <p className="text-xs text-gray-500">Buyer ID: {sale.userId}</p>
                </div>
                <span className="text-sm font-semibold">Status: {sale.status}</span>
              </div>
              {sale.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 py-2 border-t border-gray-100"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <p className="text-sm flex-1">
                    {item.title} (x{item.quantity})
                  </p>
                  {/* FIX: Calculate item subtotal from price and quantity. 'totalAmount' exists on the sale (Order), not the item (OrderItem). */}
                  <p className="text-sm font-bold">
                    KES {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="mt-3 text-right">
                <StatusChanger order={sale} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FollowersManager: React.FC<{ followerIds: string[]; allSellers: User[] }> = ({
  followerIds,
  allSellers
}) => {
  const followerDetails = (followerIds || [])
    .map((id) => allSellers.find((s) => s.id === id))
    .filter(Boolean) as User[];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Your Followers ({followerDetails.length})
      </h3>
      {followerDetails.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any followers yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followerDetails.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <SmartImage
                  src={follower.avatar}
                  alt={follower.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{follower.name}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(follower.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-blue-200 transition">
                Send Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  listings,
  orders,
  sales,
  isSubscriptionActive,
  onAddListing,
  onEditListing,
  onDeleteListing,
  onManageSubscription,
  onLogout,
  onDeleteAccountRequest,
  onProductStatusChange,
  onOrderStatusChange,
  onUpdateProfile,
  onGoLive,
  liveStreams,
  sellers
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('listings');

  const subscriptionExpiryTime = user.subscriptionExpiry
    ? new Date(user.subscriptionExpiry).getTime()
    : null;
  const daysRemaining = subscriptionExpiryTime
    ? Math.ceil((subscriptionExpiryTime - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Show renewal prompt if subscription expires in <= 3 days or already expired
  const isSubscriptionExpiringSoon = subscriptionExpiryTime && daysRemaining <= 3;
  const showRenewalPrompt = !isSubscriptionActive || isSubscriptionExpiringSoon;

  const productListings = listings.filter((l) => !SERVICE_CATEGORIES.includes(l.category));
  const freeProductListingsUsed = productListings.length;
  const freeLimitReached = freeProductListingsUsed >= FREE_LISTING_LIMIT;

  const isCurrentlyLive = liveStreams.some((s) => s.sellerId === user.id && s.status === 'live');

  return (
    <div className="space-y-8">
      {/* Pambo Logo and Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-3 rounded-xl shadow-lg">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Pambo
          </h1>
          <p className="text-xs text-gray-500">Your Multi-Hub Marketplace</p>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {(user.name || 'User').split(' ')[0]}!
          </h1>
          <p className="text-gray-500">Here's your dashboard. Manage your business.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGoLive}
            className={`font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-sm relative ${
              isSubscriptionActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 cursor-pointer hover:bg-gray-300'
            }`}
            title={
              !isSubscriptionActive
                ? 'VVVIP Subscription Required for Live Commerce'
                : 'Start a live stream'
            }
          >
            {!isSubscriptionActive && (
              <Lock size={14} className="absolute -top-1 -right-1 text-gray-600" />
            )}
            <Wifi size={18} /> Go Live
          </button>
          {user.verified && (
            <span className="flex items-center gap-1.5 text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
              <ShieldCheck size={16} /> Verified Seller
            </span>
          )}
          {user.accountStatus === 'pending' && (
            <span className="flex items-center gap-1.5 text-sm font-semibold bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full">
              <Clock size={16} /> Pending Approval
            </span>
          )}
          <button
            onClick={onLogout}
            className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {showRenewalPrompt && user.role === 'seller' && user.accountStatus === 'active' && (
        <div
          className={`border-l-4 p-4 rounded-r-lg ${isSubscriptionExpiringSoon ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}
        >
          <p
            className={`text-sm font-semibold ${isSubscriptionExpiringSoon ? 'text-red-700' : 'text-blue-700'}`}
          >
            {!isSubscriptionActive && !user.subscriptionExpiry && 'You are on the Free Plan.'}
            {isSubscriptionExpiringSoon &&
              daysRemaining > 0 &&
              `⚠️ Your subscription renews in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}!`}
            {isSubscriptionExpiringSoon &&
              daysRemaining <= 0 &&
              `⚠️ Your subscription renews TODAY!`}
            {isSubscriptionActive &&
              !isSubscriptionExpiringSoon &&
              'Your subscription has expired.'}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onManageSubscription();
              }}
              className="font-bold underline ml-2 hover:opacity-80"
            >
              {isSubscriptionExpiringSoon
                ? 'Renew Now'
                : user.subscriptionExpiry
                  ? 'Renew Now'
                  : 'Upgrade to Premium to post services & get premium benefits!'}
            </a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Listings" value={listings.length} icon={<Package size={22} />} />
        <StatCard title="Total Sales" value={sales.length} icon={<Truck size={22} />} />
        <StatCard
          title="Subscription"
          value={isSubscriptionActive ? 'VVVIP Plan' : 'Free Plan'}
          icon={<Calendar size={22} />}
        />
        {isSubscriptionActive ? (
          <StatCard title="Days Remaining" value={daysRemaining} icon={<Clock size={22} />} />
        ) : (
          <StatCard
            title="Free Products Used"
            value={`${freeProductListingsUsed} / ${FREE_LISTING_LIMIT}`}
            icon={<Package size={22} />}
          />
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 shrink-0 ${activeTab === 'listings' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <List size={16} /> My Listings
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 shrink-0 ${activeTab === 'sales' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Truck size={16} /> My Sales
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 shrink-0 ${activeTab === 'orders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <ShoppingCart size={16} /> My Orders
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 shrink-0 ${activeTab === 'followers' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Users size={16} /> Followers
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 shrink-0 ${activeTab === 'categories' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Grid3X3 size={16} /> All Services
          </button>{' '}
          <button
            onClick={() => setActiveTab('subscription')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 shrink-0 ${activeTab === 'subscription' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <CreditCard size={16} /> Plans & Pricing
          </button>{' '}
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 shrink-0 ${activeTab === 'settings' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Settings size={16} /> Account Settings
          </button>
        </nav>
      </div>

      {activeTab === 'listings' && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Listings</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddListing('product')}
                disabled={!isSubscriptionActive && freeLimitReached}
                className="bg-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-700 transition flex items-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> Post New Ad
              </button>
              <button
                onClick={() =>
                  isSubscriptionActive ? onAddListing('service') : onManageSubscription()
                }
                className={`font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-sm relative ${
                  isSubscriptionActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-pointer hover:bg-gray-300'
                }`}
                title={
                  !isSubscriptionActive ? 'VVVIP Subscription Required' : 'Post a new service ad'
                }
              >
                {!isSubscriptionActive && (
                  <Lock size={14} className="absolute -top-1 -right-1 text-gray-600" />
                )}
                <Briefcase size={18} /> Post Service Ad
              </button>
            </div>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <div key={listing.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <ListingStatusBadge status={listing.listingStatus} />
                  </div>
                  <ProductStatusControl product={listing} onStatusChange={onProductStatusChange} />
                  <ProductCard
                    product={listing}
                    onContactSupplier={() => {}}
                    onEditProduct={onEditListing}
                    onDeleteProduct={onDeleteListing}
                    isSellerLive={isCurrentlyLive}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">You haven't listed any products or services yet.</p>
              <button
                onClick={() => onAddListing('product')}
                className="mt-4 text-orange-600 font-bold hover:underline"
              >
                Click here to post your first ad
              </button>
            </div>
          )}
        </section>
      )}
      {activeTab === 'orders' && (
        <MyOrders
          orders={orders}
          onConfirmDelivery={(orderId) => onOrderStatusChange(orderId, 'Completed')}
        />
      )}
      {activeTab === 'sales' && (
        <SalesManagement sales={sales} onStatusChange={onOrderStatusChange} />
      )}
      {activeTab === 'followers' && (
        <FollowersManager followerIds={user.followers || []} allSellers={sellers} />
      )}
      {activeTab === 'categories' && (
        <section className="animate-fade-in">
          <CategoryGrid />
        </section>
      )}
      {activeTab === 'subscription' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Plans & Pricing</h2>
          <p className="text-gray-600 mb-8">
            Choose a plan to unlock more features and get access to premium hubs. 0% commission on
            all sales.
          </p>
          <PricingGrid userId={user.id} />
        </div>
      )}
      {activeTab === 'settings' && (
        <AccountSettings
          user={user}
          onDeleteAccountRequest={onDeleteAccountRequest}
          onUpdateProfile={onUpdateProfile}
        />
      )}
    </div>
  );
};
