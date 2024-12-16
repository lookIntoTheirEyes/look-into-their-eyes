import { RefObject, useCallback, useRef, useState } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import {
  Corner,
  FlipCorner,
  FlipDirection,
  IShadow,
  PageRect,
  Point,
  RectPoints,
} from "../model";
import Helper from "../Helper";
import FlipCalculation from "../FlipCalculation";

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

const initialPoint = { x: 0, y: 0 };

export interface ICalc {
  angle: number;
  rect: RectPoints;
  intersectPoints: {
    topIntersectPoint: Point;
    bottomIntersectPoint: Point;
    sideIntersectPoint: Point;
  };
  pos: Point;
  shadow: IShadow;
}

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
  const [lastX, setX] = useState(0);

  const { left: bookLeft, width: bookWidth, pageWidth } = bookRect;

  const getSpringConfig = useCallback(
    ({
      direction = FlipDirection.FORWARD,
      immediate = false,
      startX,
      corner = "none",
      calc = {
        pos: initialPoint,
        angle: 0,
        rect: {
          topLeft: initialPoint,
          topRight: initialPoint,
          bottomLeft: initialPoint,
          bottomRight: initialPoint,
        },
        intersectPoints: {
          topIntersectPoint: initialPoint,
          bottomIntersectPoint: initialPoint,
          sideIntersectPoint: initialPoint,
        },
        shadow: {
          pos: initialPoint,
          angle: 0,
          width: 0,
          opacity: 0,
          direction: FlipDirection.FORWARD,
          progress: 0,
        },
      },
    }: {
      direction?: FlipDirection;
      immediate?: boolean;
      startX?: number;
      corner?: Corner;
      calc?: ICalc;
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
      calc,
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
        status.current = "animation";

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
              status.current = "";

              return {
                ...getSpringConfig({
                  immediate: true,
                  startX: lastX,
                }),
                direction,
                config: { duration: 0 },
                onRest: () => {
                  setX(lastX);
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
    ({
      progress,
      idx,
      direction,
      x,
      corner,
    }: {
      progress: number;
      idx: number;
      direction: FlipDirection;
      x: number;
      corner: Corner;
    }) => {
      if (progress < 50) {
        api.start((i) => {
          if (idx !== i) return;
          status.current = "animation";

          return {
            immediate: false,
            progress: 0,
            config: { duration: ANIMATION_DURATION },
            corner: "none",
            onRest: () => {
              status.current = "";
              setX(x);
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
    ({
      idx,
      progress,
      direction,
      x,
      y,
      corner,
      isDrag = true,
      calc,
    }: {
      idx: number;
      progress: number;
      direction: FlipDirection;
      x: number;
      y: number;
      corner: Corner;
      isDrag?: boolean;
      calc?: ICalc;
    }) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...getSpringConfig({
            direction,
            immediate: isDrag,
            startX: x,
            corner,

            calc,
          }),
          progress,
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
      const direction = getDirByPoint(isLeft);
      if (progress > 10) {
        handleDragEnd({
          progress: 0,
          idx,
          direction,
          x,
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

  const resetLocation = useCallback(
    (idx: number, direction: FlipDirection) => {
      api.start((i) => {
        if (idx !== i) return;
        return {
          ...getSpringConfig({ direction }),
          onRest: () => {
            status.current = "";
            setX(0);
          },
        };
      });
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

      onMouseMove: (params) => {
        if (status.current === "drag" || status.current === "animation") return;

        const {
          args: [idx],
          event: { clientX: x, clientY: y },
        } = params;

        if (status.current !== "hover") {
          status.current = "hover";
        }
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

        if (progress > 10 || status.current !== "hover") {
          resetLocation(idx, direction);
          return;
        }

        if (!isHardPage) {
          const corner = Helper.getCorner(x, y, isLeftPage, bookRect, 150);

          try {
            const calc = getCalc({
              x,
              y,
              direction,
              corner,
              containerRect: bookRect,
              isRtl,
              progress,
            });

            api.start((i) => {
              if (idx !== i) return;
              return {
                ...getSpringConfig({ direction, corner, calc }),
                x,
                y,
                progress,
              };
            });
            return;
          } catch {}
        }

        handleHardPageHover(isLeftPage, progress, idx, 0, 0, "none"); // Changed x to 0
      },

      onClick: (params) => {
        if (status.current === "drag" || status.current === "animation") return;

        const {
          args: [idx],
          event: { clientX, clientY },
        } = params;
        const pageNum = currentPage + idx;

        const { isLeftPage, corner } = getPageProps({
          pageNum,
          totalPages,
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
        } = params;

        if (tap || status.current === "animation") return;
        status.current = "drag";

        setX(px);

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
            y: py + scrollY,
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

        try {
          const calc = getCalc({
            x: px,
            y: py + scrollY,
            direction: memo.direction,
            corner: memo.corner,
            containerRect: memo.rect,
            isRtl,
            progress,
          });

          if (!down) {
            handleDragEnd({
              progress,
              idx,
              direction: memo.direction,
              x: px,
              corner: memo.corner,
            });
          } else {
            animateDrag({
              idx,
              progress,
              direction: memo.direction,
              x: px,
              y: py + scrollY,
              corner: memo.corner,
              isDrag: true,
              calc,
            });
          }
        } catch {}

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

function getCalc({
  x,
  y,
  direction,
  corner,
  containerRect,
  isRtl,
  progress,
}: {
  x: number;
  y: number;
  direction: FlipDirection;
  corner: Corner;
  containerRect: PageRect;
  isRtl: boolean;
  progress: number;
}): ICalc {
  const { pageWidth, height } = containerRect;
  const topBottomCorner = corner.includes("top")
    ? FlipCorner.TOP
    : FlipCorner.BOTTOM;
  const adjustedPOs = FlipCalculation.convertToPage(
    { x, y },
    direction,
    containerRect,
    isRtl
  );

  const { pos, rect, angle } = FlipCalculation.getAnglePositionAndRect(
    adjustedPOs,
    pageWidth,
    height,
    corner,
    direction,
    isRtl
  );

  const intersectPoints = FlipCalculation.calculateIntersectPoint({
    pos,
    pageWidth,
    pageHeight: height,
    corner: topBottomCorner,
    rect,
  });

  const shadow = FlipCalculation.getShadowData(
    FlipCalculation.getShadowStartPoint(topBottomCorner, intersectPoints),
    FlipCalculation.getShadowAngle({
      pageWidth,
      direction,
      intersections: intersectPoints,
      corner: topBottomCorner,
      isRtl,
    }),
    progress,
    direction,
    pageWidth
  );
  console.log("shadow width", shadow.width);

  return { rect, intersectPoints, pos, angle, shadow };
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
