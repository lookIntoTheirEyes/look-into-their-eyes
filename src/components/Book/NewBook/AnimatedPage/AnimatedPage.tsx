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
      : getSoftPageStyle(x, y, corner, progress, bookRef, pageWidth);
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

function getPolygonForCorner(
  corner: string,
  size: number,
  pageWidth: number,
  pageHeight: number
): string {
  switch (corner) {
    case "top-right":
      return `polygon(
        ${pageWidth - size}px 0,
        ${pageWidth}px ${size}px,
        ${pageWidth}px 100%,
        0 100%,
        0 0
      )`;
    case "top-left":
      return `polygon(
        0 ${size}px,
        ${size}px 0,
        ${pageWidth}px 0,
        ${pageWidth}px 100%,
        0 100%
      )`;
    case "bottom-right":
      return `polygon(
        0 0,
        ${pageWidth}px 0,
        ${pageWidth}px ${pageHeight - size}px,
        ${pageWidth - size}px ${pageHeight}px,
        0 ${pageHeight}px
      )`;
    case "bottom-left":
      return `polygon(
        0 0,
        ${pageWidth}px 0,
        ${pageWidth}px ${pageHeight}px,
        ${size}px ${pageHeight}px,
        0 ${pageHeight - size}px
      )`;
    default:
      return "none";
  }
}

function getSoftPageStyle(
  x: SpringValue<number>,
  y: SpringValue<number>,
  corner: SpringValue<Corner>,
  progress: SpringValue<number>,
  bookRef: React.RefObject<HTMLDivElement>,
  pageWidth: number
) {
  return {
    clipPath: to([corner], (c) => {
      console.log("clipPath", c);

      return getClipPath(c);
    }),
  };
}

function getClipPath(corner: Corner) {
  switch (corner) {
    case "top-left":
      return `polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 45%)`;
    case "top-right":
      return `polygon(50% 0%, 100% 49%, 100% 100%, 0 100%, 0 0)`;
    case "bottom-right":
      return `polygon(100% 71%, 73% 100%, 0 100%, 0 0, 100% 0)`;
    case "bottom-left":
      return `polygon(100% 100%, 41% 100%, 0 65%, 0 0, 100% 0)`;
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
