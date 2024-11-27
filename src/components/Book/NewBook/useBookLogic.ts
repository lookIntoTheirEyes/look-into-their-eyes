import { useState, useCallback } from "react";
import { Page } from "@/lib/model/book";
import { PanInfo, TapInfo } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { BookStyle } from "./useBookStyle";
import { isLeftPage as isLeftPageFunc } from "./utils";
import Helper from "./Helper";
import { FlipCorner, FlipDirection } from "./model";

type PageMouseLocation =
  | "leftPageLeft"
  | "leftPageRight"
  | "rightPageLeft"
  | "rightPageRight";

interface DraggingParams {
  page: DraggingPage;
  corner: FlipCorner | null;
  direction: FlipDirection | null;
}

type DraggingPage = "left" | "right" | null;

const initialDraggingParams: DraggingParams = {
  page: null,
  corner: null,
  direction: null,
};

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryParamPage = +searchParams.get("page")!;
  const totalPages = pagesContent.length + (toc ? 1 : 0);
  const pageNum =
    (queryParamPage <= 0 || queryParamPage > totalPages ? 1 : queryParamPage) -
    1;

  const [currentPage, setCurrentPage] = useState(
    pageNum && pageNum % 2 === 0 ? pageNum - 1 : pageNum
  );
  const [draggingParams, setDraggingParams] = useState(initialDraggingParams);

  const dragThreshold = bookStyle.width / 4;

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

  const getXClickLocation = useCallback(
    (x: number): PageMouseLocation => {
      const isLeftPage = isLeftPageFunc(x, bookStyle);
      if (isLeftPage) {
        return x <= bookStyle.left + dragThreshold
          ? "leftPageLeft"
          : "leftPageRight";
      }

      return bookStyle.left + bookStyle.width - x <= dragThreshold
        ? "rightPageRight"
        : "rightPageLeft";
    },
    [bookStyle, dragThreshold]
  );

  const setFlipOnDrag = useCallback(
    (clickLocation: PageMouseLocation) => {
      const isLeftDragging = draggingParams.page === "left";

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
    [draggingParams.page, handleNextPage, handlePrevPage, isRtl]
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
    (x: number, isDrag?: boolean) => {
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

      if (draggingParams.page || target.tagName === "BUTTON") {
        return;
      }

      handleFlipPageOnMouseGesture(x);
    },
    [draggingParams.page, handleFlipPageOnMouseGesture]
  );

  const handleDrag = useCallback(
    (_: MouseEvent, { point: { x, y } }: PanInfo) => {
      if (draggingParams.page) {
        return;
      }

      const direction = Helper.getDirectionByPoint({ x, y }, bookStyle, isRtl);

      const flipCorner: FlipCorner =
        y >= bookStyle.height / 2 ? FlipCorner.BOTTOM : FlipCorner.TOP;

      setDraggingParams({
        page: isLeftPageFunc(x, bookStyle) ? "left" : "right",
        corner: flipCorner,
        direction,
      });
    },
    [bookStyle, draggingParams.page, isRtl]
  );

  const handleDragEnd = useCallback(
    (_: Event, info: PanInfo) => {
      const direction = draggingParams.direction;

      if (
        (direction === FlipDirection.FORWARD && currentPage !== totalPages) ||
        (direction === FlipDirection.BACK && currentPage)
      ) {
        handleFlipPageOnMouseGesture(info.point.x, true);
      }

      setDraggingParams(initialDraggingParams);
    },
    [
      currentPage,
      draggingParams.direction,
      handleFlipPageOnMouseGesture,
      totalPages,
    ]
  );

  return {
    totalPages,
    currentPage,
    setCurrentPage: updatePage,
    handleNextPage,
    handlePrevPage,
    handleDrag,
    handleDragEnd,
    onTap,
  };
}
