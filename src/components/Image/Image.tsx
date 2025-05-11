"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
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

  const urlInfo = useMemo(() => {
    if (!imageUrl.includes("upload/"))
      return { originalUrl: imageUrl, urlStart: "", urlEnd: "" };

    const [urlStart, urlEnd] = imageUrl.split("upload/");
    const cleanUrlEnd = urlEnd.includes("/") ? urlEnd.split("/").pop() : urlEnd;
    const originalUrl = `${urlStart}upload/${cleanUrlEnd}`;

    return { originalUrl, urlStart, urlEnd: cleanUrlEnd };
  }, [imageUrl]);

  const calculateDimensions = useCallback(() => {
    const cacheKey = `img-dim-${urlInfo.urlEnd}-${height}-${window.innerWidth}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const cachedHeight = JSON.parse(cached).height;
        setDisplayHeight(cachedHeight);
        return;
      }
    } catch {}

    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const maxWidth = window.innerWidth - 24;

      if (height * aspectRatio > maxWidth) {
        const newHeight = Math.floor(maxWidth / aspectRatio);
        setDisplayHeight(newHeight);

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ height: newHeight })
          );
        } catch {}
      } else {
        setDisplayHeight(height);

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ height }));
        } catch {}
      }
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${urlInfo.originalUrl}`);
    };

    img.src = urlInfo.originalUrl;
  }, [urlInfo.originalUrl, urlInfo.urlEnd, height]);

  useEffect(() => {
    setWindowLoaded(true);

    calculateDimensions();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        calculateDimensions();
      });

      observer.observe(document.body);

      return () => {
        observer.disconnect();
      };
    } else {
      window.addEventListener("resize", calculateDimensions);
      return () => window.removeEventListener("resize", calculateDimensions);
    }
  }, [calculateDimensions]);

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

export default memo(LocalImage);
