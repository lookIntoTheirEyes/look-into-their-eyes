import { animated, Interpolation, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
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
import { useRef } from "react";

interface ICalc {
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

interface IProps {
  pageNum: number;
  isRtl: boolean;
  isSinglePage: boolean;
  pages: JSX.Element[];
  x: SpringValue<number>;
  y: SpringValue<number>;
  progress: SpringValue<number>;
  direction: SpringValue<FlipDirection>;
  corner: SpringValue<Corner>;
  bind: (...args: unknown[]) => ReactDOMAttributes;
  i: number;
  bookRect: PageRect;
}

const AnimatedPage: React.FC<IProps> = ({
  pageNum,
  isRtl,
  isSinglePage,
  pages,
  bind,
  x,
  y,
  progress,
  direction,
  i,
  bookRect,
  corner,
}) => {
  const { pageWidth } = bookRect;
  const prevCalc = useRef<ICalc | null>(null);
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const isHardPage = Helper.isHardPage(pageNum, pages.length);
  const backPageNum = Helper.getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl,
    true
  );
  const belowPageNum = Helper.getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl
  );
  const adjustOrigin = pageNum === pages.length - 1 || pageNum === 1;

  const calculatedValues = to(
    [x, y, direction, corner, progress],
    (currentX, currentY, currentDirection, currentCorner, currentProgress) => {
      if (currentCorner === "none") return null;
      currentX = currentX as number;
      currentY = currentY as number;
      currentProgress = currentProgress as number;
      currentDirection = currentDirection as FlipDirection;
      currentCorner = currentCorner as Corner;

      try {
        const calc = getCalc({
          x: currentX,
          y: currentY,
          direction: currentDirection,
          corner: currentCorner,
          containerRect: bookRect,
          isRtl,
          progress: currentProgress,
        });

        prevCalc.current = calc;

        return calc;
      } catch {
        return prevCalc.current;
      }
    }
  );

  const getPageStyle = (isFront: boolean) => {
    return isHardPage
      ? getHardPageStyle(
          x,
          progress,
          direction,
          pageWidth,
          isLeftPage,
          isRtl,
          isFront
        )
      : getSoftPageStyle(
          calculatedValues,
          corner,
          direction,
          bookRect,
          isFront,
          isRtl
        );
  };

  const getShadowStyle = (inner = false) => {
    return isHardPage
      ? getHardShadowStyle(progress, direction, pageWidth, isRtl, inner)
      : getSoftShadowStyle(direction, isRtl, inner, calculatedValues, bookRect);
  };

  return (
    <>
      <animated.div
        className={`
        ${styles.pageWrapper} 
        ${isLeftPage ? "" : styles.right} 
        ${isSinglePage ? styles.onePage : ""}
      `}
        {...bind(i)}
        style={{ zIndex: progress.to((p) => (p > 50 ? 9 : !p ? 6 : 8)) }}
      >
        <animated.div
          key={`page-front-${pageNum}`}
          className={`${styles.page}`}
          style={getPageStyle(true)}
        >
          {pages[pageNum]}
        </animated.div>

        <animated.div
          key={`page-back-${backPageNum}`}
          className={`${styles.page} ${styles.back} ${
            adjustOrigin === isRtl ? "" : styles.right
          }`}
          style={getPageStyle(false)}
        >
          {pages[backPageNum]}
        </animated.div>

        {belowPageNum > 0 && belowPageNum < pages.length - 1 && (
          <animated.div
            className={`${styles.page} ${isLeftPage ? "" : styles.right} ${
              styles.below
            }`}
          >
            {pages[belowPageNum]}
          </animated.div>
        )}
      </animated.div>

      {[false, true].map((isInner) => (
        <animated.div
          key={isInner ? "inner-shadow" : "outer-shadow"}
          className={`${styles.shadow} ${
            isSinglePage || (!isHardPage && isLeftPage) ? styles.onePage : ""
          } ${isHardPage ? styles.hard : ""} ${isInner ? styles.inner : ""}`}
          style={getShadowStyle(isInner)}
        />
      ))}
    </>
  );
};

function getSoftShadowStyle(
  direction: SpringValue<FlipDirection>,
  isRtl: boolean,
  inner: boolean,
  calc: Interpolation<ICalc | null>,
  rect: PageRect
) {
  return inner
    ? getSoftInnerShadow(direction, isRtl, calc, rect)
    : getSoftOuterShadow({ direction, calc, rect, isRtl });
}

function getSoftInnerShadow(
  direction: SpringValue<FlipDirection>,
  isRtl: boolean,
  calc: Interpolation<ICalc | null>,
  rect: PageRect
) {
  return {
    height: `${rect.height * 2}px`,
    width: calc.to((calc) => `${(calc?.shadow.width * 3) / 4}px`),
    transformOrigin: to([direction, calc], (direction, calc) => {
      const innerShadowSize = (calc?.shadow.width * 3) / 4;
      const shadowTranslate =
        direction === FlipDirection.FORWARD ? innerShadowSize : 0;
      return `${shadowTranslate}px 100px`;
    }),
    background: to([direction, calc], (direction, calc) => {
      const shadow = calc?.shadow;
      return `linear-gradient(${
        direction === FlipDirection.FORWARD ? "to left" : "to right"
      },
                  rgba(0, 0, 0, ${shadow?.opacity}) 5%,
                  rgba(0, 0, 0, 0.05) 15%,
                  rgba(0, 0, 0, ${shadow?.opacity}) 35%,
                  rgba(0, 0, 0, 0) 100%)`;
    }),
    transform: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow } = calc;
      const innerShadowSize = (shadow.width * 3) / 4;
      const shadowTranslate =
        direction === FlipDirection.FORWARD ? innerShadowSize : 0;
      const shadowPos = FlipCalculation.convertToGlobal(
        shadow.pos,
        direction,
        rect.width,
        isRtl
      );
      const angle = shadow.angle + (3 * Math.PI) / 2;

      return `translate3d(${shadowPos!.x - shadowTranslate}px, ${
        shadowPos!.y - 100
      }px, 0) rotate(${angle}rad)`;
    }),
    clipPath: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow, rect: rectPoints } = calc;
      const clip = [
        rectPoints.topLeft,
        rectPoints.topRight,
        rectPoints.bottomRight,
        rectPoints.bottomLeft,
      ];
      const innerShadowSize = (shadow.width * 3) / 4;
      const shadowTranslate =
        direction === FlipDirection.FORWARD ? innerShadowSize : 0;
      const angle = shadow.angle + (3 * Math.PI) / 2;

      const polygon = clip.reduce((acc, p) => {
        if (!p) return acc;
        const g =
          direction === FlipDirection.BACK
            ? {
                x: -p.x + shadow.pos!.x,
                y: p.y - shadow.pos!.y,
              }
            : {
                x: p.x - shadow.pos!.x,
                y: p.y - shadow.pos!.y,
              };

        const rotated = Helper.GetRotatedPoint(
          g,
          { x: shadowTranslate, y: 100 },
          angle
        );
        return `${acc}${rotated!.x}px ${rotated!.y}px, `;
      }, "polygon(");

      return polygon.slice(0, -2) + ")";
    }),
    display: calc.to((calc) => (calc?.shadow.progress > 0 ? "block" : "none")),
  };
}

function getSoftOuterShadow({
  rect,
  calc,
  direction,
  isRtl,
}: {
  rect: PageRect;
  calc: Interpolation<ICalc | null>;
  direction: SpringValue<FlipDirection>;
  isRtl: boolean;
}) {
  return {
    width: calc.to((calc) => `${calc?.shadow.width}px`),
    height: `${rect.height * 2}px`,
    background: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow } = calc;
      const shadowDirection =
        direction === FlipDirection.FORWARD ? "to right" : "to left";
      return `linear-gradient(${shadowDirection}, rgba(0, 0, 0, ${shadow.opacity}), rgba(0, 0, 0, 0))`;
    }),
    transformOrigin: to([calc, direction], (calc, direction) => {
      if (!calc) return "none";
      const shadowTranslate =
        direction === FlipDirection.BACK ? calc.shadow.width : 0;
      return `${shadowTranslate}px 100px`;
    }),
    transform: to([calc, direction], (calc, direction) => {
      if (!calc) return "none";
      const { shadow } = calc;
      const shadowTranslate =
        direction === FlipDirection.BACK ? shadow.width : 0;
      const shadowPos = FlipCalculation.convertToGlobal(
        shadow.pos,
        direction,
        rect.width,
        isRtl
      );
      const angle = shadow.angle + (3 * Math.PI) / 2;

      return `translate3d(${shadowPos!.x - shadowTranslate}px, ${
        shadowPos!.y - 100
      }px, 0) rotate(${angle}rad)`;
    }),
    clipPath: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow } = calc;
      const clip = [
        { x: 0, y: 0 },
        { x: rect.pageWidth, y: 0 },
        { x: rect.pageWidth, y: rect.height },
        { x: 0, y: rect.height },
      ];
      const shadowTranslate =
        direction === FlipDirection.BACK ? shadow.width : 0;
      const angle = shadow.angle + (3 * Math.PI) / 2;

      const polygon = clip.reduce((acc, p) => {
        const g =
          direction === FlipDirection.BACK
            ? {
                x: -p.x + shadow.pos!.x,
                y: p.y - shadow.pos!.y,
              }
            : {
                x: p.x - shadow.pos!.x,
                y: p.y - shadow.pos!.y,
              };

        const rotated = Helper.GetRotatedPoint(
          g,
          { x: shadowTranslate, y: 100 },
          angle
        );
        return `${acc}${rotated!.x}px ${rotated!.y}px, `;
      }, "polygon(");

      return polygon.slice(0, -2) + ")";
    }),
    display: calc.to((calc) => (calc?.shadow.progress > 0 ? "block" : "none")),
  };
}

function getHardShadowStyle(
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  pageWidth: number,
  isRtl: boolean,
  inner = false
) {
  return {
    display: progress.to((p) => (p > 0 ? "block" : "none")),
    width: progress.to((p) => Helper.getShadowWidth(p, pageWidth)),
    background: progress.to((p) => Helper.getShadowBackground(p, inner)),
    transform: to([progress, direction], (p, dir) =>
      Helper.getShadowTransform(p as number, dir as FlipDirection, isRtl, inner)
    ),
  };
}

function getSoftPageStyle(
  calc: Interpolation<ICalc | null>,
  corner: SpringValue<Corner>,
  direction: SpringValue<FlipDirection>,
  bookRect: PageRect,
  isFront: boolean,
  isRtl: boolean
) {
  const { pageWidth, height: pageHeight, width } = bookRect;
  return {
    clipPath: to([corner, direction, calc], (corner, direction, calc) => {
      if (corner === "none" || !calc) return "none";

      if (isFront) {
        return getFrontSoftClipPath({
          calc,
          pageHeight,
          pageWidth,
          corner,
        });
      }
      return getBackSoftClipPath({
        calc,
        corner,
        pageWidth,
        pageHeight,
        direction,
        isRtl,
      });
    }),
    transformOrigin: "0px 0px",
    transform: to([calc, corner, direction], (calc, corner, direction) => {
      if (corner === "none" || !calc || isFront) return "none";

      const { angle, rect } = calc;
      const activePos = FlipCalculation.convertToGlobal(
        FlipCalculation.getActiveCorner(direction, rect, isRtl),
        direction,
        width,
        isRtl
      );

      return `translate3d(${activePos!.x}px, ${
        activePos!.y
      }px, 0) rotate(${angle}rad)`;
    }),
    zIndex: corner.to((corner) => {
      if (isFront) return 3;
      return corner !== "none" ? 4 : 2;
    }),
  };
}

function getBackSoftClipPath({
  calc,
  corner,
  pageHeight,
  pageWidth,
  direction,
  isRtl,
}: {
  calc: ICalc;
  corner: Corner;
  pageWidth: number;
  pageHeight: number;
  direction: FlipDirection;
  isRtl: boolean;
}): string {
  if (!calc) {
    return "none";
  }

  const { intersectPoints, rect, pos: position, angle } = calc;
  const area = FlipCalculation.getFlippingClipArea({
    ...intersectPoints,
    rect,
    corner,
  });

  return FlipCalculation.getSoftCss({
    position,
    pageWidth,
    pageHeight,
    area,
    direction,
    angle,
    factorPosition: FlipCalculation.getActiveCorner(direction, rect, isRtl),
    isRtl,
  });
}

function getFrontSoftClipPath({
  calc,
  pageHeight,
  corner,
  pageWidth,
}: {
  calc: ICalc;
  pageHeight: number;
  corner: Corner;
  pageWidth: number;
}): string {
  const { intersectPoints } = calc;

  const area = FlipCalculation.getFrontClipArea({
    ...intersectPoints,
    corner: corner.includes("top") ? FlipCorner.TOP : FlipCorner.BOTTOM,
    pageHeight,
    pageWidth,
  });

  const clipPath = `polygon(${invertClipPath(
    area,
    pageWidth,
    pageHeight,
    corner
  )
    .filter((p): p is Point => !!p)
    .map((p) => `${p!.x}px ${p!.y}px`)
    .join(", ")})`;

  return clipPath;
}

function invertClipPath(
  originalPoints: Point[],
  pageWidth: number,
  pageHeight: number,
  corner: Corner = "top-right"
): Point[] {
  if (!originalPoints.length) return [];
  const points = originalPoints.filter((p) => p !== null);
  if (!points.length) return [];

  switch (corner) {
    case "bottom-right": {
      const bottomIntersect = points.find((p) => p?.y === pageHeight) ?? {
        x: pageWidth,
        y: pageHeight,
      };
      const sideIntersect = points.find((p) => p?.x === pageWidth) ?? {
        x: pageWidth,
        y: pageHeight,
      };

      return [
        { x: 0, y: 0 },
        { x: pageWidth, y: 0 },
        { x: pageWidth, y: sideIntersect.y },
        sideIntersect,
        bottomIntersect,
        { x: 0, y: pageHeight },
      ];
    }

    case "bottom-left": {
      const bottomIntersect = points.find((p) => p?.y === pageHeight) ?? {
        x: 0,
        y: pageHeight,
      };
      const sideIntersect = points.find((p) => p?.x === 0) ?? {
        x: 0,
        y: pageHeight,
      };

      return [
        { x: 0, y: 0 },
        { x: pageWidth, y: 0 },
        { x: pageWidth, y: pageHeight },
        bottomIntersect,
        sideIntersect,
        { x: 0, y: sideIntersect.y },
      ];
    }

    case "top-right":
      return [
        { x: pageWidth, y: 0 },
        ...points,
        { x: 0, y: 0 },
        { x: 0, y: pageHeight },
        { x: pageWidth, y: pageHeight },
      ];

    case "top-left":
      return [
        { x: 0, y: 0 },
        ...points,
        { x: pageWidth, y: 0 },
        { x: pageWidth, y: pageHeight },
        { x: 0, y: pageHeight },
      ];

    default:
      return [];
  }
}

function getHardPageStyle(
  x: SpringValue<number>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  pageWidth: number,
  isLeftPage: boolean,
  isRtl: boolean,
  isFront: boolean
) {
  return {
    display: progress.to((p) =>
      (isFront ? p < 50 : p >= 50) ? "block" : "none"
    ),
    transformOrigin: progress.to((p) =>
      Helper.getOrigin(isLeftPage, p, pageWidth)
    ),
    transform: getHardPageTransform(
      x,
      progress,
      direction,
      isLeftPage,
      isFront,
      pageWidth,
      isRtl
    ),
    zIndex: isFront ? 3 : progress.to((p) => (p > 50 ? 4 : 2)),
  };
}

function getHardPageTransform(
  x: SpringValue<number>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  isLeftPage: boolean,
  isFront: boolean,
  pageWidth: number,
  isRtl: boolean
) {
  return to([x, progress, direction], (x, p, dir) => {
    p = p as number;
    dir = dir as FlipDirection;
    const angle = Helper.getAngle(
      isLeftPage,
      p,
      isRtl
        ? dir
        : dir === FlipDirection.FORWARD
        ? FlipDirection.BACK
        : FlipDirection.FORWARD,
      !isFront
    );

    const shouldFlip = p >= 50 && !isFront;
    const translateX = p >= 50 ? (isLeftPage ? pageWidth : -pageWidth) : 0;

    return `
      translate3d(${translateX}px, 0, 0)
      rotateY(${angle}deg)
      ${shouldFlip ? "scaleX(-1)" : ""}
    `;
  });
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
  const adjustedPos = FlipCalculation.convertToPage(
    { x, y },
    direction,
    containerRect,
    isRtl
  );

  const { pos, rect, angle } = FlipCalculation.getAnglePositionAndRect(
    adjustedPos,
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

  return { rect, intersectPoints, pos, angle, shadow };
}

export default AnimatedPage;
