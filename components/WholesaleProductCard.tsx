import React from 'react';
import { Product } from '../types';

interface WholesaleProductCardProps {
  product: Product;
}

export const WholesaleProductCard: React.FC<WholesaleProductCardProps> = ({ product }) => {
  // Example bulk pricing tiers - adjust based on your pricing model
  const getPricingTiers = (basePrice: number) => [
    { min: 1, max: 10, unit: basePrice, discount: 0 },
    { min: 11, max: 50, unit: Math.round(basePrice * 0.9), discount: 10 },
    { min: 51, max: 100, unit: Math.round(basePrice * 0.8), discount: 20 },
    { min: 101, max: Infinity, unit: Math.round(basePrice * 0.7), discount: 30 }
  ];

  const tiers = getPricingTiers(product.price);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
        {/* MOQ Badge */}
        {product.minOrder && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            MOQ: {product.minOrder} units
          </div>
        )}
        {/* Wholesale Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
          WHOLESALE
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.title}</h3>

        {/* Category & Location */}
        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">{product.category}</span>
          {product.location && (
            <span className="flex items-center gap-1">📍 {product.location}</span>
          )}
        </div>

        {/* Bulk Pricing Table */}
        <div className="bg-gray-50 rounded p-3 mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">BULK PRICING</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="text-left py-1 px-1">Units</th>
                <th className="text-right py-1 px-1">Price/Unit</th>
                <th className="text-right py-1 px-1">Discount</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, idx) => (
                <tr key={idx} className="border-t border-gray-200">
                  <td className="py-1 px-1 text-gray-700">
                    {tier.min}-{tier.max === Infinity ? '+' : tier.max}
                  </td>
                  <td className="py-1 px-1 text-right font-semibold text-gray-800">
                    {product.currency} {tier.unit.toLocaleString()}
                  </td>
                  <td className="py-1 px-1 text-right">
                    {tier.discount > 0 ? (
                      <span className="text-green-600 font-bold">-{tier.discount}%</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Seller Info */}
        <div className="border-t pt-3 mb-3">
          <p className="text-sm font-semibold text-gray-800 mb-1">{product.sellerName}</p>
          {product.sellerPhone && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              📞 {product.sellerPhone}
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors text-sm">
            Request Quote
          </button>
          <button className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1">
            💬 WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
