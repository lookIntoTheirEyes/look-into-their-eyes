import { useState, useEffect, useRef, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { Orientation, Page } from "@/lib/model/book";

export interface BookLogicParams {
  pagesContent: React.ReactNode[];
  isRtl: boolean;
  toc?: {
    title: string;
    pages: Page[];
  };
}

export function useBookLogic({ pagesContent, isRtl, toc }: BookLogicParams) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [bookStyle, setBookStyle] = useState<{
    height: number;
    width: number;
    mode: Orientation;
  }>({
    height: 0,
    width: 0,
    mode: Orientation.LANDSCAPE,
  });
  const [dragX, setDragX] = useState(0);

  const bookContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = pagesContent.length + (toc ? 1 : 0);
  const dragThreshold = 100;

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (entry.target === bookContainerRef.current) {
      const { width, height } = entry.contentRect;
      calculateBookStyle(width, height);
    }
  }, []);

  const calculateBookStyle = (
    containerWidth: number,
    containerHeight: number
  ) => {
    const aspectRatio = 1.4; // Ideal book aspect ratio
    const isMobile = containerWidth <= 600;

    let height = 0,
      width = 0;

    if (isMobile) {
      height = containerWidth * aspectRatio;
    } else {
      height = containerWidth / aspectRatio;

      if (height > containerHeight) {
        height = containerHeight;
        width = height * aspectRatio;
      }
    }

    setBookStyle({
      width: width || containerWidth,
      height,
      mode: isMobile ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
    });
  };

  const handleNextPage = () => {
    if (!isSinglePage() && currentPage % 2 === 1 && currentPage) {
      if (currentPage + 1 < totalPages) setCurrentPage((prev) => prev + 2);
    } else {
      if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (
      !isSinglePage() &&
      currentPage % 2 === 1 &&
      currentPage !== 1 &&
      currentPage !== totalPages
    ) {
      setCurrentPage((prev) => prev - 2);
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleDrag = (_: Event, info: { offset: { x: number } }) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (_: Event, info: { offset: { x: number } }) => {
    if (info.offset.x > dragThreshold && currentPage > 0) handlePrevPage();
    if (info.offset.x < -dragThreshold && currentPage < totalPages - 1)
      handleNextPage();
    setDragX(0);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextPage,
    onSwipedRight: handlePrevPage,
    trackMouse: true,
    trackTouch: true,
    onTouchStartOrOnMouseDown: ({ event }) => {},
  });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);

    if (bookContainerRef.current) {
      resizeObserver.observe(bookContainerRef.current);
    }

    return () => {
      if (bookContainerRef.current) {
        resizeObserver.unobserve(bookContainerRef.current);
      }
    };
  }, [handleResize]);

  const isSinglePage = () => bookStyle.mode === Orientation.PORTRAIT;

  return {
    currentPage,
    bookStyle,
    totalPages,
    dragX,
    handleNextPage,
    handlePrevPage,
    handleDrag,
    handleDragEnd,
    swipeHandlers,
    bookContainerRef,

    isSinglePage,
    setCurrentPage,
    setIsDragging,
    isDragging,
  };
}
