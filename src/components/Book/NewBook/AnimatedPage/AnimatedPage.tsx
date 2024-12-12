import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { Corner, FlipCorner, FlipDirection, Point } from "../model";
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
  pageWidth: number;
  bookRef: React.RefObject<HTMLDivElement>;

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
  pageWidth,
  bookRef,
  corner,

  calc,
}) => {
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
      : getSoftPageStyle(
          x,
          y,
          calc,
          corner,
          progress,
          direction,
          bookRef,
          pageWidth,
          isFront
        );
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
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  bookRef: React.RefObject<HTMLDivElement>,
  pageWidth: number,
  isFront: boolean
) {
  return {
    clipPath: to(
      [corner, x, y, progress, direction, calc],
      (c, x, y, progress, dir, calc) => {
        if (c === "none" || !bookRef.current) return "none";
        x = x as number;
        y = y as number;
        dir = dir as FlipDirection;
        c = c as Corner;

        try {
          // const areaTop = FlipCalculation.getFlippingClipArea({
          //   ...points,
          //   corner: topBottomCorner,
          //   rect,
          // });
          const { intersectPoints } = calc as ICalc;

          const pageHeight = bookRef.current.getBoundingClientRect().height;

          const areaBottom = FlipCalculation.getBottomClipArea({
            ...intersectPoints,
            corner: c.includes("top") ? FlipCorner.TOP : FlipCorner.BOTTOM,
            pageHeight,
            pageWidth,
          });
          // console.log("vals", vals);
          // console.log("points", points);
          // console.log("clipTop", clipTop);
          // console.log("clipBottom", clipBottom);
          // angle: number;
          // position: Point;
          // direction: FlipDirection;
          // pageWidth: number;
          // pageHeight: number;
          // area: Point[];
          // factorPosition: Point;

          // const topSoft = FlipCalculation.getSoftCss({
          //   position: pos,
          //   pageWidth,
          //   pageHeight,
          //   area: areaTop,
          //   direction: dir,
          //   angle,
          //   factorPosition: FlipCalculation.getActiveCorner(dir, rect),
          // });

          // const bottomSoft = FlipCalculation.getSoftCss({
          //   position: pos,
          //   pageWidth,
          //   pageHeight,
          //   area: areaBottom,
          //   direction: dir,
          //   angle: 0,
          //   factorPosition: FlipCalculation.getBottomPagePosition(
          //     dir,
          //     pageWidth
          //   ),
          // });

          const invertedArea = invertClipPath(
            areaBottom,
            pageWidth,
            pageHeight
          );

          const topSoft = `polygon(${invertedArea
            .filter((p) => p !== null)
            .map((p) => `${p.x}px ${p.y}px`)
            .join(", ")})`;

          // console.log("topSoft", topSoft);
          // console.log("bottomSoft", bottomSoft);

          if (isFront) {
            return topSoft;
          } else {
            // For back page, show only the folded triangle
            return "none";
          }
        } catch {
          return "none";
        }
      }
    ),
    transform: to([corner, x, y, progress], (c, xVal, yVal, p) => {
      if (c === "none" || !bookRef.current || isFront) return "none";
      const bookRect = bookRef.current.getBoundingClientRect();

      const localX = (xVal as number) - bookRect.left;
      const localY = (yVal as number) - bookRect.top;
      return "none";

      return transformSoftBack(
        localX - pageWidth + 100,
        localY - bookRect.height + 100,
        c as Corner,
        pageWidth,
        bookRect.height
      );
    }),
    zIndex: to([progress, corner], (p, corner) => {
      if (isFront) return 3;
      return (p as number) > 0 && (corner as Corner) !== "none" ? 0 : 2;
    }),
  };
}

function invertClipPath(
  originalPoints: Point[],
  pageWidth: number,
  pageHeight: number
): Point[] {
  const result: Point[] = [];

  // Find where the original polygon intersects with the page edges
  const topIntersect = originalPoints.find((p) => p !== null && p.y === 0);

  // Add points in the correct order to create an inverted clip path
  if (topIntersect) {
    result.push({ x: 0, y: 0 });
    result.push(topIntersect);
  }

  // Add the original points in reverse order to create the "hole"
  for (let i = originalPoints.length - 1; i >= 0; i--) {
    if (originalPoints[i] !== null) {
      result.push(originalPoints[i]!);
    }
  }

  // Close the path by connecting back to the starting point
  if (topIntersect) {
    result.push(topIntersect);
    result.push({ x: pageWidth, y: 0 });
    result.push({ x: pageWidth, y: pageHeight });
    result.push({ x: 0, y: pageHeight });
  }

  return result;
}

function transformSoftBack(
  x: number,
  y: number,
  c: Corner,
  pageWidth: number,
  pageHeight: number
) {
  console.log("c", c);

  // Get corner base position and calculate relative coordinates
  switch (c) {
    case "top-left": {
      // Original shows around -1.97127rad
      const angle = Math.PI / 2 - Math.atan2(x, y);
      return `translate3d(${x}px, ${y}px, 0px) rotate(${angle}rad)`;
    }
    case "top-right": {
      // Original shows around -2.61592rad
      const angle = Math.PI / 2 - Math.atan2(pageWidth - x, y);
      return `translate3d(${x}px, ${y}px, 0px) rotate(${angle}rad)`;
    }
    case "bottom-left": {
      // Original shows around -0.105467rad
      const angle = -Math.PI / 2 - Math.atan2(x, pageHeight - y);
      return `translate3d(${x}px, ${y}px, 0px) rotate(${angle}rad)`;
    }
    case "bottom-right": {
      // Original shows similar pattern
      const angle = -Math.PI / 2 - Math.atan2(pageWidth - x, pageHeight - y);
      return `translate3d(${x}px, ${y}px, 0px) rotate(${angle}rad)`;
    }
    default:
      return "none";
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
// function getPageRect(localPos: Point): RectPoints {
//   if (this.corner === FlipCorner.TOP) {
//     return this.getRectFromBasePoint(
//       [
//         { x: 0, y: 0 },
//         { x: this.pageWidth, y: 0 },
//         { x: 0, y: this.pageHeight },
//         { x: this.pageWidth, y: this.pageHeight },
//       ],
//       localPos
//     );
//   }

//   return this.getRectFromBasePoint(
//     [
//       { x: 0, y: -this.pageHeight },
//       { x: this.pageWidth, y: -this.pageHeight },
//       { x: 0, y: 0 },
//       { x: this.pageWidth, y: 0 },
//     ],
//     localPos
//   );
// }

// function getRectFromBasePoint(points: Point[], localPos: Point): RectPoints {
//   return {
//     topLeft: FlipCalculation.getRotatedPoint(points[0], localPos),
//     topRight:Helper.getRotatedPoint(points[1], localPos),
//     bottomLeft: Helper.this.getRotatedPoint(points[2], localPos),
//     bottomRight: Helper.getRotatedPoint(points[3], localPos),
//   };
// }
