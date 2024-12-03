import { RefObject, useCallback } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import FlipCalculation from "../FlipCalculation";
import { FlipDirection } from "../model";

interface UsePageFlipParams {
  isRtl: boolean;
  isLastPage: boolean;
  isFirstPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookRef: RefObject<HTMLDivElement>;
}

export const usePageFlip = ({
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
  isLastPage,
  isFirstPage,
}: UsePageFlipParams) => {
  const book = bookRef.current?.getBoundingClientRect();
  const pageWidth = (book?.width ?? 0) / 2;
  const bookLeft = (book?.left ?? 0) / 2;
  const bookTop = (book?.top ?? 0) / 2;

  const from = useCallback(
    ({
      direction = FlipDirection.FORWARD,
      pageWidth,
    }: { direction?: FlipDirection; pageWidth?: number } = {}) => {
      return {
        x: pageWidth || 0,
        y: 0,
        r: 0,
        z: 10,
        progress: 0,
        // angle: 0,
        immediate: false,
        direction,
      };
    },
    []
  );

  const [props, api] = useSprings(2, () => ({
    ...from(),
    from: from(),
  }));

  const bind = useGesture(
    {
      onDragEnd: (params) => {
        const {
          args: [idx],
          movement: [mx, my],
          velocity: [vx],
          xy: [px, py],
          offset: [ox, oy],
          initial,
          memo,
        } = params;

        api.start((i) => {
          const progress = getProgress(px, memo.side === "right", bookRef);
          const val = {
            ...from({ pageWidth: progress > 50 ? pageWidth : undefined }),
          };

          return val;
        });
      },
      onDrag: (params) => {
        const {
          // movement: [mx, my],
          down,
          args: [idx],
          direction: [xDir],
          xy: [px],
          initial,
          memo,
        } = params;

        const dir = xDir < 0 ? -1 : 1;

        if (!dir) {
          return memo;
        }
        if (!memo) {
          return {
            direction: getDirection(isRtl, xDir),
            side: determinePageSide(
              initial[0],
              bookLeft,
              bookTop,
              pageWidth,
              dir
            ),
          };
        }

        const progress = getProgress(px, memo.side === "right", bookRef);

        // const angle = getAngle(isRtl, progress, memo.direction);

        api.start((i) => {
          return {
            ...from(),
            progress,
            immediate: down,
            // angle,
            z: 10,
          };
        });
        return memo;
      },
    },
    { drag: { filterTaps: true, bounds: bookRef } }
  );

  return { props, bind, api };
};

function getDirection(isRtl: boolean, xDir: number) {
  return isRtl
    ? xDir > 0
      ? FlipDirection.BACK
      : FlipDirection.FORWARD
    : xDir < 0
    ? FlipDirection.BACK
    : FlipDirection.FORWARD;
}

function getProgress(
  x: number,
  isRightPage: boolean,
  bookRef: RefObject<HTMLDivElement>
) {
  const bookBounds = bookRef.current?.getBoundingClientRect();
  const bookLeft = bookBounds?.x ?? 0;
  const bookWidth = bookBounds?.width ?? 0;

  return FlipCalculation.getFlippingProgress(
    x,
    isRightPage,
    bookLeft,
    bookWidth
  );
}

function determinePageSide(
  initialX: number,
  bookLeft: number,
  bookTop: number,
  pageWidth: number,
  dir: number
): "left" | "right" {
  if (initialX - bookLeft <= pageWidth) {
    return "left";
  } else if (initialX - bookTop > pageWidth) {
    return "right";
  } else if (dir === -1) {
    return "right";
  } else {
    return "left";
  }
}

function getAngle(
  isRtl: boolean,
  progress: number,
  direction: FlipDirection
): number {
  const baseAngle =
    direction === (isRtl ? FlipDirection.BACK : FlipDirection.FORWARD)
      ? (-90 * (200 - progress * 2)) / 100
      : (90 * (200 - progress * 2)) / 100;

  return Math.abs(baseAngle - 180);
}
