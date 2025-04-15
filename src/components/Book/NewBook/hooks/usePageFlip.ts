import { RefObject, useCallback, useRef, useState } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { Corner, FlipDirection, PageRect } from "../model";
import Helper from "../Helper";

interface UsePageFlipParams {
  isRtl: boolean;
  isSinglePage: boolean;
  currentPage: number;
  pagesAmount: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookRef: RefObject<HTMLDivElement>;
  bookRect: PageRect;
  setCurrentPage: (pageNum: number, usePrev?: boolean) => void;
}

const ANIMATION_DURATION = 500;
const DRAG_THRESHOLD = 20; // Distance in pixels to determine if a drag is intentional

export const usePageFlip = ({
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
  currentPage,
  pagesAmount,
  bookRect,
  setCurrentPage,
  isSinglePage,
}: UsePageFlipParams) => {
  const status = useRef<"" | "drag" | "hover" | "animation">("");

  const [pagesConfig, setPagesConfig] = useState(() => ({
    mainPageNum: currentPage,
    backPageNum: currentPage - 1,
    belowPageNum: currentPage + 1,
  }));

  const setPageNums = useCallback(
    (pageNum: number, direction: FlipDirection) => {
      const backPageNum = Helper.getHiddenPageNum(
        pageNum,
        isSinglePage,
        direction,
        true
      );
      const belowPageNum = Helper.getHiddenPageNum(
        pageNum,
        isSinglePage,
        direction
      );

      // Fix: Ensure page numbers are within valid range
      const validBackPage = Math.max(0, Math.min(pagesAmount - 1, backPageNum));
      const validBelowPage = Math.max(
        0,
        Math.min(pagesAmount - 1, belowPageNum)
      );

      const config = {
        mainPageNum: pageNum,
        backPageNum: validBackPage,
        belowPageNum: validBelowPage,
      };

      if (
        config.backPageNum === pagesConfig.backPageNum &&
        config.belowPageNum === pagesConfig.belowPageNum &&
        config.mainPageNum === pagesConfig.mainPageNum
      ) {
        return;
      }

      setPagesConfig(config);
    },
    [
      isSinglePage,
      pagesAmount,
      pagesConfig.backPageNum,
      pagesConfig.belowPageNum,
      pagesConfig.mainPageNum,
    ]
  );

  const getSpringConfig = ({
    direction = FlipDirection.FORWARD,
    immediate = false,
    x = 0,
    y = 0,
    progress = 0,
    corner = "none",
  }: {
    direction?: FlipDirection;
    immediate?: boolean;
    x?: number;
    y?: number;
    progress?: number;
    corner?: Corner;
  }) => ({
    x,
    y,
    progress,
    immediate,
    direction,
    corner,
  });

  const getDirByPoint = (isLeft: boolean) => {
    return isLeft
      ? isRtl
        ? FlipDirection.FORWARD
        : FlipDirection.BACK
      : isRtl
        ? FlipDirection.BACK
        : FlipDirection.FORWARD;
  };

  // Initialize with default spring values
  const [props, api] = useSprings(2, () => ({
    ...getSpringConfig({}),
    config: {
      tension: 280,
      friction: 25,
    },
  }));

  const getEndX = useCallback(
    (
      direction: FlipDirection,
      left: number,
      width: number,
      reverse = false
    ) => {
      const condition = (direction === FlipDirection.FORWARD) !== isRtl;

      return (reverse ? !condition : condition) ? left : left + width;
    },
    [isRtl]
  );

  const animateNextPage = useCallback(
    (params: {
      idx: number;
      direction: FlipDirection;
      corner: Corner;
      isFullAnimate?: boolean;
      nextPageNum?: number;
    }) => {
      // Prevent multiple animations
      if (status.current === "animation") {
        return;
      }

      status.current = "animation";
      const {
        idx,
        direction,
        corner,
        isFullAnimate,
        nextPageNum = -1,
      } = params;

      if (nextPageNum > -1) {
        setPageNums(nextPageNum - 1, direction);
      }

      const rect = bookRef.current!.getBoundingClientRect();
      const { top: origTop, height, left, width } = rect;
      const top = origTop + scrollY;

      api.start((i) => {
        if (i !== idx) return {};

        const x = getEndX(direction, left, width);
        const y = corner.includes("top") ? top : top + height;

        const to = {
          ...getSpringConfig({
            corner,
            y,
            x,
            progress: 100,
            direction,
          }),
        };

        const topMargins = height / 10;
        const config = isFullAnimate
          ? {
              to,
              from: {
                ...to,
                x: getEndX(direction, left, width, true),
                progress: 0,
                y: corner.includes("top") ? y + topMargins : y - topMargins,
              },
            }
          : to;

        return {
          ...config,
          config: {
            tension: 180,
            friction: 25,
            duration: ANIMATION_DURATION,
          },
          onRest: () => {
            // Only process animation completion for the specific spring being animated
            if (i === idx) {
              api.start((j) => {
                if (j !== idx) return {};
                status.current = "";

                return {
                  ...getSpringConfig({
                    immediate: true,
                  }),
                };
              });

              if (nextPageNum >= 0) {
                setCurrentPage(nextPageNum, false);
              } else {
                if (direction === FlipDirection.BACK) {
                  onPrevPage();
                } else {
                  onNextPage();
                }
              }
            }
          },
        };
      });
    },
    [api, bookRef, getEndX, onNextPage, onPrevPage, setCurrentPage, setPageNums]
  );

  const handleDragEnd = ({
    progress,
    idx,
    direction,
    corner,
  }: {
    progress: number;
    idx: number;
    direction: FlipDirection;
    corner: Corner;
  }) => {
    if (progress < 50) {
      // Not far enough to flip - animate back to start
      api.start((i) => {
        if (idx !== i) return {};
        status.current = "animation";

        const x = getEndX(direction, bookRect.left, bookRect.width, true);
        const y = corner.includes("top")
          ? bookRect.top
          : bookRect.top + bookRect.height;

        return {
          to: getSpringConfig({ direction, corner, x, y }),
          config: {
            tension: 280,
            friction: 25,
            duration: ANIMATION_DURATION / 2,
          },
          onRest: () => {
            if (i === idx) {
              status.current = "";
              return {
                ...getSpringConfig({ corner: "none", immediate: true }),
              };
            }
          },
        };
      });
    } else {
      // Far enough to complete the flip
      animateNextPage({ idx, direction, corner });
    }
  };

  const animateDrag = ({
    idx,
    progress,
    direction,
    x,
    y,
    corner,
  }: {
    idx: number;
    progress: number;
    direction: FlipDirection;
    x: number;
    y: number;
    corner: Corner;
  }) => {
    api.start((i) => {
      if (idx !== i) return {};

      return {
        ...getSpringConfig({
          direction,
          immediate: true,
          x,
          y,
          corner,
          progress,
        }),
      };
    });
  };

  const resetLocation = (idx: number, direction: FlipDirection) => {
    api.start((i) => {
      if (idx !== i) return {};

      return {
        ...getSpringConfig({ direction }),
      };
    });
    status.current = "";
  };

  const bind = useGesture(
    {
      onMouseLeave: ({ args: [idx] }) => {
        if (status.current !== "hover") return;
        const pageNum: number = currentPage + idx;
        const isLeft = Helper.isLeftPage(pageNum, isRtl);
        const direction = getDirByPoint(isLeft);

        resetLocation(idx, direction);
      },

      onMouseMove: ({ args: [idx], event: { clientX: x, clientY: y } }) => {
        if (status.current === "drag" || status.current === "animation") return;

        if (status.current !== "hover") {
          status.current = "hover";
        }

        // Adjust for scroll position
        y = y + scrollY;
        const pageNum: number = currentPage + idx;

        const { isLeftPage } = getPageProps({
          pageNum,
          isRtl,
          x,
          y,
          rect: bookRect,
        });

        const direction = getDirByPoint(isLeftPage);
        setPageNums(pageNum, direction);
        const progress = Helper.getProgress(x, !isLeftPage, bookRef);

        // Only trigger hover effects if within a certain threshold
        if (progress > 10) {
          resetLocation(idx, direction);
          return;
        }

        // Get the corner where the mouse is hovering
        const corner = Helper.getCorner(
          x,
          y,
          isLeftPage,
          bookRect,
          bookRect.height / 10
        );

        api.start((i) => {
          if (idx !== i) return {};
          return {
            ...getSpringConfig({ direction, corner, immediate: true }),
            x,
            y,
            progress,
          };
        });
      },

      onClick: ({ args: [idx], event: { clientX, clientY } }) => {
        if (status.current === "drag" || status.current === "animation") return;

        // Adjust for scroll position
        clientY = clientY + scrollY;

        const pageNum: number = currentPage + idx;

        const { isLeftPage, corner } = getPageProps({
          pageNum,
          isRtl,
          x: clientX,
          y: clientY,
          rect: bookRect,
        });

        const clickLocation = Helper.getXClickLocation(
          clientX,
          isLeftPage,
          bookRect.pageWidth / 2,
          bookRect.left,
          bookRect.width
        );

        const action = Helper.getActionByClick(
          clickLocation,
          isRtl,
          isSinglePage
        );
        const direction =
          action === "prev" ? FlipDirection.BACK : FlipDirection.FORWARD;

        setPageNums(pageNum, direction);

        if (!action || isBlockMove(currentPage, pagesAmount, direction)) return;

        animateNextPage({ idx, direction, corner, isFullAnimate: true });
      },

      onDrag: ({
        down,
        args: [idx],
        direction: [xDir],
        xy: [px, py],
        memo,
        tap,
        movement: [mx, my],
      }) => {
        // Adjust for scroll position
        py = py + scrollY;
        idx = idx as number;

        // Don't process drags during animation or for taps
        if (tap || status.current === "animation") return;
        status.current = "drag";

        // Determine drag direction (horizontal)
        const dir = xDir < 0 ? -1 : 1;

        // Initialize drag state if not yet initialized
        if (!memo) {
          // Require a minimum drag distance before starting the animation
          if (Math.abs(mx) < DRAG_THRESHOLD && Math.abs(my) < DRAG_THRESHOLD) {
            status.current = "";
            return;
          }

          if (!xDir) {
            status.current = "";
            return;
          }

          const pageNum: number = currentPage + idx;
          const direction = Helper.getDirection(isRtl, xDir);
          setPageNums(pageNum, direction);

          // Don't allow flipping if we're at a boundary page or in certain configurations
          if (!isMoveAllowed(pageNum, pagesAmount, direction, isSinglePage)) {
            status.current = "";
            return;
          }

          const { isLeftPage, corner, rect } = getPageProps({
            pageNum,
            isRtl,
            x: px,
            y: py,
            rect: bookRect,
          });

          // Return initial drag state
          return {
            direction,
            isLeftPage,
            corner,
            rect,
          };
        }

        // Calculate progress based on position
        const progress = Helper.getProgress(px, !memo.isLeftPage, bookRef);

        // Set up props for drag animation or completion
        const props = {
          progress,
          idx,
          direction: memo.direction as FlipDirection,
          x: px,
          y: py,
          corner: memo.corner as Corner,
        };

        if (!down) {
          // When drag ends, determine if we should complete the flip
          handleDragEnd(props);
        } else {
          // Continue animating during drag
          animateDrag(props);
        }

        return memo;
      },
    },
    {
      drag: {
        bounds: bookRef,
        preventScroll: true,
        threshold: DRAG_THRESHOLD,
      },
      eventOptions: { passive: true },
    }
  );

  return { props, bind, api, animateNextPage, pagesConfig };
};

/**
 * Checks if movement is blocked due to being at a boundary page
 */
function isBlockMove(
  currentPage: number,
  totalPages: number,
  direction: FlipDirection
) {
  if (
    (currentPage === totalPages - 1 && direction === FlipDirection.FORWARD) ||
    (currentPage === 0 && direction === FlipDirection.BACK)
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if page movement is allowed in the current state
 */
function isMoveAllowed(
  currentPage: number,
  totalPages: number,
  direction: FlipDirection,
  isSinglePage: boolean
) {
  // Check boundary conditions
  if (isBlockMove(currentPage, totalPages, direction)) {
    return false;
  }

  // In single page mode, or if page configuration aligns with direction, allow movement
  return (
    isSinglePage ||
    !((currentPage % 2 === 1) === (direction === FlipDirection.FORWARD))
  );
}

/**
 * Gets page properties based on current state
 */
function getPageProps({
  pageNum,
  isRtl,
  x,
  y,
  rect,
}: {
  pageNum: number;
  isRtl: boolean;
  x: number;
  y: number;
  rect: PageRect;
}) {
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const corner = Helper.getCorner(x, y, isLeftPage, rect);

  return { isLeftPage, corner, rect };
}
