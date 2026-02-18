import React from 'react';
import { useListingsByHub, useFeaturedListings, useAuthentication } from '../hooks/usePamboIntegration';
import { Loader, AlertCircle } from 'lucide-react';

/**
 * Example: Using Pambo Integration Hooks
 * 
 * This component demonstrates how to use the custom hooks
 * to fetch data from Supabase and display it in your UI
 */

export const DashboardIntegrationExample: React.FC = () => {
  // Get authenticated user
  const { user, isLoading: authLoading, error: authError } = useAuthentication();

  // Get marketplace listings
  const { listings: marketplaceListings, isLoading: marketplaceLoading } = useListingsByHub('marketplace', 10);

  // Get featured listings
  const { listings: featuredListings, isLoading: featuredLoading } = useFeaturedListings('marketplace', 5);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin" />
        <span className="ml-2">Connecting to backend...</span>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-red-800">Connection Error</p>
          <p className="text-red-700">{authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user ? `Welcome back, ${user.name}!` : 'Welcome to Pambo'}
        </h1>
        {user && (
          <p className="text-gray-500 mt-2">
            Email: {user.email} | Role: {user.role}
          </p>
        )}
      </div>

      {/* Featured Listings Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Products</h2>
        {featuredLoading ? (
          <div className="flex items-center gap-2">
            <Loader className="animate-spin" size={20} />
            <span>Loading featured listings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition">
                {listing.thumbnail && (
                  <img 
                    src={listing.thumbnail} 
                    alt={listing.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-gray-900 line-clamp-2">{listing.title}</h3>
                <p className="text-lg font-bold text-orange-600 mt-2">
                  {listing.currency} {listing.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <span>⭐ {listing.rating}</span>
                  <span>•</span>
                  <span>{listing.reviewCount} reviews</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Marketplace Listings Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Marketplace ({marketplaceListings.length} listings)</h2>
        {marketplaceLoading ? (
          <div className="flex items-center gap-2">
            <Loader className="animate-spin" size={20} />
            <span>Loading marketplace listings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketplaceListings.map((listing) => (
              <div key={listing.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition">
                {listing.thumbnail && (
                  <img 
                    src={listing.thumbnail} 
                    alt={listing.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-gray-900 line-clamp-2">{listing.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{listing.category}</p>
                <p className="text-lg font-bold text-orange-600">
                  {listing.currency} {listing.price.toLocaleString()}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span>⭐ {listing.rating}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 capitalize">
                    {listing.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Status */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">
          ✅ <strong>Backend Integration Active!</strong>
        </p>
        <p className="text-green-700 text-sm mt-1">
          Your Pambo app is now connected to Supabase. All data is being loaded from the database in real-time.
        </p>
      </div>
    </div>
  );
};

export default DashboardIntegrationExample;
