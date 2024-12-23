"use client";

import { imageLoader } from "@/lib/utils/utils";
import { useEffect } from "react";
import { IPage } from "@/lib/model/book";

export const preloadImage = (
  imageUrl: string,
  height?: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageLoader({ src: imageUrl, height, quality: 100 });
  });
};

interface PreloadPagesProps {
  pages: JSX.Element[];
  currentPage: number;
  isSinglePage: boolean;
  onLoadComplete?: () => void;
}

export const usePreloadPages = ({
  pages,
  currentPage,
  isSinglePage,
}: PreloadPagesProps) => {
  useEffect(() => {
    const preloadRange = isSinglePage ? 2 : 4;
    const start = Math.max(0, currentPage - preloadRange);
    const end = Math.min(pages.length - 1, currentPage + preloadRange);

    const imagesToPreload = [];

    for (let i = start; i <= end; i++) {
      const page = pages[i];
      const details = page?.props?.details as IPage;
      if (details?.imageUrl) {
        imagesToPreload.push(preloadImage(details.imageUrl));
      }
    }

    Promise.all(imagesToPreload).catch();
  }, [currentPage, pages, isSinglePage]);
};
