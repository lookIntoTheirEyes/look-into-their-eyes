import { RefObject, useCallback, useRef } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { Corner, FlipDirection, PageRect } from "../model";
import Helper from "../Helper";

interface UsePageFlipParams {
  isRtl: boolean;
  currentPage: number;
  pagesAmount: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookRef: RefObject<HTMLDivElement>;
  bookRect: PageRect;
  setCurrentPage: (pageNum: number, usePrev?: boolean) => void;
}
const CORNER_FACTOR = 150;
const ANIMATION_DURATION = 500;

export const usePageFlip = ({
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
  currentPage,
  pagesAmount,
  bookRect,
  setCurrentPage,
}: UsePageFlipParams) => {
  const status = useRef<"" | "drag" | "hover" | "animation">("");

  const { left: bookLeft, width: bookWidth, pageWidth } = bookRect;

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

  const [props, api] = useSprings(2, () => ({
    ...getSpringConfig({}),
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
      const {
        idx,
        direction,
        corner,
        isFullAnimate,
        nextPageNum = -1,
      } = params;

      const {
        top: origTop,
        height,
        left,
        width,
      } = bookRef.current!.getBoundingClientRect();
      const top = origTop + scrollY;

      api.start((i) => {
        if (i !== idx) return;
        status.current = "animation";
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
        const config = isFullAnimate
          ? {
              to,
              from: {
                ...to,
                x: getEndX(direction, left, width, true),
                progress: 0,
                y: corner.includes("top")
                  ? y + CORNER_FACTOR
                  : y - CORNER_FACTOR,
              },
            }
          : to;

        return {
          ...config,
          config: {
            tension: 200,
            friction: 25,
            duration: ANIMATION_DURATION,
          },

          onResolve: () => {
            api.start((i) => {
              if (i !== idx) return;
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
          },
        };
      });
    },
    [api, bookRef, getEndX, onNextPage, onPrevPage, setCurrentPage]
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
      api.start((i) => {
        if (idx !== i) return;
        status.current = "animation";

        const x = getEndX(direction, bookRect.left, bookRect.width, true);

        const y = corner.includes("top")
          ? bookRect.top
          : bookRect.top + bookRect.height;

        return {
          to: getSpringConfig({ direction, corner, x, y }),
          onResolve: () => {
            status.current = "";
            return {
              ...getSpringConfig({ corner: "none", immediate: true }),
            };
          },
        };
      });
    } else {
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
    isDrag = true,
  }: {
    idx: number;
    progress: number;
    direction: FlipDirection;
    x: number;
    y: number;
    corner: Corner;
    isDrag?: boolean;
  }) => {
    api.start((i) => {
      if (idx !== i) return;

      return {
        ...getSpringConfig({
          direction,
          immediate: isDrag,
          x,
          y,
          corner,
          progress,
        }),
      };
    });
  };

  const handleHardPageHover = (
    isLeft: boolean,
    progress: number,
    idx: number,
    x: number,
    y: number,
    corner: Corner
  ) => {
    const direction = getDirByPoint(isLeft);
    if (progress > 10) {
      handleDragEnd({
        progress: 0,
        idx,
        direction,
        corner,
      });
    } else {
      animateDrag({
        idx,
        progress,
        direction,
        x,
        y,
        corner,
        isDrag: false,
      });
    }
  };

  const resetLocation = (idx: number, direction: FlipDirection) => {
    api.start((i) => {
      if (idx !== i) return;

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
        const pageNum = currentPage + idx;
        const isLeft = Helper.isLeftPage(pageNum, isRtl);
        const direction = getDirByPoint(isLeft);

        resetLocation(idx, direction);
      },

      onMouseMove: ({ args: [idx], event: { clientX: x, clientY: y } }) => {
        if (status.current === "drag" || status.current === "animation") return;

        if (status.current !== "hover") {
          status.current = "hover";
        }
        y = y + scrollY;
        const pageNum = currentPage + idx;

        const { isLeftPage, isHardPage } = getPageProps({
          pageNum,
          pagesAmount,
          isRtl,
          x,
          y,
          rect: bookRect,
        });
        const direction = getDirByPoint(isLeftPage);
        const progress = Helper.getProgress(x, !isLeftPage, bookRef);

        if (progress > 10) {
          resetLocation(idx, direction);
          return;
        }

        if (!isHardPage) {
          const corner = Helper.getCorner(
            x,
            y,
            isLeftPage,
            bookRect,
            CORNER_FACTOR
          );

          api.start((i) => {
            if (idx !== i) return;
            return {
              ...getSpringConfig({ direction, corner, immediate: true }),
              x,
              y,
              progress,
            };
          });
          return;
        }

        handleHardPageHover(isLeftPage, progress, idx, 0, 0, "none");
      },

      onClick: ({ args: [idx], event: { clientX, clientY } }) => {
        if (status.current === "drag" || status.current === "animation") return;
        clientY = clientY + scrollY;

        const pageNum = currentPage + idx;

        const { isLeftPage, corner } = getPageProps({
          pageNum,
          pagesAmount,
          isRtl,
          x: clientX,
          y: clientY,
          rect: bookRect,
        });

        const clickLocation = Helper.getXClickLocation(
          clientX,
          isLeftPage,
          pageWidth / 2,
          bookLeft,
          bookWidth
        );
        const action = Helper.getActionByClick(clickLocation, isRtl);
        if (!action) return;

        const direction =
          action === "prev" ? FlipDirection.BACK : FlipDirection.FORWARD;

        animateNextPage({ idx, direction, corner, isFullAnimate: true });
      },

      onDrag: ({
        down,
        args: [idx],
        _direction: [xDir],
        xy: [px, py],
        memo,
        tap,
      }) => {
        py = py + scrollY;
        idx = idx as number;

        if (tap || status.current === "animation") return;
        status.current = "drag";

        const dir = xDir < 0 ? -1 : 1;

        if (!dir && down) {
          status.current = "";
          return memo;
        }

        if (!memo) {
          if (!xDir) {
            status.current = "";
            return;
          }
          const pageNum = currentPage + idx;

          const direction = Helper.getDirection(isRtl, xDir);
          if (!isMoveAllowed(pageNum, pagesAmount, direction)) {
            return;
          }

          const { isLeftPage, isHardPage, corner, rect } = getPageProps({
            pageNum,
            pagesAmount,
            isRtl,
            x: px,
            y: py,
            rect: bookRect,
          });

          return {
            direction,
            isLeftPage,
            corner,
            isHardPage,
            rect,
          };
        }

        const progress = Helper.getProgress(px, !memo.isLeftPage, bookRef);

        const props = {
          progress,
          idx,
          direction: memo.direction as FlipDirection,
          x: px,
          y: py,
          corner: memo.corner as Corner,
        };
        if (!down) {
          handleDragEnd(props);
        } else {
          animateDrag({ ...props, isDrag: true });
        }

        return memo;
      },
    },
    {
      drag: {
        bounds: bookRef,
        preventScroll: true,
      },
      eventOptions: { passive: true },
    }
  );

  return { props, bind, api, animateNextPage };
};

function isMoveAllowed(
  currentPage: number,
  totalPages: number,
  direction: FlipDirection
) {
  if (
    (currentPage === totalPages - 1 && direction === FlipDirection.FORWARD) ||
    (currentPage === 0 && direction === FlipDirection.BACK)
  ) {
    return false;
  }

  return !((currentPage % 2 === 1) === (direction === FlipDirection.FORWARD));
}

function getPageProps({
  pageNum,
  isRtl,
  pagesAmount,
  x,
  y,
  rect,
}: {
  pageNum: number;
  pagesAmount: number;
  isRtl: boolean;
  x: number;
  y: number;
  rect: PageRect;
}) {
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const isHardPage = Helper.isHardPage(pageNum, pagesAmount);
  const corner = Helper.getCorner(x, y, isLeftPage, rect);

  return { isLeftPage, isHardPage, corner, rect };
}
