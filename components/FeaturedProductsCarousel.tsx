import React, { useRef } from 'react';
import { Product, LiveStream } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface FeaturedProductsCarouselProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onContactSupplier: (product: Product) => void;
  liveStreams: LiveStream[];
}

export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  products,
  onViewProduct,
  onContactSupplier,
  liveStreams
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8; // Scroll 80% of the visible width
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="text-yellow-400" /> Featured Products
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="bg-white p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="bg-white p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mb-4"
        >
          {products.map((product) => {
            const isSellerLive = liveStreams.some((s) => s.sellerId === product.sellerId);
            return (
              <div key={product.id} className="w-64 flex-shrink-0">
                <ProductCard
                  product={product}
                  onViewProduct={onViewProduct}
                  onContactSupplier={onContactSupplier}
                  isSellerLive={isSellerLive}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
