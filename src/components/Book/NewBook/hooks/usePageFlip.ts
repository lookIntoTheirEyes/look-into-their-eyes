import { RefObject, useCallback } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import FlipCalculation from "../FlipCalculation";
import { FlipDirection } from "../model";
import Helper from "../Helper";

interface UsePageFlipParams {
  isRtl: boolean;
  isLastPage: boolean;
  isFirstPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookRef: RefObject<HTMLDivElement>;
  isSinglePage: boolean;
}

const ANIMATION_DURATION = 500;

export const usePageFlip = ({
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
  isLastPage,
  isFirstPage,
  isSinglePage,
}: UsePageFlipParams) => {
  const book = bookRef.current?.getBoundingClientRect();
  const pageWidth = (book?.width ?? 0) / (isSinglePage ? 1 : 2);
  const bookLeft = book?.left ?? 0;
  const bookTop = book?.top ?? 0;

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

  const animateNextPage = (idx: number, direction: FlipDirection) => {
    api.start((i) => {
      if (i !== idx) {
        return;
      }

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
          api.start(() => {
            return {
              ...from({ immediate: false }),
              direction,
              config: { duration: 0 },
            };
          });
        },
      };
    });
  };

  const handleDragEnd = useCallback(
    (
      progress: number,
      idx: number,
      direction: FlipDirection,
      returnCondition: boolean
    ) => {
      if (progress < 50) {
        api.start((i) => {
          if (idx !== i) {
            return;
          }
          return {
            immediate: false,
            progress: 0,
            config: { duration: ANIMATION_DURATION },
          };
        });
      } else {
        animateNextPage(idx, direction);
      }
    },
    [api, from, onNextPage, onPrevPage]
  );

  const bind = useGesture(
    {
      onClick: (params) => {
        const {
          args: [idx],
          event: { clientX },
        } = params;

        const isLeft = Helper.isLeftPageByClick(clientX, bookLeft, pageWidth);
        const clickLocation = Helper.getXClickLocation(
          clientX,
          isLeft,
          pageWidth / 2,
          bookLeft,
          book?.width ?? 0
        );
        const action = Helper.getActionByClick(clickLocation, isRtl);
        if (!action) {
          return;
        }
        const direction =
          action === "prev" ? FlipDirection.BACK : FlipDirection.FORWARD;

        animateNextPage(idx, direction);
      },
      onDrag: (params) => {
        const {
          down,
          args: [idx],
          _direction: [xDir],
          xy: [px],
          initial,
          memo,
          tap,
        } = params;
        if (tap) {
          return;
        }

        const dir = xDir < 0 ? -1 : 1;

        if (!dir && down) {
          return memo;
        }

        if (!memo) {
          if (!xDir) {
            return;
          }

          const direction = getDirection(isRtl, xDir);

          return {
            direction,
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
          handleDragEnd(
            progress,
            idx,
            memo.direction,
            isLastPage || isFirstPage
          );
        } else {
          api.start((i) => {
            if (idx !== i) {
              return;
            }
            return {
              ...from(),
              immediate: true,
              progress,
              direction: memo.direction,
            };
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
  if (isRtl) {
    return xDir < 0 ? FlipDirection.BACK : FlipDirection.FORWARD;
  }
  return xDir < 0 ? FlipDirection.FORWARD : FlipDirection.BACK;
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
