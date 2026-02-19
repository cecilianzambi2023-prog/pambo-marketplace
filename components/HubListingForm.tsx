/**
 * HubListingForm.tsx
 * ===================
 * Hub-Specific Listing Creation Form - 6 VARIANTS, 1 DATA MODEL
 *
 * ARCHITECTURE: HUB SEGREGATION WITH SHARED USERS
 * ═══════════════════════════════════════════════════════════
 *
 * Demonstrates segregation at UX layer - each hub type has different
 * form fields, all submitted with hub_id for database segregation.
 *
 * 6 HUB-SPECIFIC VARIANTS:
 *
 * MARKETPLACE (Blue):
 * ├─ title, description, price, quantity
 * ├─ condition: "new" | "used" | "refurbished" ← MARKETPLACE SPECIFIC
 * ├─ shipping_available, shipping_cost ← MARKETPLACE SPECIFIC
 * └─ Submission: { ..., hub_id: 'marketplace', created_by: userId }
 *
 * MKULIMA (Green):
 * ├─ title, description, price, quantity
 * ├─ harvest_date ← MKULIMA SPECIFIC
 * ├─ crop_type, certifications ← MKULIMA SPECIFIC
 * └─ Submission: { ..., hub_id: 'mkulima', created_by: userId }
 *
 * DIGITAL (Pink):
 * ├─ title, description, price
 * ├─ license_type: "single-use" | "commercial" | "unlimited" ← DIGITAL SPECIFIC
 * ├─ file_url, file_size ← DIGITAL SPECIFIC
 * └─ Submission: { ..., hub_id: 'digital', created_by: userId }
 *
 * SERVICES (Amber):
 * ├─ title, description, price_per_hour
 * ├─ duration_hours, availability ← SERVICES SPECIFIC
 * ├─ service_category ← SERVICES SPECIFIC
 * └─ Submission: { ..., hub_id: 'services', created_by: userId }
 *
 * WHOLESALE (Purple):
 * ├─ title, description, price_per_unit
 * ├─ moq: "minimum order quantity" ← WHOLESALE SPECIFIC
 * ├─ bulk_discounts ← WHOLESALE SPECIFIC
 * └─ Submission: { ..., hub_id: 'wholesale', created_by: userId }
 *
 * LIVE_COMMERCE (Red):
 * ├─ title, description, price
 * ├─ stream_schedule_start ← LIVE_COMMERCE SPECIFIC
 * ├─ stream_duration ← LIVE_COMMERCE SPECIFIC
 * └─ Submission: { ..., hub_id: 'live_commerce', created_by: userId }
 *
 * SHARED SUBMISSION STRUCTURE:
 * {
 *   title: string,
 *   description: string,
 *   price: number,
 *   hub_id: string, ← KEY: This segregates listing to correct hub
 *   created_by: userId, ← Same user can list in all 6 hubs
 *   ...hub_specific_fields
 * }
 *
 * DATABASE INSERT (automatically segregated):
 * INSERT INTO listings (title, description, price, hub_id, created_by, ...)
 * VALUES (..., 'mkulima', userId, ...)
 *
 * Later queries segregate it:
 * SELECT * FROM listings WHERE hub_id = 'mkulima' AND created_by = userId
 */

import React, { useState } from 'react';
import { useHub, useHubFeatures, useHubRules, useHubBranding } from '../contexts/HubContext';
import { Upload, X, ChevronDown, AlertCircle } from 'lucide-react';
import { SmartImage } from './SmartImage';

// ===================================
// HUB LISTING FORM TYPES
// ===================================

export interface HubListingFormData {
  // Common fields
  title: string;
  description: string;
  category: string;
  price: number;
  image: File | null;

  // Marketplace-specific
  condition?: 'new' | 'like-new' | 'used';
  shippingAvailable?: boolean;

  // Wholesale-specific
  minOrderQuantity?: number;
  bulkPricingTiers?: Array<{
    quantity: number;
    price: number;
  }>;

  // Digital-specific
  fileUrl?: string;
  licenseType?: 'personal' | 'commercial' | 'educational';
  downloadUrl?: string;

  // Mkulima-specific
  harvestDate?: string;
  certification?: 'organic' | 'non-organic';
  quantity?: number;
  unit?: string;

  // Services-specific
  duration?: number;
  durationUnit?: 'hours' | 'days' | 'weeks';
  availability?: string;
  skillCategory?: string;

  // Live Commerce-specific
  streamSchedule?: string;
  streamDuration?: number;
  streamCategory?: string;
}

// ===================================
// MAIN HUB LISTING FORM
// ===================================

interface HubListingFormProps {
  onSubmit: (data: HubListingFormData) => Promise<void>;
  onCancel?: () => void;
}

export const HubListingForm: React.FC<HubListingFormProps> = ({ onSubmit, onCancel }) => {
  const { hub, hubId } = useHub();
  const { hasFeature } = useHubFeatures();
  const { getListingLimit } = useHubRules();
  const { primary } = useHubBranding();

  const [formData, setFormData] = useState<HubListingFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    image: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate hub-specific fields
      const validationError = getHubValidationError(hubId, formData);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Listing</h1>
        <p className="text-gray-600">
          You're listing in <strong>{hub.displayName}</strong>. Only relevant fields will appear.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* COMMON FIELDS */}
        <CommonListingFields formData={formData} setFormData={setFormData} />

        {/* MARKETPLACE-SPECIFIC */}
        {hubId === 'marketplace' && (
          <MarketplaceListingFields formData={formData} setFormData={setFormData} />
        )}

        {/* WHOLESALE-SPECIFIC */}
        {hubId === 'wholesale' && (
          <WholesaleListingFields formData={formData} setFormData={setFormData} />
        )}

        {/* DIGITAL-SPECIFIC */}
        {hubId === 'digital' && (
          <DigitalListingFields formData={formData} setFormData={setFormData} />
        )}

        {/* MKULIMA-SPECIFIC */}
        {hubId === 'mkulima' && (
          <MkulimaListingFields formData={formData} setFormData={setFormData} />
        )}

        {/* SERVICES-SPECIFIC */}
        {hubId === 'services' && (
          <ServicesListingFields formData={formData} setFormData={setFormData} />
        )}

        {/* LIVE COMMERCE-SPECIFIC */}
        {hubId === 'live_commerce' && (
          <LiveCommerceListingFields formData={formData} setFormData={setFormData} />
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ===================================
// FORM SECTIONS
// ===================================

interface FormSectionProps {
  formData: HubListingFormData;
  setFormData: (data: HubListingFormData) => void;
}

// Common Fields
const CommonListingFields: React.FC<FormSectionProps> = ({ formData, setFormData }) => {
  const { hub } = useHub();

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
        <input
          type="text"
          required
          maxLength={100}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What are you selling?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
        <textarea
          required
          maxLength={2000}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your product in detail. Include condition, features, and any important information."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {getHubCategories(hub.id).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Price (KES) *</label>
        <input
          type="number"
          required
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          placeholder="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Image *</label>
        <ImageUpload
          image={formData.image}
          onChange={(file) => setFormData({ ...formData, image: file })}
        />
      </div>
    </>
  );
};

// Marketplace-specific
const MarketplaceListingFields: React.FC<FormSectionProps> = ({ formData, setFormData }) => {
  return (
    <>
      <FormSection title="Item Condition">
        <select
          value={formData.condition || 'new'}
          onChange={(e) =>
            setFormData({
              ...formData,
              condition: e.target.value as 'new' | 'like-new' | 'used'
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="used">Used</option>
        </select>
      </FormSection>

      <FormSection title="Shipping">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.shippingAvailable || false}
            onChange={(e) => setFormData({ ...formData, shippingAvailable: e.target.checked })}
          />
          <span className="text-gray-700">I can ship this item</span>
        </label>
      </FormSection>
    </>
  );
};

// Wholesale-specific
const WholesaleListingFields: React.FC<FormSectionProps> = ({ formData, setFormData }) => {
  return (
    <FormSection title="Wholesale Details">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Minimum Order Quantity *
        </label>
        <input
          type="number"
          required
          min="1"
          value={formData.minOrderQuantity || 1}
          onChange={(e) =>
            setFormData({
              ...formData,
              minOrderQuantity: parseInt(e.target.value)
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">Bulk Pricing</p>
        <p>Buyers get better prices when ordering larger quantities</p>
      </div>
    </FormSection>
  );
};

// Digital-specific
const DigitalListingFields: React.FC<FormSectionProps> = ({ formData, setFormData }) => {
  return (
    <FormSection title="Digital Product Details">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">License Type *</label>
        <select
          required
          value={formData.licenseType || 'personal'}
          onChange={(e) =>
            setFormData({
              ...formData,
              licenseType: e.target.value as 'personal' | 'commercial' | 'educational'
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="personal">Personal Use</option>
          <option value="commercial">Commercial Use</option>
          <option value="educational">Educational</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Download Link *</label>
        <input
          type="url"
          required
          value={formData.downloadUrl || ''}
          onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
          placeholder="https://example.com/download"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </FormSection>
  );
};

// Mkulima-specific
const MkulimaListingFields: React.FC<FormSectionProps> = ({ formData, setFormData }) => {
  return (
    <FormSection title="Farm Product Details">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Harvest Date *</label>
        <input
          type="date"
          required
          value={formData.harvestDate || ''}
          onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity *</label>
        <div className="flex gap-2">
          <input
            type="number"
            required
            min="0"
            value={formData.quantity || 0}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.unit || 'kg'}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="kg">kg</option>
            <option value="tons">tons</option>
            <option value="bags">bags</option>
            <option value="units">units</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Certification</label>
        <select
          value={formData.certification || 'non-organic'}
          onChange={(e) =>
            setFormData({
              ...formData,
              certification: e.target.value as 'organic' | 'non-organic'
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="non-organic">Non-Organic</option>
          <option value="organic">Organic Certified</option>
        </select>
      </div>
    </FormSection>
  );
};

// Services-specific
const ServicesListingFields: React.FC<FormSectionProps> = ({ formData, setFormData }) => {
  return (
    <FormSection title="Service Details">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Service Duration *</label>
        <div className="flex gap-2">
          <input
            type="number"
            required
            min="1"
            value={formData.duration || 1}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.durationUnit || 'hours'}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationUnit: e.target.value as 'hours' | 'days' | 'weeks'
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hours">hours</option>
            <option value="days">days</option>
            <option value="weeks">weeks</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Availability *</label>
        <input
          type="text"
          required
          value={formData.availability || ''}
          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          placeholder="e.g., Mon-Fri 9AM-5PM or flexible"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </FormSection>
  );
};

// Live Commerce-specific
const LiveCommerceListingFields: React.FC<FormSectionProps> = ({ formData, setFormData }) => {
  return (
    <FormSection title="Live Stream Details">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Stream Schedule *</label>
        <input
          type="datetime-local"
          required
          value={formData.streamSchedule || ''}
          onChange={(e) => setFormData({ ...formData, streamSchedule: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Expected Stream Duration (minutes) *
        </label>
        <input
          type="number"
          required
          min="15"
          max="480"
          value={formData.streamDuration || 60}
          onChange={(e) => setFormData({ ...formData, streamDuration: parseInt(e.target.value) })}
          placeholder="60"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </FormSection>
  );
};

// ===================================
// HELPER COMPONENTS
// ===================================

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

const ImageUpload: React.FC<{
  image: File | null;
  onChange: (file: File | null) => void;
}> = ({ image, onChange }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (previewUrl) {
    return (
      <div className="relative">
        <SmartImage
          src={previewUrl}
          alt="Preview"
          className="w-full h-64 object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setPreviewUrl(null);
          }}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <Upload size={32} className="mx-auto mb-2 text-gray-400" />
      <p className="text-sm font-semibold text-gray-600">Click to upload image</p>
      <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (max 5MB)</p>
    </label>
  );
};

// ===================================
// UTILITIES
// ===================================

function getHubValidationError(hubId: string, data: HubListingFormData): string | null {
  if (!data.title.trim()) return 'Title is required';
  if (!data.description.trim()) return 'Description is required';
  if (!data.category) return 'Category is required';
  if (data.price < 0) return 'Price must be positive';
  if (!data.image) return 'Image is required';

  // Hub-specific validation
  if (hubId === 'wholesale' && !data.minOrderQuantity)
    return 'Minimum order quantity is required for wholesale';
  if (hubId === 'digital' && !data.downloadUrl)
    return 'Download link is required for digital products';
  if (hubId === 'mkulima' && !data.harvestDate) return 'Harvest date is required';
  if (hubId === 'services' && !data.availability) return 'Availability is required for services';
  if (hubId === 'live_commerce' && !data.streamSchedule) return 'Stream schedule is required';

  return null;
}

function getHubCategories(hubId: string): string[] {
  const categories: Record<string, string[]> = {
    marketplace: ['Electronics', 'Furniture', 'Clothing', 'Home & Garden', 'Sports', 'Other'],
    wholesale: ['Textiles', 'Chemicals', 'Machinery', 'Electronics', 'Food', 'Other'],
    digital: ['Software', 'E-books', 'Templates', 'Photography', 'Audio', 'Courses'],
    mkulima: ['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Livestock', 'Seeds'],
    services: ['Consulting', 'Design', 'Development', 'Marketing', 'Repairs', 'Other'],
    live_commerce: ['Fashion', 'Electronics', 'Home', 'Beauty', 'Food', 'Other']
  };

  return categories[hubId] || [];
}
