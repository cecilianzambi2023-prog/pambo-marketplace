import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { SmartImage } from './SmartImage';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon_name: string;
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('service_categories')
          .select('id, name, description, image_url, icon_name')
          .order('name', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setCategories(data || []);
        console.log(`✅ Fetched ${data?.length || 0} categories from Supabase`);
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
        setError('Failed to load service categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-orange-600 mx-auto" size={48} />
        <p className="ml-4 text-gray-600">Loading service categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Service Categories</h2>
        <p className="text-gray-600">Browse our {categories.length} professional services</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer group"
          >
            {/* Image Container */}
            <div className="relative h-40 bg-gray-200 overflow-hidden">
              <SmartImage
                src={
                  category.image_url ||
                  'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop'
                }
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{category.description}</p>

              {/* Browse Button */}
              <button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm">
                Browse Services
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No service categories available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
