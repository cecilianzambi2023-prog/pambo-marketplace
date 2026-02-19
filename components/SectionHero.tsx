import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SmartImage } from './SmartImage';

interface SectionHeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  onCtaClick?: () => void;
  ctaHref?: string;
}

export const SectionHero: React.FC<SectionHeroProps> = ({
  title,
  subtitle,
  imageUrl,
  ctaText,
  onCtaClick,
  ctaHref
}) => {
  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden min-h-[250px] md:min-h-[300px] flex items-center mb-8">
      <SmartImage
        src={imageUrl}
        alt={`${title} background`}
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-overlay"></div>
      <div className="relative container mx-auto px-4 lg:px-8 text-white z-10">
        <div className="max-w-xl">
          <h1 className="hero-title text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {title}
          </h1>
          <p className="hero-subtitle text-lg text-gray-200 mb-6">{subtitle}</p>
          {ctaHref ? (
            <a
              href={ctaHref}
              className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition shadow-lg inline-flex items-center justify-center gap-2"
            >
              {ctaText} <ArrowRight size={20} />
            </a>
          ) : (
            <button
              onClick={onCtaClick}
              className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2"
            >
              {ctaText} <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
