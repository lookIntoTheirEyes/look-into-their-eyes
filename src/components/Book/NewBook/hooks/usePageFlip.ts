import { RefObject, useCallback, useState } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { FlipDirection } from "../model";
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
  const book = bookRef.current?.getBoundingClientRect();
  const bookWidth = book?.width ?? 0;
  const pageWidth = bookWidth / (isSinglePage ? 1 : 2);
  const bookLeft = book?.left ?? 0;

  const getSpringConfig = useCallback(
    ({
      direction = FlipDirection.FORWARD,
      immediate = false,
      startX,
    }: {
      direction?: FlipDirection;
      immediate?: boolean;
      startX?: number;
    }) => ({
      x: startX ?? 0,
      y: 0,
      r: 0,
      z: 10,
      progress: 0,
      immediate,
      direction,
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
    (idx: number, direction: FlipDirection) => {
      api.start((i) => {
        if (i !== idx) return;

        return {
          immediate: false,
          progress: 100,
          config: { duration: ANIMATION_DURATION },
          direction,
          onRest: () => {
            if (direction === FlipDirection.BACK) {
              onPrevPage();
            } else {
              onNextPage();
            }

            api.start(() => ({
              ...getSpringConfig({ immediate: false, startX: lastX }),
              direction,
              config: { duration: 0 },
              onRest: () => {
                setStatus({ ...INITIAL_STATUS, lastX });
              },
            }));
          },
        };
      });
    },
    [api, getSpringConfig, onPrevPage, onNextPage, lastX]
  );

  const handleDragEnd = useCallback(
    (progress: number, idx: number, direction: FlipDirection, x: number) => {
      if (progress < 50) {
        api.start((i) => {
          if (idx !== i) return;

          return {
            immediate: false,
            progress: 0,
            config: { duration: ANIMATION_DURATION },
            onRest: () => {
              setStatus({ ...INITIAL_STATUS, lastX: x });
            },
          };
        });
      } else {
        animateNextPage(idx, direction);
      }
    },
    [animateNextPage, api]
  );

  const animateDrag = useCallback(
    (idx: number, progress: number, direction: FlipDirection, x: number) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...getSpringConfig({ direction, immediate: true, startX: x }),
          progress,
          direction,
        };
      });
    },
    [api, getSpringConfig]
  );

  const handleHardPageHover = useCallback(
    (isLeft: boolean, progress: number, idx: number, x: number) => {
      const dir = getDirByPoint(isLeft);
      if (progress > 10) {
        handleDragEnd(0, idx, dir, x);
      } else {
        animateDrag(idx, progress, dir, x);
      }
    },
    [animateDrag, getDirByPoint, handleDragEnd]
  );

  const resetLocation = useCallback(
    (idx: number) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...getSpringConfig({ immediate: false }),
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
        resetLocation(idx);
      },

      onMouseMove: (params) => {
        if (isDrag) return;

        const {
          args: [idx],
          event: { clientX: x, clientY: y },
        } = params;

        if (!isHover) {
          setStatus((prev) => ({ ...prev, isHover: true }));
        }

        const isHardPage = Helper.isHardPage(currentPage + idx, totalPages);
        const isLeft = Helper.isLeftPage(currentPage + idx, isRtl);
        if (!isHardPage) {
          const direction = getDirByPoint(isLeft);
          api.start((i) => {
            if (idx !== i) return;
            return {
              ...getSpringConfig({ immediate: false }),
              x,
              y,
              direction,
            };
          });
          return;
        }

        const progress = Helper.getProgress(x, !isLeft, bookRef);
        if (progress > 10 || !isHover) {
          resetLocation(idx);
          return;
        }

        handleHardPageHover(isLeft, progress, idx, x);
      },

      onClick: (params) => {
        if (isDrag) return;

        const {
          args: [idx],
          event: { clientX },
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

        const direction =
          action === "prev" ? FlipDirection.BACK : FlipDirection.FORWARD;
        setStatus((prev) => ({ ...prev, isHover: false, isDrag: true }));
        animateNextPage(idx, direction);
      },

      onDrag: (params) => {
        const {
          down,
          args: [idx],
          _direction: [xDir],
          xy: [px],
          memo,
          tap,
        } = params;

        if (tap) return;

        setStatus({ ...INITIAL_STATUS, isDrag: true, lastX: px });

        const dir = xDir < 0 ? -1 : 1;

        if (!dir && down) return memo;

        if (!memo) {
          if (!xDir) return;

          const direction = Helper.getDirection(isRtl, xDir);
          if (!isMoveAllowed(currentPage + idx, totalPages, direction, isRtl)) {
            return;
          }

          return {
            direction,
            isLeftPage: Helper.isLeftPage(currentPage + idx, isRtl),
          };
        }

        const progress = Helper.getProgress(px, !memo.isLeftPage, bookRef);

        if (!down) {
          handleDragEnd(progress, idx, memo.direction, px);
        } else {
          animateDrag(idx, progress, memo.direction, px);
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
  direction: FlipDirection,
  isRtl: boolean
) {
  if (
    (currentPage === totalPages - 1 && direction === FlipDirection.FORWARD) ||
    (currentPage === 0 && direction === FlipDirection.BACK)
  ) {
    return false;
  }

  const isOddPage = currentPage % 2 === 1;

  if (isRtl && isOddPage && direction === FlipDirection.FORWARD) {
    return false;
  }

  if (isRtl && !isOddPage && direction === FlipDirection.BACK) {
    return false;
  }

  if (!isRtl && isOddPage && direction === FlipDirection.FORWARD) {
    return false;
  }

  if (!isRtl && !isOddPage && direction === FlipDirection.BACK) {
    return false;
  }

  return true;
}
