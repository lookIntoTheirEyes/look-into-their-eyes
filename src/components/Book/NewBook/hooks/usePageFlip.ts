import { RefObject, useCallback, useRef } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { Corner, FlipDirection, PageRect } from "../model";
import Helper from "../Helper";

interface UsePageFlipParams {
  isRtl: boolean;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookRef: RefObject<HTMLDivElement>;
  bookRect: PageRect;
}
const ANIMATION_DURATION = 500;

export const usePageFlip = ({
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
  currentPage,
  totalPages,
  bookRect,
}: UsePageFlipParams) => {
  const status = useRef<"" | "drag" | "hover" | "animation">("");

  const { left: bookLeft, width: bookWidth, pageWidth } = bookRect;

  const getSpringConfig = useCallback(
    ({
      direction = FlipDirection.FORWARD,
      immediate = false,
      startX = 0,
      startY = 0,
      progress = 0,
      corner = "none",
    }: {
      direction?: FlipDirection;
      immediate?: boolean;
      startX?: number;
      startY?: number;
      progress?: number;
      corner?: Corner;
    }) => ({
      x: startX,
      y: startY,
      progress,
      immediate,
      direction,
      corner,
      config: {
        tension: 200,
        friction: 25,
        duration: immediate ? 0 : ANIMATION_DURATION,
      },
    }),
    []
  );

  const getDirByPoint = useCallback(
    (isLeft: boolean) => {
      return isLeft
        ? isRtl
          ? FlipDirection.FORWARD
          : FlipDirection.BACK
        : isRtl
        ? FlipDirection.BACK
        : FlipDirection.FORWARD;
    },
    [isRtl]
  );

  const [props, api] = useSprings(2, () => ({
    ...getSpringConfig({}),
  }));

  const animateNextPage = useCallback(
    (idx: number, direction: FlipDirection, corner: Corner) => {
      api.start((i) => {
        if (i !== idx) return;
        status.current = "animation";
        const x =
          (direction === FlipDirection.FORWARD) !== isRtl
            ? 0
            : bookRect.width + bookRect.left;

        const y = corner.includes("top")
          ? bookRect.top
          : bookRect.top + bookRect.height;

        const config = {
          ...getSpringConfig({
            corner,
            startY: y,
            startX: x,
            progress: 100,
            direction,
          }),
        };

        return {
          ...config,

          onResolve: () => {
            if (direction === FlipDirection.BACK) {
              onPrevPage();
            } else {
              onNextPage();
            }

            api.start((i) => {
              if (i !== idx) return;
              status.current = "";

              return {
                ...getSpringConfig({
                  immediate: true,
                }),
              };
            });
          },
        };
      });
    },
    [
      api,
      isRtl,
      bookRect.width,
      bookRect.left,
      bookRect.top,
      bookRect.height,
      getSpringConfig,
      onPrevPage,
      onNextPage,
    ]
  );

  const handleDragEnd = useCallback(
    ({
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
          const startX =
            (direction === FlipDirection.FORWARD) !== isRtl
              ? bookRect.width + bookRect.left
              : 0;

          const startY = corner.includes("top")
            ? bookRect.top
            : bookRect.top + bookRect.height;

          return {
            ...getSpringConfig({ direction, corner, startX, startY }),
            onResolve: () => {
              status.current = "";
              return {
                ...getSpringConfig({ corner: "none", immediate: true }),
              };
            },
          };
        });
      } else {
        animateNextPage(idx, direction, corner);
      }
    },
    [
      animateNextPage,
      api,
      bookRect.height,
      bookRect.left,
      bookRect.top,
      bookRect.width,
      getSpringConfig,
      isRtl,
    ]
  );

  const animateDrag = useCallback(
    ({
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
            startX: x,
            corner,
            progress,
            startY: y,
          }),
        };
      });
    },
    [api, getSpringConfig]
  );

  const handleHardPageHover = useCallback(
    (
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
    },
    [animateDrag, getDirByPoint, handleDragEnd]
  );

  // console.log("rerender");

  const resetLocation = useCallback(
    (idx: number, direction: FlipDirection) => {
      api.start((i) => {
        if (idx !== i) return;

        return {
          ...getSpringConfig({ direction }),
        };
      });
      status.current = "";
    },
    [api, getSpringConfig]
  );

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
          totalPages,
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
          const corner = Helper.getCorner(x, y, isLeftPage, bookRect, 150);

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
          totalPages,
          isRtl,
          x: clientX,
          y: clientY,
          rect: bookRect,
        });
        // console.log("get page props onClick corner", corner);

        const clickLocation = Helper.getXClickLocation(
          clientX,
          isLeftPage,
          pageWidth / 2,
          bookLeft,
          bookWidth
        );
        const action = Helper.getActionByClick(clickLocation, isRtl);
        if (!action) return;
        // console.log("get page props onClick action", action);

        const direction =
          action === "prev" ? FlipDirection.BACK : FlipDirection.FORWARD;

        // console.log("direction", direction);
        animateNextPage(idx, direction, corner);
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

        if (!dir && down) return memo;

        if (!memo) {
          if (!xDir) return;
          const pageNum = currentPage + idx;

          const direction = Helper.getDirection(isRtl, xDir);
          if (!isMoveAllowed(pageNum, totalPages, direction)) {
            return;
          }

          const { isLeftPage, isHardPage, corner, rect } = getPageProps({
            pageNum,
            totalPages,
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
      drag: { filterTaps: true, bounds: bookRef },
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
  totalPages,
  x,
  y,
  rect,
}: {
  pageNum: number;
  totalPages: number;
  isRtl: boolean;
  x: number;
  y: number;
  rect: PageRect;
}) {
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const isHardPage = Helper.isHardPage(pageNum, totalPages);
  const corner = Helper.getCorner(x, y, isLeftPage, rect);

  return { isLeftPage, isHardPage, corner, rect };
}
