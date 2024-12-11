import { RefObject, useCallback, useState } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { Corner, FlipDirection } from "../model";
import Helper from "../Helper";

interface UsePageFlipParams {
  isRtl: boolean;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookRef: RefObject<HTMLDivElement>;
  isSinglePage: boolean;
}
const ANIMATION_DURATION = 500;

const INITIAL_STATUS = {
  isHover: false,
  isDrag: false,
  lastX: 0,
};

export const usePageFlip = ({
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
  isSinglePage,
  currentPage,
  totalPages,
}: UsePageFlipParams) => {
  const [{ isHover, isDrag, lastX }, setStatus] = useState(INITIAL_STATUS);
  const bookRect = bookRef.current?.getBoundingClientRect();
  const bookWidth = bookRect?.width ?? 0;
  const pageWidth = bookWidth / (isSinglePage ? 1 : 2);
  const bookLeft = bookRect?.left ?? 0;

  const getSpringConfig = useCallback(
    ({
      direction = FlipDirection.FORWARD,
      immediate = false,
      startX,
      corner = "none",
    }: {
      direction?: FlipDirection;
      immediate?: boolean;
      startX?: number;
      corner?: Corner;
    }) => ({
      x: startX ?? 0,
      y: 0,
      r: 0,
      z: 10,
      progress: 0,
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
    to: getSpringConfig({}),
  }));

  const animateNextPage = useCallback(
    (idx: number, direction: FlipDirection, corner: Corner) => {
      api.start((i) => {
        if (i !== idx) return;

        return {
          ...getSpringConfig({ startX: lastX, corner }), // Add lastX here

          progress: 100,
          config: { duration: ANIMATION_DURATION },
          direction,
          onRest: () => {
            if (direction === FlipDirection.BACK) {
              onPrevPage();
            } else {
              onNextPage();
            }

            api.start((i) => {
              if (i !== idx) return;
              return {
                ...getSpringConfig({ immediate: true, startX: lastX }),
                direction,
                config: { duration: 0 },
                onRest: () => {
                  setStatus({ ...INITIAL_STATUS, lastX });
                },
              };
            });
          },
        };
      });
    },
    [api, getSpringConfig, onPrevPage, onNextPage, lastX]
  );

  const handleDragEnd = useCallback(
    (
      progress: number,
      idx: number,
      direction: FlipDirection,
      x: number,
      corner: Corner
    ) => {
      if (progress < 50) {
        api.start((i) => {
          if (idx !== i) return;

          return {
            immediate: false,
            progress: 0,
            config: { duration: ANIMATION_DURATION },
            corner: "none",
            onRest: () => {
              setStatus({ ...INITIAL_STATUS, lastX: x });
            },
          };
        });
      } else {
        animateNextPage(idx, direction, corner);
      }
    },
    [animateNextPage, api]
  );

  const animateDrag = useCallback(
    (
      idx: number,
      progress: number,
      direction: FlipDirection,
      x: number,
      y: number,
      corner: Corner,
      isDrag = true
    ) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...getSpringConfig({
            direction,
            immediate: isDrag,
            startX: x,
            corner,
          }),
          progress,
          direction,
          y,
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
      const dir = getDirByPoint(isLeft);
      if (progress > 10) {
        handleDragEnd(0, idx, dir, x, corner);
      } else {
        animateDrag(idx, progress, dir, x, y, corner, false);
      }
    },
    [animateDrag, getDirByPoint, handleDragEnd]
  );

  const resetLocation = useCallback(
    (idx: number, direction: FlipDirection) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...getSpringConfig({ direction }),
          onRest: () => {
            setStatus({ ...INITIAL_STATUS });
          },
        };
      });
    },
    [api, getSpringConfig]
  );

  const bind = useGesture(
    {
      onMouseLeave: ({ args: [idx] }) => {
        if (isDrag || !isHover) return;
        const isLeft = Helper.isLeftPage(currentPage + idx, isRtl);
        const direction = getDirByPoint(isLeft);
        resetLocation(idx, direction);
      },

      onMouseMove: (params) => {
        if (isDrag) return;

        const {
          args: [idx],
          event: { clientX: x, clientY: y },
        } = params;

        if (!isHover) {
          setStatus((prev) => ({ ...prev, isDrag: false, isHover: true }));
        }

        const isHardPage = Helper.isHardPage(currentPage + idx, totalPages);
        const isLeft = Helper.isLeftPage(currentPage + idx, isRtl);
        const direction = getDirByPoint(isLeft);
        const progress = Helper.getProgress(x, !isLeft, bookRef);

        if (progress > 10 || !isHover) {
          resetLocation(idx, direction);
          return;
        }

        if (!isHardPage) {
          const bookRect = bookRef.current?.getBoundingClientRect();

          const corner = Helper.getCorner(x, y, isLeft, bookRect!);

          api.start((i) => {
            if (idx !== i) return;
            return {
              ...getSpringConfig({ direction, corner }),
              x,
              y,
              progress,
            };
          });
          return;
        }

        handleHardPageHover(isLeft, progress, idx, 0, 0, "none"); // Changed x to 0
      },

      onClick: (params) => {
        if (isDrag) return;

        const {
          args: [idx],
          event: { clientX, clientY },
        } = params;

        const isLeft = Helper.isLeftPage(currentPage + idx, isRtl);
        const clickLocation = Helper.getXClickLocation(
          clientX,
          isLeft,
          pageWidth / 2,
          bookLeft,
          bookWidth
        );
        const action = Helper.getActionByClick(clickLocation, isRtl);
        if (!action) return;

        const bookRect = bookRef.current?.getBoundingClientRect();

        const corner = Helper.getCorner(
          clientX,
          clientY + scrollY,
          isLeft,
          bookRect!
        );

        const direction =
          action === "prev" ? FlipDirection.BACK : FlipDirection.FORWARD;
        setStatus((prev) => ({ ...prev, isHover: false, isDrag: true }));
        animateNextPage(idx, direction, corner);
      },

      onDrag: (params) => {
        const {
          down,
          args: [idx],
          _direction: [xDir],
          xy: [px, py],
          memo,
          tap,
          offset,
        } = params;

        if (tap) return;

        setStatus({ isHover: false, isDrag: true, lastX: px });

        const dir = xDir < 0 ? -1 : 1;

        if (!dir && down) return memo;

        if (!memo) {
          if (!xDir) return;

          const direction = Helper.getDirection(isRtl, xDir);
          if (!isMoveAllowed(currentPage + idx, totalPages, direction)) {
            return;
          }

          const isLeftPage = Helper.isLeftPage(currentPage + idx, isRtl);
          const bookRect = bookRef.current?.getBoundingClientRect();

          const corner = Helper.getCorner(px, py, isLeftPage, bookRect!);

          return {
            direction,
            isLeftPage,
            corner,
          };
        }

        const progress = Helper.getProgress(px, !memo.isLeftPage, bookRef);

        if (!down) {
          handleDragEnd(progress, idx, memo.direction, px, memo.corner);
        } else {
          animateDrag(idx, progress, memo.direction, px, py, memo.corner);
        }

        return memo;
      },
    },
    {
      drag: { filterTaps: true, bounds: bookRef, capture: true },
      eventOptions: { passive: true, precision: 0.0001 },
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
