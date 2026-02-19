import React, { useState } from 'react';
import { X, Tag, MapPin, DollarSign, Camera, Video } from 'lucide-react';

interface SecondhandListingModalProps {
  isOpen: boolean;
  categories: Array<{ name: string; slug: string; group_name: string }>;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    price: number;
    condition: string;
    category?: string;
    county?: string;
    city?: string;
    photos?: string[];
    videos?: string[];
  }) => void;
}

export const SecondhandListingModal: React.FC<SecondhandListingModalProps> = ({
  isOpen,
  categories,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    condition: 'used',
    category: '',
    county: '',
    city: '',
    photoUrls: '',
    videoUrls: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.price <= 0 || !formData.condition) {
      alert('Please fill in the required fields.');
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
        price: formData.price,
        condition: formData.condition,
        category: formData.category || undefined,
        county: formData.county || undefined,
        city: formData.city || undefined,
        photos,
        videos,
      });

      setFormData({
        title: '',
        description: '',
        price: 0,
        condition: 'used',
        category: '',
        county: '',
        city: '',
        photoUrls: '',
        videoUrls: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Post a Secondhand Listing</h2>
            <p className="text-emerald-100 text-sm">Kenya-only used items marketplace</p>
          </div>
          <button onClick={onClose} className="hover:bg-emerald-600 p-2 rounded-lg transition">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., iPhone 13 Pro, Office Chair"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Condition details, usage history, accessories included..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (KES) *</label>
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-gray-500" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min={0}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Condition *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="used">Used</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-gray-500" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">County</label>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" />
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Westlands"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Camera size={16} /> Photo URLs (max 10)
              </label>
              <textarea
                name="photoUrls"
                value={formData.photoUrls}
                onChange={handleChange}
                placeholder="One URL per line"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.photoUrls.split('\n').map((v) => v.trim()).filter(Boolean).length}/10
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Video size={16} /> Video URLs (max 2)
              </label>
              <textarea
                name="videoUrls"
                value={formData.videoUrls}
                onChange={handleChange}
                placeholder="One URL per line"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.videoUrls.split('\n').map((v) => v.trim()).filter(Boolean).length}/2
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Posting...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
