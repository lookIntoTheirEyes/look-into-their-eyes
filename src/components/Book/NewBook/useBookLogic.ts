import { useState, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { Page } from "@/lib/model/book";
import { PanInfo, TapInfo } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { BookStyle } from "./useBookStyle";

type PageMouseLocation =
  | "leftPageLeft"
  | "leftPageRight"
  | "rightPageLeft"
  | "rightPageRight";

interface DraggingParams {
  page: DraggingPage;
  corner: "top" | "bottom";
}

type DraggingPage = "left" | "right" | null;

export interface BookLogicParams {
  pagesContent: React.ReactNode[];
  isRtl: boolean;
  toc?: {
    title: string;
    pages: Page[];
  };
  isSinglePage: boolean;
  bookStyle: BookStyle;
}

export function useBookLogic({
  pagesContent,
  isRtl,
  toc,
  bookStyle,
  isSinglePage,
}: BookLogicParams) {
  const totalPages = pagesContent.length + (toc ? 1 : 0);
  const [draggingPage, setDraggingPage] = useState<DraggingPage>(null);

  const [dragX, setDragX] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryParamPage = +searchParams.get("page")!;

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

  const updatePage = useCallback(
    (pageNum: number) => {
      setCurrentPage((prev) => prev + pageNum);
      updateUrlWithSearchParams(currentPage + pageNum + 1);
    },
    [currentPage, updateUrlWithSearchParams]
  );

  const handleNextPage = useCallback(() => {
    if (!isSinglePage && currentPage % 2 === 1 && currentPage) {
      if (currentPage + 1 < totalPages) updatePage(2);
    } else {
      if (currentPage < totalPages - 1) updatePage(1);
    }
  }, [isSinglePage, currentPage, totalPages, updatePage]);

  const handlePrevPage = useCallback(() => {
    if (
      !isSinglePage &&
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

  return {
    totalPages,
    currentPage,
    setCurrentPage: updatePage,
    dragX,
    handleNextPage,
    handlePrevPage,
    handleDrag,
    handleDragEnd,
    swipeHandlers,
    onTap,
  };
}
