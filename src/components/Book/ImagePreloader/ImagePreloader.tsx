"use client";
import { useEffect } from "react";

/**
 * Maximum number of pages to preload in each direction
 */
const PRELOAD_RANGE = 4;

/**
 * Finds and preloads all image URLs from an element to ensure they're cached
 * @param element Element that might contain images
 */
const preloadImagesFromElement = (element: React.ReactElement | null) => {
  if (!element || !element.props || !element.props.children) return;

  const findImageUrls = (children: React.ReactNode): string[] => {
    if (!children) return [];

    // Handle arrays of children
    if (Array.isArray(children)) {
      return children.flatMap((child) => findImageUrls(child));
    }

    // Handle React elements
    if (typeof children === "object" && "type" in children) {
      // Check if this is an image component with an imageUrl prop
      if (
        children.props &&
        children.props.imageUrl &&
        typeof children.props.imageUrl === "string"
      ) {
        return [children.props.imageUrl];
      }

      // Recursively search children
      return findImageUrls(children.props?.children);
    }

    return [];
  };

  // Find all image URLs
  const imageUrls = findImageUrls(element);

  // Preload all found images
  imageUrls.forEach((url) => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = url;
    }
  });
};

/**
 * Hook to preload images from nearby pages for smoother page transitions
 */
export const usePreloadPages = ({
  pages,
  currentPage,
  isSinglePage,
}: {
  pages: React.ReactElement[];
  currentPage: number;
  isSinglePage: boolean;
}) => {
  useEffect(() => {
    // Don't do anything in SSR
    if (typeof window === "undefined") return;

    // Determine page range to preload based on current settings
    const pagesToPreload = [];
    const increment = isSinglePage ? 1 : 2;

    // Preload pages ahead
    for (let i = 1; i <= PRELOAD_RANGE; i++) {
      const nextPage = currentPage + i * increment;
      if (nextPage < pages.length) {
        pagesToPreload.push(nextPage);
      }
    }

    // Preload pages behind
    for (let i = 1; i <= PRELOAD_RANGE; i++) {
      const prevPage = currentPage - i * increment;
      if (prevPage >= 0) {
        pagesToPreload.push(prevPage);
      }
    }

    // Preload images from all identified pages
    pagesToPreload.forEach((pageIndex) => {
      if (pageIndex >= 0 && pageIndex < pages.length) {
        preloadImagesFromElement(pages[pageIndex]);
      }
    });
  }, [currentPage, pages, isSinglePage]);
};
