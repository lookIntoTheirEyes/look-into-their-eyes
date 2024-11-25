import { useState, useEffect, useRef, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { Orientation, Page } from "@/lib/model/book";
import { PanInfo, TapInfo } from "framer-motion";

type PageMouseLocation =
  | "leftPageLeft"
  | "leftPageRight"
  | "rightPageLeft"
  | "rightPageRight";

type DraggingPage = "left" | "right" | null;

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
  const [draggingPage, setDraggingPage] = useState(null as DraggingPage);
  const [bookStyle, setBookStyle] = useState<{
    height: number;
    width: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
    mode: Orientation;
  }>({
    height: 0,
    width: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    mode: Orientation.LANDSCAPE,
  });
  const [dragX, setDragX] = useState(0);

  const bookContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = pagesContent.length + (toc ? 1 : 0);
  const dragThreshold = bookStyle.width / 4;

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (entry.target === bookContainerRef.current) {
      const rect = bookContainerRef.current?.getBoundingClientRect();
      const { contentRect } = entry;
      const { width, height } = contentRect;
      const top = rect.top + contentRect.top;
      const bottom = top + height;
      const left = rect.left + contentRect.left;
      const right = left + width;

      calculateBookStyle({
        ...contentRect,
        ...{ width, height, bottom, top, left, right },
      });
    }
  }, []);

  const calculateBookStyle = ({
    width: containerWidth,
    height: containerHeight,
    top,
    left,
    bottom,
    right,
  }: DOMRectReadOnly) => {
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
      top,
      left,
      bottom,
      right,
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

  const handleDrag = (_: MouseEvent, info: PanInfo) => {
    if (draggingPage) {
      return;
    }

    setDraggingPage(getIsLeftPage(info.point.x) ? "left" : "right");
  };

  const getIsLeftPage = (x: number) => {
    const pageWidth = bookStyle.width / 2;
    return x >= bookStyle.left && x <= bookStyle.left + pageWidth;
  };

  const getXClickLocation = (x: number): PageMouseLocation => {
    const isLeftPage = getIsLeftPage(x);
    if (isLeftPage) {
      return x <= bookStyle.left + dragThreshold
        ? "leftPageLeft"
        : "leftPageRight";
    }

    return bookStyle.right - x <= dragThreshold
      ? "rightPageRight"
      : "rightPageLeft";
  };

  const handleFlipPageOnMouseGesture = (x: number, isDrag = false) => {
    const clickLocation = getXClickLocation(x);

    if (!isDrag) {
      setFlipOnClick(clickLocation);
    } else {
      setFlipOnDrag(clickLocation);
    }
  };

  const setFlipOnDrag = (clickLocation: PageMouseLocation) => {
    const isLeftDragging = draggingPage === "left";

    if (isRtl) {
      if (isLeftDragging) {
        if (clickLocation !== "leftPageLeft") {
          handleNextPage();
        } else {
          // need to go back to current location
        }
        return;
      } else {
        if (clickLocation !== "rightPageRight") {
          handlePrevPage();
        } else {
          // need to go back to current location
        }
        return;
      }
    } else {
      if (isLeftDragging) {
        if (clickLocation !== "leftPageLeft") {
          handlePrevPage();
        } else {
          // need to go back to current location
        }
        return;
      } else {
        if (clickLocation !== "rightPageRight") {
          handleNextPage();
        } else {
          // need to go back to current location
        }
        return;
      }
    }
  };

  const setFlipOnClick = (clickLocation: PageMouseLocation) => {
    if (
      clickLocation === "leftPageRight" ||
      clickLocation === "rightPageLeft"
    ) {
      return;
    }

    if (isRtl) {
      if (clickLocation === "leftPageLeft") {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    } else {
      if (clickLocation === "leftPageLeft") {
        handlePrevPage();
      } else {
        handleNextPage();
      }
    }
  };

  const onTap = (event: MouseEvent, { point: { x } }: TapInfo) => {
    const target = event.target as HTMLElement;

    if (draggingPage || target.tagName === "BUTTON") {
      return;
    }

    handleFlipPageOnMouseGesture(x);
  };

  const handleDragEnd = (_: Event, info: PanInfo) => {
    handleFlipPageOnMouseGesture(info.point.x, true);
    setDraggingPage(null);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextPage,
    onSwipedRight: handlePrevPage,
    trackMouse: true,
    trackTouch: true,
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
    onTap,
    isSinglePage,
    setCurrentPage,
  };
}
