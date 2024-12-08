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

export const usePageFlip = ({
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
  isSinglePage,
  currentPage,
  totalPages,
}: UsePageFlipParams) => {
  const [isDrag, setIsDrag] = useState(false);
  const [isHover, setIsHover] = useState(false);
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
          setIsDrag(false);
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
      isDrag = true
    ) => {
      if (progress < 50) {
        api.start((i) => {
          if (idx !== i) {
            return;
          }
          isDrag && setIsDrag(false);
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

  const animateDrag = useCallback(
    (idx: number, progress: number, direction: FlipDirection) => {
      api.start((i) => {
        if (idx !== i) {
          return;
        }
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

  const handleHardPageHover = useCallback((x: number, idx: number) => {
    const isLeft = Helper.isLeftPage(currentPage + idx, isRtl);
    const progress = Helper.getProgress(x, !isLeft, bookRef);
    if (progress > 10 && !isHover) {
      return;
    }

    const dir = isLeft
      ? isRtl
        ? FlipDirection.FORWARD
        : FlipDirection.BACK
      : isRtl
      ? FlipDirection.BACK
      : FlipDirection.FORWARD;
    if (progress > 10) {
      handleDragEnd(progress, idx, dir, false);
      setIsHover(false);
    } else {
      setIsHover(true);
      animateDrag(idx, progress, dir);
    }
  }, []);

  const bind = useCallback(
    useGesture(
      {
        onMouseMove: (params) => {
          if (isDrag) {
            return;
          }
          const {
            args: [idx],
            event: { clientX },
          } = params;

          const isHardPage = Helper.isHardPage(currentPage + idx, totalPages);
          if (!isHardPage) {
            return;
          }

          const isLeft = Helper.isLeftPage(currentPage + idx, isRtl);
          const progress = Helper.getProgress(clientX, !isLeft, bookRef);
          if (progress > 10 && !isHover) {
            return;
          }

          // handleHardPageHover(clientX, idx)

          const dir = isLeft
            ? isRtl
              ? FlipDirection.FORWARD
              : FlipDirection.BACK
            : isRtl
            ? FlipDirection.BACK
            : FlipDirection.FORWARD;
          if (progress > 10) {
            handleDragEnd(0, idx, dir, false);
            setIsHover(false);
          } else {
            setIsHover(true);
            animateDrag(idx, progress, dir);
          }
        },

        onClick: (params) => {
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
          console.log("dragging", tap);

          if (tap) {
            return;
          }
          setIsDrag(true);

          const dir = xDir < 0 ? -1 : 1;

          if (!dir && down) {
            return memo;
          }

          if (!memo) {
            if (!xDir) {
              return;
            }

            const direction = Helper.getDirection(isRtl, xDir);
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
        eventOptions: { passive: true },
        hover: { mouseOnly: true, enabled: false },
        move: { enabled: false },
      }
    ),
    []
  );

  return { props, bind, api, animateNextPage };
};
