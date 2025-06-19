import React, { useState, useEffect } from 'react';

interface PlaceholderImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt?: string;
  className?: string; // For TailwindCSS styling of the container and image
  placeholderClassName?: string; // For specific styling of the placeholder div
  // Example: placeholder could be a div with shimmer effect or an icon
  placeholderContent?: React.ReactNode;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  placeholderContent,
  ...imgProps // Spread other img attributes like width, height if passed directly
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      // If no src is provided initially, treat as error or perpetually loading placeholder
      // Or, if src can change, reset states when src changes
      setLoading(false); // Not loading if no src
      setError(true); // Or a different state for "no image"
      return;
    }
    setLoading(true);
    setError(false);
    // Image object for preloading is not strictly necessary for basic onLoad/onError on <img>
    // but can be useful for more complex scenarios or if src might not trigger load events consistently.
  }, [src]); // Reset loading/error state when src changes

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    console.warn('Image loading error for src:', src);
  };

  const showPlaceholder = loading || error || !src;

  return (
    <div className={`relative ${className} bg-background-tertiary overflow-hidden`}> {/* Container */}
      {showPlaceholder && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${placeholderClassName} ${error ? 'bg-red-900 bg-opacity-20' : ''}`}
        >
          {placeholderContent ? (
            placeholderContent
          ) : error ? (
            <span className="text-text-muted text-xl">!</span> // Simple error indicator
          ) : (
            <div className="w-full h-full animate-pulse bg-background-tertiary"></div> // Simple shimmer
          )}
        </div>
      )}
      {src && ( // Only render img tag if src is provided
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${showPlaceholder ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          onLoad={handleLoad}
          onError={handleError}
          {...imgProps} // Spread any other img attributes
        />
      )}
    </div>
  );
};

export default PlaceholderImage;
