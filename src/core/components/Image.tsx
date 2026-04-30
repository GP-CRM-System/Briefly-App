import { useState, type ImgHTMLAttributes } from 'react';

// Using a transparent 1x1 pixel as a default generic fallback, but they can pass their own
const DefaultFallback = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export type ImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
} & ImgHTMLAttributes<HTMLImageElement>;

export const Image = ({ 
    src, 
    alt, 
    fallbackSrc = DefaultFallback, 
    className, 
    ...props 
}: ImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={`object-cover ${className || ''}`}
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
      {...props} 
    />
  );
};
