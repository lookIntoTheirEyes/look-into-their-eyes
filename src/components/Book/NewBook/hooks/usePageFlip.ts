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
  isAnimating: false,
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
  const [{ isHover, isDrag, isAnimating }, setStatus] =
    useState(INITIAL_STATUS);
  const book = bookRef.current?.getBoundingClientRect();
  const bookWidth = book?.width ?? 0;
  const pageWidth = bookWidth / (isSinglePage ? 1 : 2);
  const bookLeft = book?.left ?? 0;

  const from = useCallback(
    ({
      direction = FlipDirection.FORWARD,
      pageWidth,
      immediate = false,
    }: {
      direction?: FlipDirection;
      pageWidth?: number;
      immediate?: boolean;
    } = {}) => {
      return {
        x: pageWidth || 0,
        y: 0,
        r: 0,
        z: 10,
        progress: pageWidth ? 100 : 0,
        immediate,
        direction,
        config: {
          tension: 200,
          friction: 25,
          duration: 0,
        },
      };
    },
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
    to: from(),
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
              ...from({ immediate: false }),
              direction,
              config: { duration: 0 },
              onRest: () => {
                setStatus(INITIAL_STATUS);
              },
            }));
          },
        };
      });
    },
    [api, from, onPrevPage, onNextPage]
  );

  const handleDragEnd = useCallback(
    (progress: number, idx: number, direction: FlipDirection) => {
      setStatus((prev) => ({ ...prev, isAnimating: true }));
      if (progress < 50) {
        api.start((i) => {
          if (idx !== i) return;

          return {
            immediate: false,
            progress: 0,
            config: { duration: ANIMATION_DURATION },
            onRest: () => {
              setStatus(INITIAL_STATUS);
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
    (idx: number, progress: number, direction: FlipDirection) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...from(),
          immediate: true,
          progress,
          direction,
        };
      });
    },
    [api, from]
  );

  const handleHardPageHover = useCallback(
    (isLeft: boolean, progress: number, idx: number) => {
      const dir = getDirByPoint(isLeft);
      if (progress > 10) {
        handleDragEnd(0, idx, dir);
      } else {
        animateDrag(idx, progress, dir);
      }
    },
    [animateDrag, getDirByPoint, handleDragEnd]
  );

  const resetLocation = useCallback(
    (idx: number) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...from({ immediate: false }),
          onRest: () => {
            setStatus(INITIAL_STATUS);
          },
        };
      });
    },
    [api, from]
  );

  const bind = useGesture(
    {
      onMouseLeave: ({ args: [idx] }) => {
        if (isDrag || !isHover || isAnimating) return;

        resetLocation(idx);
      },

      onMouseMove: (params) => {
        if (isDrag || isAnimating) return;

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
              ...from({ immediate: false }),
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

        handleHardPageHover(isLeft, progress, idx);
      },

      onClick: (params) => {
        if (isAnimating) return;

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
        setStatus({ isHover: false, isDrag: true, isAnimating: true });
        animateNextPage(idx, direction);
      },

      onDrag: (params) => {
        console.log("isAnimating", isAnimating);

        if (isAnimating) return;

        const {
          down,
          args: [idx],
          _direction: [xDir],
          xy: [px],
          memo,
          tap,
        } = params;

        if (tap) return;

        setStatus({ ...INITIAL_STATUS, isDrag: true });

        const dir = xDir < 0 ? -1 : 1;

        if (!dir && down) return memo;

        if (!memo) {
          if (!xDir) return;

          const direction = Helper.getDirection(isRtl, xDir);

          if (!isMoveAllowed(currentPage + idx, totalPages, direction, isRtl)) {
            return;
          }
          const isLeftPage = Helper.isLeftPage(currentPage + idx, isRtl);

          return {
            direction,
            isLeftPage,
          };
        }

        const progress = Helper.getProgress(px, !memo.isLeftPage, bookRef);

        if (!down) {
          handleDragEnd(progress, idx, memo.direction);
        } else {
          animateDrag(idx, progress, memo.direction);
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
