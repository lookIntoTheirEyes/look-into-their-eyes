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
  if (!bookRect) return "none";

  // Convert to local coordinates
  const localX = cursorX - bookRect.left;
  const localY = cursorY - bookRect.top;

  // Convert to percentages relative to page (not book)
  const pageWidth = bookRect.width / 2;
  const x = (localX / pageWidth) * 100;
  const y = (localY / bookRect.height) * 100;

  // Calculate fold line angle and intersection
  let foldX = x;
  let foldY = y;

  switch (corner) {
    case "top-left": {
      // Constrain fold line between 0-100%
      foldY = Math.max(0, Math.min(100, y));
      // Page should remain fully visible until cursor moves beyond page width
      foldX = Math.min(100, Math.max(0, x));
      return `polygon(
        50% 0%,
        100% 0%,
        100% 100%,
        0% 100%,
        0% ${foldY}%
      )`;
    }
    case "top-right": {
      foldY = Math.max(0, Math.min(100, y));
      foldX = Math.min(200, Math.max(100, x));
      return `polygon(
        0% 0%,
        50% 0%,
        100% ${foldY}%,
        100% 100%,
        0% 100%
      )`;
    }
    case "bottom-right": {
      foldY = Math.max(0, Math.min(100, y));
      foldX = Math.min(200, Math.max(100, x));
      return `polygon(
        0% 0%,
        100% 0%,
        100% ${foldY}%,
        ${Math.min(100, foldX)}% 100%,
        0% 100%
      )`;
    }
    case "bottom-left": {
      foldY = Math.max(0, Math.min(100, y));
      foldX = Math.min(100, Math.max(0, x));
      return `polygon(
        0% 0%,
        100% 0%,
        100% 100%,
        ${foldX}% 100%,
        0% ${foldY}%
      )`;
    }
    default:
      return "none";
  }
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
      isFront
        ? getClipPath(c as Corner, xVal as number, yVal as number, bookRef)
        : "none"
    ),
    transform: to([corner, x, y, progress], (c, xVal, yVal, p) => {
      // console.log("transform corner", c);
      // console.log("transform bookref", bookRef.current);

      if (c === "none" || !bookRef.current || isFront) return "none";
      const bookRect = bookRef.current.getBoundingClientRect();

      const localX = (xVal as number) - bookRect.left;
      const localY = (yVal as number) - bookRect.top;
      // console.log("xVal", xVal);

      return transformSoftBack(
        localX - pageWidth + 100,
        localY - bookRect.height + 100,
        c as Corner,
        pageWidth,
        bookRect.height
      );

      // Get corner base position
    }),
    zIndex: to([progress, corner], (p, corner) => {
      if (isFront) return 3;
      return (p as number) > 0 && (corner as Corner) !== "none" ? 4 : 2;
    }),
  };
}

function transformSoftBack(
  x: number,
  y: number,
  c: Corner,
  pageWidth: number,
  pageHeight: number
) {
  // console.log("transformSoftBack", x);

  let cornerX: number, cornerY: number;
  let origin: string;

  switch (c) {
    case "top-left":
      cornerX = 0;
      cornerY = 0;
      origin = "0 0";
      break;
    case "top-right":
      cornerX = pageWidth;
      cornerY = 0;
      origin = "100% 0";
      break;
    case "bottom-left":
      cornerX = 0;
      cornerY = pageHeight;
      origin = "0 100%";
      break;
    case "bottom-right":
      cornerX = pageWidth;
      cornerY = pageHeight;
      origin = "100% 100%";
      break;
    default:
      return "none";
  }

  // Calculate fold angle
  const angle = Math.atan2(x - cornerY, y - cornerX);
  const backAngle = angle + (c.includes("right") ? -Math.PI : Math.PI);
  console.log("backAngle", backAngle);

  // 'display: block; z-index: 35; left: 0px; top: 0px; width: 595.069px; height: 779px; transform-origin: 0px 0px; clip-path: polygon(0px 0px, 101.244px -6.03961e-14px, -3.19744e-14px 80.8385px); transform: translate3d(1111.45px, 99px, 0px) rotate(-1.78172rad);'
  return `translate3d(${x}px, ${y}px, 0px) rotate(${backAngle}rad)`;
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
