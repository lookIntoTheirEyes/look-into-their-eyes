import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { Corner, FlipCorner, FlipDirection, PageRect, Point } from "../model";
import Helper from "../Helper";
import FlipCalculation from "../FlipCalculation";
import { ICalc } from "../hooks/usePageFlip";

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
  calc: SpringValue<ICalc>;
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
  calc,
}) => {
  const { pageWidth } = bookRect;
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
      : getSoftPageStyle(x, y, calc, corner, direction, bookRect, isFront);
  };

  const getShadowStyle = (inner = false) => {
    return isHardPage
      ? getHardShadowStyle(progress, direction, pageWidth, isRtl, inner)
      : undefined;
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

      {
        <>
          {[false, true].map((isInner) => (
            <animated.div
              key={isInner ? "inner-shadow" : "outer-shadow"}
              className={`${styles.shadow} ${
                isSinglePage ? styles.onePage : ""
              }`}
              style={getShadowStyle(isInner)}
            />
          ))}
        </>
      }
    </>
  );
};

export default AnimatedPage;

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
    background: progress.to((p: number) =>
      Helper.getShadowBackground(p, inner)
    ),
    transform: to([progress, direction], (p, dir) =>
      Helper.getShadowTransform(p as number, dir as FlipDirection, isRtl, inner)
    ),
  };
}

function getSoftPageStyle(
  x: SpringValue<number>,
  y: SpringValue<number>,
  calc: SpringValue<ICalc>,
  corner: SpringValue<Corner>,
  direction: SpringValue<FlipDirection>,
  bookRect: PageRect,
  isFront: boolean
) {
  const { pageWidth, height: pageHeight } = bookRect;
  return {
    clipPath: to(
      [corner, x, y, direction, calc],
      (corner, x, y, direction, calc) => {
        if (corner === "none") return "none";
        x = x as number;
        y = y as number;
        direction = direction as FlipDirection;
        corner = corner as Corner;
        calc = calc as ICalc;

        if (isFront) {
          return getFrontSoftClipPath({
            calc,
            pageHeight,
            pageWidth,
            corner,
          });
        } else {
          // For back page, show only the folded triangle
          return getBackSoftClipPath({
            calc,
            corner,
            pageWidth,
            pageHeight,
            direction,
          });
        }
      }
    ),
    transformOrigin: "0px 0px",
    transform: to([calc, corner, direction], (calc, corner, direction) => {
      if (corner === "none" || isFront) return "none";
      calc = calc as ICalc;
      direction = direction as FlipDirection;

      const { angle, rect } = calc;

      const activePos = FlipCalculation.convertToGlobal(
        FlipCalculation.getActiveCorner(direction, rect),
        direction,
        bookRect
      );

      return `translate3d(${activePos!.x}px, ${
        activePos!.y
      }px, 0) rotate(${angle}rad)`;
    }),
    zIndex: corner.to((corner) => {
      if (isFront) return 3;
      return (corner as Corner) !== "none" ? 4 : 2;
    }),
  };
}

function getBackSoftClipPath({
  calc,
  corner,
  pageHeight,
  pageWidth,
  direction,
}: {
  calc: ICalc;
  corner: Corner;
  pageWidth: number;
  pageHeight: number;
  direction: FlipDirection;
}): string {
  const { intersectPoints, rect, pos: position, angle } = calc;
  const area = FlipCalculation.getFlippingClipArea({
    ...intersectPoints,
    rect,
    corner,
  });

  const backSoft = FlipCalculation.getSoftCss({
    position,
    pageWidth,
    pageHeight,
    area,
    direction,
    angle,
    factorPosition: FlipCalculation.getActiveCorner(direction, rect),
  });

  return backSoft;
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
    .filter((p) => p !== null)
    .map((p) => `${p.x}px ${p.y}px`)
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
      // For bottom-right, we need to invert the folding from the bottom
      const bottomIntersect = points.find((p) => p && p.y === pageHeight) ?? {
        x: pageWidth,
        y: pageHeight,
      };
      const sideIntersect = points.find((p) => p && p.x === pageWidth) ?? {
        x: pageWidth,
        y: pageHeight,
      };

      return [
        { x: 0, y: 0 }, // Top-left
        { x: pageWidth, y: 0 }, // Top-right
        { x: pageWidth, y: sideIntersect.y }, // Down to side intersection
        sideIntersect, // Side intersection point
        bottomIntersect, // Bottom intersection point
        { x: 0, y: pageHeight }, // Bottom-left
      ];
    }

    case "bottom-left": {
      // For bottom-left, we mirror the bottom-right logic
      const bottomIntersect = points.find((p) => p && p.y === pageHeight) ?? {
        x: 0,
        y: pageHeight,
      };
      const sideIntersect = points.find((p) => p && p.x === 0) ?? {
        x: 0,
        y: pageHeight,
      };

      return [
        { x: 0, y: 0 }, // Top-left
        { x: pageWidth, y: 0 }, // Top-right
        { x: pageWidth, y: pageHeight }, // Bottom-right
        bottomIntersect, // Bottom intersection point
        sideIntersect, // Side intersection point
        { x: 0, y: sideIntersect.y }, // Up to left edge
      ];
    }

    case "top-right":
      return [
        { x: pageWidth, y: 0 }, // Start from top-right
        ...points, // Include folding points
        { x: 0, y: 0 }, // Top-left
        { x: 0, y: pageHeight }, // Bottom-left
        { x: pageWidth, y: pageHeight }, // Bottom-right
      ];

    case "top-left":
      return [
        { x: 0, y: 0 }, // Start from top-left
        ...points, // Include folding points
        { x: pageWidth, y: 0 }, // Top-right
        { x: pageWidth, y: pageHeight }, // Bottom-right
        { x: 0, y: pageHeight }, // Bottom-left
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
    const progress = p as number;

    const angle = Helper.getAngle(
      isLeftPage,
      progress,
      (isRtl
        ? dir
        : dir === FlipDirection.FORWARD
        ? FlipDirection.BACK
        : FlipDirection.FORWARD) as FlipDirection,
      !isFront
    );

    const shouldFlip = progress >= 50 && !isFront;

    const translateX =
      progress >= 50 ? (isLeftPage ? pageWidth : -pageWidth) : 0;

    return `
      translate3d(${translateX}px, 0, 0)
      rotateY(${angle}deg)
      ${shouldFlip ? "scaleX(-1)" : ""}
    `;
  });
}
