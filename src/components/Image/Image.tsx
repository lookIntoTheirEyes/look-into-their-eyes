"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import NextImage from "next/image";

interface LocalImageProps {
  alt?: string;
  imageUrl: string;
  height?: number;
  borderRadius?: string;
  priority?: boolean;
}

const LocalImage: React.FC<LocalImageProps> = ({
  alt = "imageUrl",
  imageUrl,
  height = 250,
  priority = true,
  borderRadius = "4px",
}) => {
  const [displayHeight, setDisplayHeight] = useState(height);
  const [windowLoaded, setWindowLoaded] = useState(false);

  // Extract URL parts only once using memoization
  const urlInfo = useMemo(() => {
    if (!imageUrl.includes("upload/"))
      return { originalUrl: imageUrl, urlStart: "", urlEnd: "" };

    const [urlStart, urlEnd] = imageUrl.split("upload/");
    // Remove any existing transformations
    const cleanUrlEnd = urlEnd.includes("/") ? urlEnd.split("/").pop() : urlEnd;
    const originalUrl = `${urlStart}upload/${cleanUrlEnd}`;

    return { originalUrl, urlStart, urlEnd: cleanUrlEnd };
  }, [imageUrl]);

  // Calculation function that can be reused
  const calculateDimensions = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const maxWidth = window.innerWidth - 24;

      // If image would be wider than the window
      if (height * aspectRatio > maxWidth) {
        // Calculate new height based on max width and aspect ratio
        setDisplayHeight(Math.floor(maxWidth / aspectRatio));
      } else {
        setDisplayHeight(height);
      }
    };

    img.src = urlInfo.originalUrl;
  }, [urlInfo.originalUrl, height]);

  useEffect(() => {
    // Only run client-side
    setWindowLoaded(true);

    // Initial calculation
    calculateDimensions();

    // Set up ResizeObserver to handle viewport size changes
    if (typeof ResizeObserver !== "undefined") {
      // We'll observe the document body to detect viewport changes
      // This is more efficient than listening to window resize events
      const observer = new ResizeObserver(() => {
        calculateDimensions();
      });

      // Observe the document body
      observer.observe(document.body);

      return () => {
        observer.disconnect();
      };
    } else {
      // Fallback for browsers that don't support ResizeObserver
      window.addEventListener("resize", calculateDimensions);
      return () => window.removeEventListener("resize", calculateDimensions);
    }
  }, [calculateDimensions]);

  // Transform URL for optimization
  const optimizedUrl = useMemo(() => {
    if (!windowLoaded || !urlInfo.urlStart || !urlInfo.urlEnd) return imageUrl;

    const transformations = `c_scale,h_${displayHeight},q_auto:good`;
    return `${urlInfo.urlStart}upload/${transformations}/${urlInfo.urlEnd}`;
  }, [windowLoaded, urlInfo, displayHeight, imageUrl]);

  return (
    <NextImage
      src={optimizedUrl}
      alt={alt}
      style={{
        borderRadius,
        height: displayHeight,
        width: "auto",
      }}
      width={500}
      height={500}
      unoptimized
      priority={priority}
    />
  );
};

export default LocalImage;
