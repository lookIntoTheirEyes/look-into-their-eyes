import { useState, useEffect, useRef, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { Orientation, Page } from "@/lib/model/book";
import { PanInfo, TapInfo } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

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
  const [draggingPage, setDraggingPage] = useState<DraggingPage>(null);
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

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryParamPage = +searchParams.get("page")!;

  const bookContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = pagesContent.length + (toc ? 1 : 0);
  const dragThreshold = bookStyle.width / 4;

  const pageNum =
    (queryParamPage <= 0 || queryParamPage > totalPages ? 1 : queryParamPage) -
    1;

  const [currentPage, setCurrentPage] = useState(
    pageNum && pageNum % 2 === 0 ? pageNum - 1 : pageNum
  );

  const updateUrlWithSearchParams = useCallback(
    (pageNum: number) => {
      router.push(
        { pathname, query: { page: pageNum.toString() } },
        { scroll: false }
      );
    },
    [pathname, router]
  );

  const calculateBookStyle = useCallback(
    ({
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
    },
    []
  );

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
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
    },
    [calculateBookStyle]
  );

  const isSinglePage = useCallback(
    () => bookStyle.mode === Orientation.PORTRAIT,
    [bookStyle.mode]
  );

  const updatePage = useCallback(
    (pageNum: number) => {
      setCurrentPage((prev) => prev + pageNum);
      updateUrlWithSearchParams(currentPage + pageNum + 1);
    },
    [currentPage, updateUrlWithSearchParams]
  );

  const handleNextPage = useCallback(() => {
    if (!isSinglePage() && currentPage % 2 === 1 && currentPage) {
      if (currentPage + 1 < totalPages) updatePage(2);
    } else {
      if (currentPage < totalPages - 1) updatePage(1);
    }
  }, [isSinglePage, currentPage, totalPages, updatePage]);

  const handlePrevPage = useCallback(() => {
    if (
      !isSinglePage() &&
      currentPage % 2 === 1 &&
      currentPage !== 1 &&
      currentPage !== totalPages
    ) {
      updatePage(-2);
    } else {
      updatePage(-1);
    }
  }, [isSinglePage, currentPage, totalPages, updatePage]);

  const getIsLeftPage = useCallback(
    (x: number) => {
      const pageWidth = bookStyle.width / 2;
      return x >= bookStyle.left && x <= bookStyle.left + pageWidth;
    },
    [bookStyle.width, bookStyle.left]
  );

  const getXClickLocation = useCallback(
    (x: number): PageMouseLocation => {
      const isLeftPage = getIsLeftPage(x);
      if (isLeftPage) {
        return x <= bookStyle.left + dragThreshold
          ? "leftPageLeft"
          : "leftPageRight";
      }

      return bookStyle.right - x <= dragThreshold
        ? "rightPageRight"
        : "rightPageLeft";
    },
    [getIsLeftPage, bookStyle.left, bookStyle.right, dragThreshold]
  );

  const setFlipOnDrag = useCallback(
    (clickLocation: PageMouseLocation) => {
      const isLeftDragging = draggingPage === "left";

      if (isRtl) {
        if (isLeftDragging) {
          if (clickLocation !== "leftPageLeft") {
            handleNextPage();
          }
        } else {
          if (clickLocation !== "rightPageRight") {
            handlePrevPage();
          }
        }
      } else {
        if (isLeftDragging) {
          if (clickLocation !== "leftPageLeft") {
            handlePrevPage();
          }
        } else {
          if (clickLocation !== "rightPageRight") {
            handleNextPage();
          }
        }
      }
    },
    [draggingPage, handleNextPage, handlePrevPage, isRtl]
  );

  const setFlipOnClick = useCallback(
    (clickLocation: PageMouseLocation) => {
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
    },
    [handleNextPage, handlePrevPage, isRtl]
  );

  const handleFlipPageOnMouseGesture = useCallback(
    (x: number, isDrag = false) => {
      const clickLocation = getXClickLocation(x);

      if (!isDrag) {
        setFlipOnClick(clickLocation);
      } else {
        setFlipOnDrag(clickLocation);
      }
    },
    [getXClickLocation, setFlipOnClick, setFlipOnDrag]
  );

  const onTap = useCallback(
    (event: MouseEvent, { point: { x } }: TapInfo) => {
      const target = event.target as HTMLElement;

      if (draggingPage || target.tagName === "BUTTON") {
        return;
      }

      handleFlipPageOnMouseGesture(x);
    },
    [draggingPage, handleFlipPageOnMouseGesture]
  );

  const handleDrag = useCallback(
    (_: MouseEvent, info: PanInfo) => {
      if (draggingPage) {
        return;
      }

      setDraggingPage(getIsLeftPage(info.point.x) ? "left" : "right");
    },
    [draggingPage, getIsLeftPage]
  );

  const handleDragEnd = useCallback(
    (_: Event, info: PanInfo) => {
      handleFlipPageOnMouseGesture(info.point.x, true);
      setDraggingPage(null);
    },
    [handleFlipPageOnMouseGesture]
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextPage,
    onSwipedRight: handlePrevPage,
    trackMouse: true,
    trackTouch: true,
  });

  useEffect(() => {
    const container = bookContainerRef.current; // Capture the current value of the ref
    const resizeObserver = new ResizeObserver(handleResize);

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container); // Use the captured container reference
      }
    };
  }, [handleResize]);

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
    updatePage: setCurrentPage,
  };
}
