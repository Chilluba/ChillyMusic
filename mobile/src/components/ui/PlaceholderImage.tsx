import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';

interface PlaceholderImageProps {
  sourceURI?: string | null; // URI for the actual image
  style: any; // Style for the Image and placeholder container
  placeholderStyle?: any; // Optional additional style for the placeholder itself
  // placeholderContent?: React.ReactNode; // Optional custom content for placeholder
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  sourceURI,
  style,
  placeholderStyle,
  // placeholderContent,
  resizeMode = 'cover',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false); // Reset error state on new load attempt
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.warn('Image loading error:', error.nativeEvent.error, 'URI:', sourceURI);
    setIsLoading(false);
    setHasError(true);
  };

  // Determine the actual source for the image
  const imageSource = sourceURI ? { uri: sourceURI } : undefined;
  // If no URI or error, effectively show placeholder by rendering nothing for Image
  // or by rendering a specific error/fallback image if desired.

  return (
    <View style={[styles.container, style]}>
      {isLoading && !hasError && (
        <View style={[styles.placeholder, placeholderStyle, StyleSheet.absoluteFill]}>
          <ActivityIndicator size="small" color="#8B949E" />
          {/* Or use placeholderContent if provided */}
        </View>
      )}

      {hasError && (
         <View style={[styles.placeholder, placeholderStyle, StyleSheet.absoluteFill, styles.errorPlaceholder]}>
            {/* Generic icon or message for error state */}
            <Text style={styles.errorText}>!</Text>
         </View>
      )}

      {imageSource && ( // Only render Image if sourceURI is provided
        <Image
          source={imageSource}
          style={[styles.image, StyleSheet.absoluteFill]} // Image fills the container
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd} // Covers both success and error completion
          onError={handleError}
          fadeDuration={0} // Optional: control fade in
        />
      )}
      {/* If !imageSource and !isLoading and !hasError, it means no URI was provided, so placeholder (or nothing if no placeholder defined) */}
      {!imageSource && !isLoading && !hasError && (
         <View style={[styles.placeholder, placeholderStyle, StyleSheet.absoluteFill, styles.errorPlaceholder]}>
            {/* Generic icon or message for error state */}
            <NativeText style={styles.indicatorText}>!</NativeText>
         </View>
      )}

      {imageSource && ( // Only render Image if sourceURI is provided
        <Image
          source={imageSource}
          style={[styles.image, StyleSheet.absoluteFill]} // Image fills the container
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd} // Covers both success and error completion
          onError={handleError}
          fadeDuration={0} // Optional: control fade in
        />
      )}
      {/* If !imageSource and !isLoading and !hasError, it means no URI was provided, so placeholder (or nothing if no placeholder defined) */}
      {!imageSource && !isLoading && !hasError && (
           <View style={[styles.placeholder, placeholderStyle, StyleSheet.absoluteFill, styles.emptyPlaceholder]}>
               {/* Generic icon for missing image */}
               <NativeText style={styles.indicatorText}>?</NativeText>
           </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // Ensures image corners are clipped if container has borderRadius
    backgroundColor: '#21262D', // Background Tertiary - default placeholder bg
    justifyContent: 'center', // Center activity indicator or custom content
    alignItems: 'center',
  },
  image: {
    // No specific styles here, AbsoluteFill will make it cover the container
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  errorPlaceholder: {
    backgroundColor: '#21262D', // Same or slightly different for error indication
  },
  emptyPlaceholder: {
    backgroundColor: '#21262D',
  },
  indicatorText: { // Renamed from errorText to be more generic
      color: '#6E7681', // Text Muted
      fontSize: 24, // Or adjust based on icon size
      fontWeight: 'bold',
  }
});

// Removed custom Text component, using NativeText directly.
import { Text as NativeText } from 'react-native';

export default PlaceholderImage;
