import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { Corner, FlipDirection } from "../model";
import Helper from "../Helper";

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

function getClipPath(
  corner: Corner,
  cursorX: number,
  cursorY: number,
  bookRef: React.RefObject<HTMLDivElement>
): string {
  const bookRect = bookRef.current?.getBoundingClientRect();
  if (!bookRect) {
    return "none";
  }

  // Convert to local coordinates and percentages
  const x = ((cursorX - bookRect.left) / (bookRect.width / 2)) * 100;
  const y = ((cursorY - bookRect.top) / bookRect.height) * 100;

  // Get corner coordinates in percentages
  let cornerX: number, cornerY: number;

  switch (corner) {
    case "top-left":
      cornerX = 0;
      cornerY = 0;
      break;
    case "top-right":
      cornerX = 100;
      cornerY = 0;
      break;
    case "bottom-left":
      cornerX = 0;
      cornerY = 100;
      break;
    case "bottom-right":
      cornerX = 100;
      cornerY = 100;
      break;
    default:
      return "none";
  }

  // Calculate angle between corner and cursor
  const angle = Math.atan2(y - cornerY, x - cornerX);

  // Generate clip points based on corner
  const points: string[] = [];

  switch (corner) {
    case "top-left": {
      const intersectY = Math.min(Math.max(y, 0), 100);
      points.push(
        "50% 0%", // Top middle
        "100% 0%", // Top right
        "100% 100%", // Bottom right
        "0% 100%", // Bottom left
        `0% ${intersectY}%` // Intersection point
      );
      break;
    }
    case "top-right": {
      const intersectY = Math.min(Math.max(y, 0), 100);
      points.push(
        "0% 0%", // Top left
        "50% 0%", // Top middle
        `100% ${intersectY}%`, // Intersection point
        "100% 100%", // Bottom right
        "0% 100%" // Bottom left
      );
      break;
    }
    case "bottom-right": {
      const intersectX = Math.min(Math.max(x, 0), 100);
      points.push(
        "0% 0%", // Top left
        "100% 0%", // Top right
        `100% ${y}%`, // Intersection point
        `${intersectX}% 100%`, // Bottom intersection
        "0% 100%" // Bottom left
      );
      break;
    }
    case "bottom-left": {
      const intersectX = Math.min(Math.max(x, 0), 100);
      points.push(
        "0% 0%", // Top left
        "100% 0%", // Top right
        "100% 100%", // Bottom right
        `${intersectX}% 100%`, // Bottom intersection
        `0% ${y}%` // Side intersection
      );
      break;
    }
  }

  return `polygon(${points.join(", ")})`;
}

function getSoftPageStyle(
  x: SpringValue<number>,
  y: SpringValue<number>,
  corner: SpringValue<Corner>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  bookRef: React.RefObject<HTMLDivElement>,
  pageWidth: number,
  isFront: boolean
) {
  return {
    clipPath: to([corner, x, y], (c, xVal, yVal) =>
      getClipPath(c as Corner, xVal as number, yVal as number, bookRef)
    ),
    transform: to([corner, x, y, progress], (c, xVal, yVal, p) => {
      if (!c) return "none";
      const bookRect = bookRef.current?.getBoundingClientRect();
      if (!bookRect) return "none";

      // Set transform origin based on corner
      const origin = {
        "top-left": "0% 0%",
        "top-right": "100% 0%",
        "bottom-left": "0% 100%",
        "bottom-right": "100% 100%",
      }[c];

      // Calculate angle
      const localX = (xVal as number) - bookRect.left;
      const localY = (yVal as number) - bookRect.top;
      let angle = 0;

      switch (c) {
        case "top-left":
          angle = Math.atan2(localY, localX);
          break;
        case "top-right":
          angle = Math.atan2(localY, localX - pageWidth);
          break;
        case "bottom-left":
          angle = Math.atan2(localY - bookRect.height, localX);
          break;
        case "bottom-right":
          angle = Math.atan2(localY - bookRect.height, localX - pageWidth);
          break;
      }

      return `
        transform-origin: ${origin}
        rotate(${angle}rad)
      `;
    }),
  };
}

// function calculateIntersectPoint(pos: Point,pageWidth:number,pageHeight:number,corner:Corner) {
//   const boundRect: Rect = {
//     left: -1,
//     top: -1,
//     width: pageWidth + 2,
//     height: pageHeight + 2,
//   };

//   if (corner === 'top-left' || corner === 'top-right') {
//     const topIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
//       boundRect,
//       [pos, this.rect.topRight],
//       [
//         { x: 0, y: 0 },
//         { x: pageWidth, y: 0 },
//       ]
//     );

//     const sideIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
//       boundRect,
//       [pos, this.rect.bottomLeft],
//       [
//         { x: pageWidth, y: 0 },
//         { x: pageWidth, y: pageHeight },
//       ]
//     );

//     const bottomIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
//       boundRect,
//       [this.rect.bottomLeft, this.rect.bottomRight],
//       [
//         { x: 0, y: pageHeight },
//         { x: pageWidth, y:pageHeight },
//       ]
//     );
//     return {
//       topIntersectPoint,bottomIntersectPoint,sideIntersectPoint}
//   } else {
//     const topIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
//       boundRect,
//       [this.rect.topLeft, this.rect.topRight],
//       [
//         { x: 0, y: 0 },
//         { x: pageWidth, y: 0 },
//       ]
//     );

//     const sideIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
//       boundRect,
//       [pos, this.rect.topLeft],
//       [
//         { x: pageWidth, y: 0 },
//         { x: pageWidth, y: pageHeight },
//       ]
//     );

//     const bottomIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
//       boundRect,
//       [this.rect.bottomLeft, this.rect.bottomRight],
//       [
//         { x: 0, y: pageHeight },
//         { x: pageWidth, y: pageHeight },
//       ]
//     );
//     return {topIntersectPoint,bottomIntersectPoint,sideIntersectPoint}
//   }
// }

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
