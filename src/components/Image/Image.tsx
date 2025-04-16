"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Only run client-side
    setWindowLoaded(true);

    const calculateDimensions = () => {
      // Create image to get natural dimensions
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

      // Extract original URL from Cloudinary URL if needed
      let originalUrl = imageUrl;
      if (imageUrl.includes("upload/")) {
        const [urlStart, urlEnd] = imageUrl.split("upload/");
        // Remove any existing transformations
        const cleanUrlEnd = urlEnd.includes("/")
          ? urlEnd.split("/").pop()
          : urlEnd;
        originalUrl = `${urlStart}upload/${cleanUrlEnd}`;
      }

      img.src = originalUrl;
    };

    calculateDimensions();

    // Handle window resizes
    const handleResize = () => calculateDimensions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageUrl, height]);

  const getTransformedUrl = (src: string, imgHeight: number) => {
    if (!src.includes("upload/")) return src;

    const [urlStart, urlEnd] = src.split("upload/");
    // Extract the filename portion
    const filename = urlEnd.includes("/") ? urlEnd.split("/").pop() : urlEnd;
    const transformations = `c_scale,h_${imgHeight},q_auto:good`;
    return `${urlStart}upload/${transformations}/${filename}`;
  };

  // Use the adjusted height for the Cloudinary transformation
  const optimizedUrl = windowLoaded
    ? getTransformedUrl(imageUrl, displayHeight)
    : imageUrl;

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
