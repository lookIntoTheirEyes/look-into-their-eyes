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
  pageHeight: number;
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
  pageHeight,
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
          pageHeight,
          pageWidth,
          isFront,
          isLeftPage
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

function getSoftDisplay(
  isFront: boolean,
  progress: SpringValue<number>,
  isLeftPage: boolean
) {
  if (!isFront) {
    return {};
  }

  return {
    display: progress.to((p) => (p > 0 ? "block" : "none")),
    top: 0,
  };
}

function getSoftPageStyle(
  x: SpringValue<number>,
  y: SpringValue<number>,
  calc: SpringValue<ICalc>,
  corner: SpringValue<Corner>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  pageHeight: number,
  pageWidth: number,
  isFront: boolean,
  isLeftPage: boolean
) {
  return {
    // ...getSoftDisplay(isFront, progress, isLeftPage),
    clipPath: to(
      [corner, x, y, direction, calc],
      (corner, x, y, direction, calc) => {
        if (corner === "none") return "none";
        x = x as number;
        y = y as number;
        direction = direction as FlipDirection;
        corner = corner as Corner;

        if (isFront) {
          return getFrontSoftClipPath({
            calc: calc as ICalc,
            pageHeight,
            pageWidth,
            direction,
            corner,
          });
        } else {
          // For back page, show only the folded triangle
          return getBackSoftClipPath({
            calc: calc as ICalc,
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

      const { angle, localPos } = calc;
      console.log("localPos", localPos);

      const trans = `translate3d(${localPos!.x}px, ${
        localPos!.y
      }px, 0) rotate(${angle}rad)`;

      // console.log("trans", trans);

      return trans;
    }),
    zIndex: to([progress, corner], (p, corner) => {
      if (p === 100) {
        // debugger;
      }
      if (isFront) return 3;
      return (p as number) > 0 && (corner as Corner) !== "none" ? 4 : 2;
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
  const { intersectPoints, rect, localPos: position, angle } = calc;
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

  // console.log("getSoftCss", area);

  return backSoft;
}

function getFrontSoftClipPath({
  calc,
  pageHeight,
  corner,
  pageWidth,
  direction,
}: {
  calc: ICalc;
  pageHeight: number;
  corner: Corner;
  direction: FlipDirection;
  pageWidth: number;
}): string {
  const { intersectPoints } = calc;

  const area = FlipCalculation.getBottomClipArea({
    ...intersectPoints,
    corner: corner.includes("top") ? FlipCorner.TOP : FlipCorner.BOTTOM,
    pageHeight,
    pageWidth,
  });

  // const topSoft = FlipCalculation.getSoftCss({
  //   position: pos,
  //   pageWidth,
  //   pageHeight,
  //   area,
  //   direction,
  //   angle: 0,
  //   factorPosition: FlipCalculation.getBottomPagePosition(direction, pageWidth),
  // });

  const wrongTopSoft = `polygon(${invertClipPath(
    area,
    pageWidth,
    pageHeight,
    corner
  )
    .filter((p) => p !== null)
    .map((p) => `${p.x}px ${p.y}px`)
    .join(", ")})`;

  // console.log("wrongTopSoft", wrongTopSoft);
  // console.log("not invertedTopSoft", topSoft);
  return wrongTopSoft;
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
      // Find the fold point (usually second point in array)
      const foldPoint = points.find((p) => p.x !== pageWidth && p.y !== 0) ?? {
        x: pageWidth,
        y: pageHeight,
      };

      return [
        { x: 0, y: 0 }, // Start top-left
        { x: foldPoint.x, y: 0 }, // Top to fold point X
        foldPoint, // To fold point
        { x: pageWidth, y: foldPoint.y }, // To right edge
        { x: pageWidth, y: pageHeight }, // Down right edge
        { x: 0, y: pageHeight }, // Complete rectangle
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

    case "bottom-left":
      return [
        { x: 0, y: pageHeight },
        ...points,
        { x: 0, y: 0 },
        { x: pageWidth, y: 0 },
        { x: pageWidth, y: pageHeight },
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
