import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SmartImage } from './SmartImage';

interface HeroBannerProps {
  onStartSelling: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onStartSelling }) => (
  <div className="relative bg-gray-800 rounded-lg overflow-hidden min-h-[350px] md:min-h-[400px] flex items-center">
    <SmartImage
      src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=2070&auto=format&fit=crop"
      alt="Marketplace background"
      loading="eager"
      fetchPriority="high"
      className="absolute inset-0 w-full h-full object-cover opacity-30"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>

    <div className="relative container mx-auto px-4 lg:px-8 text-white z-10">
      <div className="max-w-xl">
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          The Heart of Kenyan Commerce
        </h1>
        <p
          className="text-lg text-gray-200 mb-8"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Discover, buy, and sell anything. From wholesale goods to professional services, Pambo is
          your trusted digital marketplace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#"
            className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2"
          >
            Start Shopping <ArrowRight size={20} />
          </a>
          <button
            onClick={onStartSelling}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-6 rounded-lg hover:bg-white/20 transition"
          >
            Become a Seller
          </button>
        </div>
      </div>
    </div>
  </div>
);
