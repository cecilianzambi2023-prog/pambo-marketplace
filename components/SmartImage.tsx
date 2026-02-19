import React from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop';

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'low',
  ...rest
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onError={(event) => {
        const imageElement = event.currentTarget;
        if (imageElement.src !== fallbackSrc) {
          imageElement.src = fallbackSrc;
        }
      }}
      {...rest}
    />
  );
};

export default SmartImage;
