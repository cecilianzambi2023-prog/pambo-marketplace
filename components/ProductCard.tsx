import React, { useState, useEffect } from 'react';
import { Product } from '../types';
// FIX: Add Wifi icon for live status
import {
  ShieldCheck,
  MessageCircle,
  MapPin,
  Play,
  Package,
  Download,
  Star,
  Edit,
  Trash2,
  Wifi,
  Phone,
  Sparkles,
  Heart,
  Share2
} from 'lucide-react';
import { SERVICE_CATEGORIES, FEATURED_LISTING_PRICE } from '../constants';
import { generateWhatsAppLink } from '../services/whatsappService';
import { isListingFeatured, createFeaturedListing } from '../services/featuredListingsService';
import { FeaturedListingModal } from './FeaturedListingModal';
import { ShareModal } from './ShareModal';
import { SmartImage } from './SmartImage';

interface ProductCardProps {
  product: Product;
  onContactSupplier: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onViewSeller?: (sellerId: string, sellerName: string) => void;
  isSellerLive?: boolean;
  currentUserId?: string;
  onFeaturedSuccess?: () => void;
  densityMode?: 'regular' | 'compact';
  isFeaturedOverride?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (productId: string) => void;
  isLoggedIn?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onContactSupplier,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  isSellerLive,
  currentUserId,
  onFeaturedSuccess,
  onViewSeller,
  densityMode = 'regular',
  isFeaturedOverride,
  isFavorited = false,
  onToggleFavorite,
  isLoggedIn = false
}) => {
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isCheckingFeatured, setIsCheckingFeatured] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isCompact = densityMode === 'compact';

  // Check if listing is currently featured
  useEffect(() => {
    if (typeof isFeaturedOverride === 'boolean') {
      setIsFeatured(isFeaturedOverride);
      setIsCheckingFeatured(false);
      return;
    }

    const checkFeatured = async () => {
      try {
        const featured = await isListingFeatured(product.id);
        setIsFeatured(featured);
      } catch (error) {
        console.error('Error checking featured status:', error);
      } finally {
        setIsCheckingFeatured(false);
      }
    };

    checkFeatured();
  }, [product.id, isFeaturedOverride]);

  const handleFeatureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFeaturedModalOpen(true);
  };

  const handleFeaturedPayment = async (phone: string) => {
    if (!currentUserId) {
      throw new Error('You must be logged in to feature a listing');
    }

    // Create featured listing record directly
    // In production, this would be triggered by the M-Pesa callback
    await createFeaturedListing({
      listingId: product.id,
      sellerId: currentUserId,
      phone,
      mpesaReceiptNumber: `temp-${Date.now()}`, // Will be replaced by actual receipt from callback
      paymentMethod: 'mpesa'
    });

    setIsFeatured(true);
    onFeaturedSuccess?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // The confirmation dialog is handled by the onDeleteProduct function passed from the parent.
    if (onDeleteProduct) {
      onDeleteProduct(product.id);
    }
  };

  const handleClick = () => {
    // In management view, the main click can act as an "edit" shortcut.
    if (onEditProduct) {
      onEditProduct(product);
    } else if (onViewProduct) {
      onViewProduct(product);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditProduct) {
      onEditProduct(product);
    }
  };

  // Check if seller has paid subscription
  const isPaidTier =
    product.seller_subscription_tier &&
    ['starter', 'pro', 'enterprise', 'mkulima'].includes(product.seller_subscription_tier);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.seller_phone) {
      onContactSupplier(product);
      return;
    }
    const message = `Hi, I'm interested in: ${product.title}\nPrice: ${product.currency} ${product.price}\nPlease tell me more!`;
    const whatsappLink = generateWhatsAppLink(product.seller_phone, message);
    window.open(whatsappLink, '_blank');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('Please log in to save listings');
      return;
    }
    onToggleFavorite?.(product.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const getListingUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}#/marketplace?listing=${product.id}`;
  };

  const isRetail = !product.isWholesale && !SERVICE_CATEGORIES.includes(product.category);
  const isManagementView = !!onEditProduct && !!onDeleteProduct;
  const paymentArrangementLabel =
    product.paymentArrangement === 'mpesa'
      ? 'M-Pesa'
      : product.paymentArrangement === 'cash_on_delivery'
        ? 'Cash on Delivery'
        : product.paymentArrangement === 'bank_transfer'
          ? 'Bank Transfer'
          : 'Jiji Direct';

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group flex flex-col h-full relative cursor-pointer ${
        isCompact ? 'overflow-hidden' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden bg-gray-100 rounded-t-lg ${isCompact ? 'aspect-[4/3]' : 'aspect-square'}`}
      >
        {product.image ? (
          <SmartImage
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Package size={48} className="text-gray-400" />
          </div>
        )}
        {/* FIX: Add isSellerLive badge and adjust other badges to prevent overlap. */}
        {isFeatured && !isCheckingFeatured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-20">
            <Sparkles size={12} className="fill-white" /> FEATURED
          </div>
        )}
        {isSellerLive && (
          <div
            className={`absolute top-2 ${isFeatured ? 'left-24' : 'left-2'} bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse z-10`}
          >
            <Wifi size={12} /> LIVE
          </div>
        )}
        {product.isDigital && (
          <div
            className={`absolute top-2 ${isFeatured ? 'left-32' : isSellerLive ? 'left-20' : 'left-2'} bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md`}
          >
            <Download size={12} /> Digital
          </div>
        )}
        {product.video && product.video.length > 0 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm">
            <Play size={12} fill="currentColor" />
          </div>
        )}
        {/* Save/Favorite and Share buttons */}
        {!isManagementView && (
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              onClick={handleShareClick}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md backdrop-blur-sm transition"
              title="Share listing"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleFavoriteClick}
              className={`${
                isFavorited 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white/90 hover:bg-white text-gray-700'
              } p-2 rounded-full shadow-md backdrop-blur-sm transition`}
              title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        )}
        {product.status === 'Out of Stock' && !product.isDigital && (
          <div
            className={`absolute top-2 ${isFeatured ? 'left-32' : isSellerLive ? 'left-20' : 'left-2'} bg-gray-800 bg-opacity-80 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm`}
          >
            Out of Stock
          </div>
        )}
      </div>

      <div className={`${isCompact ? 'p-3' : 'p-4'} flex-1 flex flex-col`}>
        <h3
          className={`${isCompact ? 'text-[13px] h-9 mb-0.5' : 'text-sm h-10 mb-1'} font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-orange-600`}
        >
          {product.title}
        </h3>

        {product.averageRating && isRetail && !isCompact && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-xs font-bold text-gray-700">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">({product.reviewCount} Reviews)</span>
          </div>
        )}

        {product.price ? (
          <div className={isCompact ? 'mb-2' : 'mb-3'}>
            <span
              className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-gray-900 block leading-tight`}
            >
              {product.currency} {product.price.toLocaleString()}
            </span>
            {product.isWholesale && !isCompact && (
              <span className="text-xs text-gray-500 font-medium">
                {product.minOrder ? `Min. Order: ${product.minOrder} units` : 'Wholesale Price'}
              </span>
            )}
          </div>
        ) : (
          <div className="mb-3 h-[28px] flex items-center">
            <span className="text-sm font-semibold text-orange-600">Contact for Quote</span>
          </div>
        )}

        <div
          className={`flex items-center gap-2 text-xs text-gray-500 ${isCompact ? 'mb-2.5' : 'mb-4'}`}
        >
          <span
            className="truncate font-medium text-gray-600 hover:text-orange-600 hover:underline cursor-pointer transition"
            onClick={(e) => {
              e.stopPropagation();
              onViewSeller?.(product.sellerId, product.sellerName);
            }}
          >
            {product.sellerName}
          </span>
          {product.verified && <ShieldCheck className="text-green-500 shrink-0" size={14} />}
          <div
            className={`ml-auto text-gray-400 truncate shrink-0 flex items-center gap-1 ${isCompact ? 'max-w-[45%]' : ''}`}
          >
            {product.isDigital ? (
              <>
                <Download size={12} /> Instant Delivery
              </>
            ) : product.town ? (
              <>
                <MapPin size={12} />
                {product.town}
              </>
            ) : null}
          </div>
        </div>

        {isRetail && !isCompact && (
          <div className="mb-3 text-xs text-gray-500">
            Payment: <span className="font-semibold text-gray-700">{paymentArrangementLabel}</span>
          </div>
        )}

        <div className="mt-auto flex gap-2 flex-col">
          {isManagementView ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-md hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-md hover:bg-red-700 transition font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
              {!isFeatured && !isCheckingFeatured && (
                <button
                  onClick={handleFeatureClick}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm py-2.5 rounded-md hover:from-yellow-600 hover:to-orange-600 transition font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> Feature for KES {FEATURED_LISTING_PRICE}
                </button>
              )}
              {isFeatured && !isCheckingFeatured && (
                <div className="w-full bg-green-50 border-2 border-green-500 text-green-700 text-sm py-2.5 rounded-md text-center font-bold flex items-center justify-center gap-2">
                  <Sparkles size={16} className="fill-green-700" /> Featured ✓
                </div>
              )}
            </>
          ) : (
            <>
              {isPaidTier && product.seller_phone ? (
                <>
                  <button
                    onClick={handleWhatsAppClick}
                    className={`w-full bg-green-500 hover:bg-green-600 text-white ${isCompact ? 'py-2.5 text-sm' : 'py-3 text-base'} rounded-md transition font-bold flex items-center justify-center gap-2`}
                  >
                    <MessageCircle size={isCompact ? 16 : 18} />{' '}
                    {isCompact ? 'Chat' : 'Chat on WhatsApp'}
                  </button>
                  <div
                    className={`w-full bg-gray-100 text-gray-700 ${isCompact ? 'py-1.5 text-xs' : 'py-2 text-sm'} rounded-md text-center font-semibold flex items-center justify-center gap-2`}
                  >
                    <Phone size={15} /> {product.seller_phone}
                  </div>
                </>
              ) : product.seller_phone ? (
                <div
                  className={`w-full bg-gray-100 text-gray-700 ${isCompact ? 'py-2 text-sm' : 'py-3'} rounded-md text-center font-semibold flex items-center justify-center gap-2`}
                >
                  <Phone size={16} /> {product.seller_phone}
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContactSupplier(product);
                  }}
                  className={`w-full bg-blue-600 text-white ${isCompact ? 'text-xs py-2' : 'text-sm py-2.5'} rounded-md hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2`}
                >
                  <MessageCircle size={isCompact ? 14 : 16} />{' '}
                  {isCompact ? 'Contact' : 'Contact Supplier'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <FeaturedListingModal
        isOpen={isFeaturedModalOpen}
        onClose={() => setIsFeaturedModalOpen(false)}
        onConfirm={handleFeaturedPayment}
        listingTitle={product.title}
        listingPrice={product.price}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listingTitle={product.title}
        listingUrl={getListingUrl()}
        listingPrice={product.price}
        currency={product.currency}
      />
    </div>
  );
};
