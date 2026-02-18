import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Package, Zap, Store, TrendingUp } from 'lucide-react';

export interface BulkOffering {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  title: string;
  description: string;
  category: string;
  quantityAvailable: number;
  unit: string;
  pricePerUnit: number;
  minOrderQuantity: number;
  totalValue: number;
  postedDate: string;
  verifiedSeller?: boolean;
  responses?: number;
}

interface BulkOfferingsProps {
  offerings: BulkOffering[];
  onContact: (offering: BulkOffering) => void;
  isLoading?: boolean;
}

export const BulkOfferingsPanel: React.FC<BulkOfferingsProps> = ({ offerings, onContact, isLoading }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || offering.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(offerings.map(o => o.category)));

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (offerings.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Bulk Offerings Yet</h3>
        <p className="text-gray-500 mb-6">Sellers will start posting their bulk offerings soon!</p>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="text-center">
            <Zap size={24} className="mx-auto text-blue-500 mb-2" />
            <p className="text-sm font-bold text-gray-700">Find Suppliers</p>
          </div>
          <div className="text-center">
            <TrendingUp size={24} className="mx-auto text-green-500 mb-2" />
            <p className="text-sm font-bold text-gray-700">Bulk Prices</p>
          </div>
          <div className="text-center">
            <MessageCircle size={24} className="mx-auto text-purple-500 mb-2" />
            <p className="text-sm font-bold text-gray-700">Direct Chat</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search bulk offerings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-bold transition ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Offerings Grid */}
      {filteredOfferings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No offerings match your search
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOfferings.map(offering => (
            <div key={offering.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{offering.title}</h3>
                    {offering.verifiedSeller && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">By {offering.sellerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">KES {offering.pricePerUnit.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">per {offering.unit}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{offering.description}</p>

              {/* Stock Info */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-bold">Available</p>
                  <p className="text-lg font-bold text-blue-600">
                    {offering.quantityAvailable.toLocaleString()} {offering.unit}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-bold">Min. Order</p>
                  <p className="text-lg font-bold text-green-600">
                    {offering.minOrderQuantity} {offering.unit}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-bold">Total Value</p>
                  <p className="text-lg font-bold text-purple-600">
                    KES {(offering.totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-bold">Interest</p>
                  <p className="text-lg font-bold text-gray-600">
                    {offering.responses || 0} inquiries
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Posted {new Date(offering.postedDate).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  {offering.sellerPhone && (
                    <button
                      onClick={() => window.open(`tel:${offering.sellerPhone}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                    >
                      <Phone size={16} />
                      Call
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const message = `Hi ${offering.sellerName}, I'm interested in your bulk offering: ${offering.title}. Available quantity: ${offering.quantityAvailable} ${offering.unit} at KES ${offering.pricePerUnit}/unit.`;
                      window.open(`https://wa.me/${offering.sellerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => onContact(offering)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                  >
                    <Mail size={16} />
                    More Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {filteredOfferings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm font-bold text-gray-700">
            Showing {filteredOfferings.length} bulk offering{filteredOfferings.length !== 1 ? 's' : ''} • 
            Total value: KES {filteredOfferings.reduce((sum, o) => sum + o.totalValue, 0).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};
