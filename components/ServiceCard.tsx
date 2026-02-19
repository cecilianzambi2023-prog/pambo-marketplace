import React from 'react';
import { Product } from '../types';
import { ShieldCheck, MapPin, Star, Play, Briefcase, MessageCircle, Phone } from 'lucide-react';
import { generateWhatsAppLink } from '../services/whatsappService';

interface ServiceCardProps {
  service: Product;
  onViewService: (service: Product) => void;
  onContactSupplier: (service: Product) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onViewService,
  onContactSupplier
}) => {
  // Check if seller has paid subscription
  const isPaidTier =
    service.seller_subscription_tier &&
    ['starter', 'pro', 'enterprise', 'mkulima'].includes(service.seller_subscription_tier);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!service.seller_phone) {
      onContactSupplier(service);
      return;
    }
    const message = `Hi, I'm interested in your service: ${service.title}\nHourly Rate: ${service.currency} ${service.price}\nPlease tell me more!`;
    const whatsappLink = generateWhatsAppLink(service.seller_phone, message);
    window.open(whatsappLink, '_blank');
  };

  return (
    <div
      onClick={() => onViewService(service)}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Briefcase size={48} className="text-gray-400" />
          </div>
        )}
        {service.video && (
          <div className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm">
            <Play size={12} fill="currentColor" />
          </div>
        )}
        {service.verified && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <ShieldCheck size={14} />
            Verified by Pambo
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
          {service.category}
        </p>
        <h3 className="text-md font-bold text-gray-800 line-clamp-2 mb-2 leading-tight flex-1 group-hover:text-orange-700">
          {service.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">
            {service.sellerName.charAt(0)}
          </div>
          <span className="truncate font-medium text-gray-700">{service.sellerName}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 h-4">
          {service.town && (
            <span className="truncate shrink-0 flex items-center gap-1">
              <MapPin size={12} />
              {service.town}
            </span>
          )}
        </div>

        <div className="mt-auto">
          {isPaidTier && service.seller_phone ? (
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md transition font-bold flex items-center justify-center gap-2 text-base"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </button>
          ) : service.seller_phone ? (
            <div className="w-full bg-gray-100 text-gray-700 py-3 rounded-md text-center font-semibold flex items-center justify-center gap-2">
              <Phone size={16} /> {service.seller_phone}
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContactSupplier(service);
              }}
              className="w-full bg-orange-600 text-white text-sm py-2.5 rounded-md hover:bg-orange-700 transition font-bold flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} /> Contact Supplier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
