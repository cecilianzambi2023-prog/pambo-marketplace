import React, { useState } from 'react';
import { X, Package, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

interface BulkSellingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bulkOffering: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    minOrderQuantity: number;
    hub: string;
    photos?: string[];
    videos?: string[];
  }) => void;
}

export const BulkSellingModal: React.FC<BulkSellingModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'furniture',
    quantity: 0,
    unit: 'units',
    pricePerUnit: 0,
    minOrderQuantity: 1,
    hub: 'wholesale',
    photoUrls: '',
    videoUrls: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'quantity' || name === 'pricePerUnit' || name === 'minOrderQuantity'
          ? parseFloat(value)
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.quantity === 0 || formData.pricePerUnit === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const photos = formData.photoUrls
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 10);

      const videos = formData.videoUrls
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 2);

      onSubmit({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        pricePerUnit: formData.pricePerUnit,
        minOrderQuantity: formData.minOrderQuantity,
        hub: formData.hub,
        photos,
        videos
      });
      setFormData({
        title: '',
        description: '',
        category: 'furniture',
        quantity: 0,
        unit: 'units',
        pricePerUnit: 0,
        minOrderQuantity: 1,
        hub: 'wholesale',
        photoUrls: '',
        videoUrls: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'furniture', label: '🪑 Furniture' },
    { value: 'decor', label: '🎨 Decor' },
    { value: 'textiles', label: '🧵 Textiles' },
    { value: 'electronics', label: '⚡ Electronics' },
    { value: 'machinery', label: '🔧 Machinery' },
    { value: 'raw-materials', label: '📦 Raw Materials' },
    { value: 'other', label: '📋 Other' }
  ];

  const units = ['units', 'kg', 'meters', 'liters', 'sets', 'pieces', 'boxes', 'tons'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={32} />
            <div>
              <h2 className="text-2xl font-bold">Post Bulk Selling Offer</h2>
              <p className="text-blue-100 text-sm">Reach wholesale buyers across Africa</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-blue-700 p-2 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Product Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Premium Leather Office Chairs"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide details: material, color, specifications, quality, certifications, etc."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Photo URLs (max 10)
              </label>
              <textarea
                name="photoUrls"
                value={formData.photoUrls}
                onChange={handleChange}
                placeholder="One URL per line"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {
                  formData.photoUrls
                    .split('\n')
                    .map((v) => v.trim())
                    .filter(Boolean).length
                }
                /10
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Video URLs (max 2)
              </label>
              <textarea
                name="videoUrls"
                value={formData.videoUrls}
                onChange={handleChange}
                placeholder="One URL per line"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {
                  formData.videoUrls
                    .split('\n')
                    .map((v) => v.trim())
                    .filter(Boolean).length
                }
                /2
              </p>
            </div>
          </div>

          {/* Quantity Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Quantity Available *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Price per Unit (KES) *
              </label>
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-gray-500" />
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="e.g., 5000"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Min Order Qty *</label>
              <input
                type="number"
                name="minOrderQuantity"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                placeholder="e.g., 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Price Summary */}
          {formData.pricePerUnit > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600" />
                  <span className="text-gray-700">Total Value if Sold Out:</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  KES {(formData.quantity * formData.pricePerUnit).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <Users size={20} className="mx-auto mb-1 text-blue-600" />
              <p className="text-xs font-bold text-gray-700">Bulk Buyers</p>
            </div>
            <div className="text-center">
              <Clock size={20} className="mx-auto mb-1 text-blue-600" />
              <p className="text-xs font-bold text-gray-700">24/7 Visibility</p>
            </div>
            <div className="text-center">
              <Package size={20} className="mx-auto mb-1 text-blue-600" />
              <p className="text-xs font-bold text-gray-700">Direct Inquiries</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Bulk Offering'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your offering will be visible to all wholesale buyers in your hubs
          </p>
        </form>
      </div>
    </div>
  );
};
