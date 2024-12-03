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

const ANIMATION_DURATION = 500;

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
          // easing: easings.steps(5),
        },
      };
    },
    []
  );

  const [props, api] = useSprings(2, () => ({
    from: from(),
  }));

  const handleDragEnd = (progress: number, idx: number) => {
    if (progress < 50) {
      api.start({
        immediate: false,
        progress: 0,
        config: { duration: ANIMATION_DURATION },
      });
    } else {
      api.start((i) => {
        if (i !== idx) {
          return;
        }
        return {
          immediate: false,
          progress: 100,
          config: { duration: ANIMATION_DURATION },
          onRest: () => {
            onNextPage();
            api.start((i) => {
              return {
                ...from({ immediate: false }),
                config: { duration: 0 },
              };
            });
          },
        };
      });
    }
  };

  const bind = useGesture(
    {
      onDrag: (params) => {
        const {
          down,
          args: [idx],
          direction: [xDir],
          xy: [px],
          initial,
          memo,
          tap,
        } = params;

        const dir = xDir < 0 ? -1 : 1;

        if ((!dir && down) || tap) {
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

        if (!down) {
          handleDragEnd(progress, idx);
        } else {
          api.start({
            ...from(),
            immediate: true,
            progress,
          });
        }

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
