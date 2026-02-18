import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Phone, Zap, Star, MapPin, Package, Filter } from 'lucide-react';
import { BulkSellingModal } from '../components/BulkSellingModal';
import { BulkOffering } from '../types';
import { fetchBulkOfferings } from '../services/bulkOfferingService';

interface WholesaleHubProps {
  isLoggedIn: boolean;
  user: any;
  onOpenSubscription: () => void;
}

export const WholesaleHub: React.FC<WholesaleHubProps> = ({ isLoggedIn, user, onOpenSubscription }) => {
  const [offerings, setOfferings] = useState<BulkOffering[]>([]);
  const [filteredOfferings, setFilteredOfferings] = useState<BulkOffering[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSellingModalOpen, setIsSellingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const result = await fetchBulkOfferings('wholesale', undefined, 50, 0);
      setOfferings(result?.data || []);
      setFilteredOfferings(result?.data || []);
    } catch (error) {
      console.error('Failed to load wholesale offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = offerings;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(o => o.category?.toLowerCase() === selectedCategory);
    }

    // Search by term
    if (searchTerm.trim()) {
      filtered = filtered.filter(o =>
        o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.originCountry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOfferings(filtered);
  }, [searchTerm, selectedCategory, offerings]);

  const hasActiveSubscription = isLoggedIn && user?.subscriptionExpiry && user.subscriptionExpiry > Date.now();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F0] to-[#FAFAFA]">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-[#FF6700] to-[#FF8533] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Wholesale Hub</h1>
          <p className="text-xl text-orange-100 mb-6">Buy Direct from Suppliers at Factory Prices</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Zap size={20} />
              <span>Direct Factory Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={20} />
              <span>Verified Suppliers</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={20} />
              <span>Bulk Orders Welcome</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-[#BDBDBD]" size={20} />
            <input
              type="text"
              placeholder="Search products, suppliers, origin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF6700] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="card-alibaba-elevated sticky top-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-[#212121]">
                <Filter size={20} /> Filters
              </h3>

              <div>
                <h4 className="font-semibold text-sm text-[#424242] mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-[#FFF5F0] p-2 rounded transition">
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
              <div className="mt-8 p-4 bg-[#FFF5F0] rounded-lg border border-[#FF6700]/20">
                <h4 className="font-semibold text-sm text-[#FF6700] mb-2 flex items-center gap-2">
                  <MessageSquare size={16} /> Contact Sellers
                </h4>
                <div>
                  <p className="text-xs text-[#E55100] font-medium">✅ 100% FREE for all buyers!</p>
                  <p className="text-xs text-[#424242] mt-2">Connect directly with sellers via WhatsApp or phone. No subscription needed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Offerings Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6700]"></div>
                <p className="mt-4 text-[#424242]">Loading wholesale suppliers...</p>
              </div>
            ) : filteredOfferings.length > 0 ? (
              <div className="space-y-4">
                {filteredOfferings.map(offering => (
                  <OfferingCard
                    key={offering.id}
                    offering={offering}
                    hasSubscription={hasActiveSubscription}
                    onOpenSubscription={onOpenSubscription}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card-alibaba-elevated">
                <Package size={48} className="mx-auto text-[#BDBDBD] mb-4" />
                <p className="text-[#424242] mb-4">No wholesale suppliers found</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="link-primary font-semibold"
                  >
                    Clear search
                  </button>
                )}
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
          onSuccess={() => {
            setIsSellingModalOpen(false);
            loadOfferings();
          }}
        />
      )}
    </div>
  );
};

interface OfferingCardProps {
  offering: BulkOffering;
  hasSubscription: boolean;
  onOpenSubscription: () => void;
}

const OfferingCard: React.FC<OfferingCardProps> = ({ offering, hasSubscription, onOpenSubscription }) => {
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
      const phoneNumber = offering.sellerPhone.startsWith('+') ? offering.sellerPhone : '+254' + offering.sellerPhone.substring(1);
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  return (
    <div className="card-alibaba-elevated hover-lift">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#212121]">{offering.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#424242]">
              {offering.originCountry && (
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> {offering.originCountry}
                </span>
              )}
              {offering.category && (
                <span className="badge-primary">
                  {offering.category}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#FF6700]">KES {offering.pricePerUnit?.toLocaleString()}</p>
            <p className="text-xs text-[#757575]">per {offering.unit || 'unit'}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#424242] mb-4 line-clamp-2">{offering.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="bg-[#FAFAFA] p-3 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Min Order</p>
            <p className="font-bold text-[#212121]">{offering.minimumQuantity || 0} {offering.unit}</p>
          </div>
          <div className="bg-[#FAFAFA] p-3 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Stock</p>
            <p className="font-bold text-[#212121]">{offering.quantityAvailable?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-[#FAFAFA] p-3 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Lead Time</p>
            <p className="font-bold text-[#212121]">{offering.leadTimeDays || 3} days</p>
          </div>
          <div className="bg-[#FAFAFA] p-3 rounded border border-[#EEEEEE]">
            <p className="text-[#757575] text-xs uppercase font-semibold">Inquiries</p>
            <p className="font-bold text-[#212121]">{offering.inquiriesCount || 0}</p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="divider-alibaba pt-4 mb-4">
          <p className="text-sm text-[#424242] mb-2">
            <strong>Seller:</strong> {offering.sellerName}
          </p>
          {offering.sellerVerified && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F6FFED] text-[#52C41A] px-2 py-1 rounded font-semibold">
              <Star size={14} /> Verified Supplier
            </span>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-3">
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

        <p className="text-xs text-center text-[#52C41A] font-medium mt-3">
          ✅ Contact is FREE for all buyers
        </p>
      </div>
    </div>
  );
};
