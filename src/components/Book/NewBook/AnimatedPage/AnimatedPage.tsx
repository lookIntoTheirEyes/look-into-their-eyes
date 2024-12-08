import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { FlipDirection } from "../model";
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
  bind: (...args: unknown[]) => ReactDOMAttributes;
  i: number;
  pageWidth: number;
}

const AnimatedPage: React.FC<IProps> = ({
  pageNum,
  isRtl,
  isSinglePage,
  pages,
  bind,
  x,
  progress,
  direction,
  i,
  pageWidth,
}) => {
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const hasShadow = Helper.isHardPage(pageNum, pages.length);
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

  // Styles for Front and Back Pages
  const getPageStyle = (isFront: boolean) => ({
    display: progress.to((p) =>
      (isFront ? p < 50 : p >= 50) ? "block" : "none"
    ),
    transformOrigin: Helper.getOrigin(
      isFront ? isLeftPage : adjustOrigin === isRtl,
      pageWidth
    ),
    transform: getHardPageTransform(x, progress, direction, isRtl, isFront),
    zIndex: isFront ? undefined : progress.to((p) => (p > 50 ? 6 : 3)),
  });

  // Front Page Style

  // Shadow Styles
  const shadowStyle = {
    display: progress.to((p) => (p > 0 ? "block" : "none")),
    width: progress.to((p) => Helper.getShadowWidth(p, pageWidth)),
  };

  const shadowTransform = (inner = false) =>
    to([progress, direction], (p, dir) =>
      Helper.getShadowTransform(p as number, dir as FlipDirection, isRtl, inner)
    );

  return (
    <>
      <animated.div
        {...bind(i)}
        key={`page-front-${pageNum}`}
        className={`${styles.page} ${isLeftPage ? "" : styles.right} ${
          isSinglePage ? styles.onePage : ""
        }`}
        style={getPageStyle(true)}
      >
        {pages[pageNum]}
      </animated.div>

      <animated.div
        key={`page-back-${backPageNum}`}
        className={`${styles.page} ${
          adjustOrigin === isRtl ? "" : styles.right
        } ${isSinglePage ? styles.onePage : ""}`}
        style={getPageStyle(false)}
      >
        {pages[backPageNum]}
      </animated.div>

      {belowPageNum > 0 && belowPageNum < pages.length - 1 && (
        <div
          className={`${styles.page} ${isLeftPage ? "" : styles.right} ${
            styles.below
          } ${isSinglePage ? styles.onePage : ""}`}
        >
          {pages[belowPageNum]}
        </div>
      )}

      {hasShadow && (
        <>
          <animated.div
            className={`${styles.shadow} ${isSinglePage ? styles.onePage : ""}`}
            style={{
              ...shadowStyle,
              background: progress.to((p) => Helper.getShadowBackground(p)),
              transform: shadowTransform(),
            }}
          />
          <animated.div
            className={`${styles.shadow} ${styles.inner} ${
              isSinglePage ? styles.onePage : ""
            }`}
            style={{
              ...shadowStyle,
              background: progress.to((p) =>
                Helper.getShadowBackground(p, true)
              ),
              transform: shadowTransform(true),
            }}
          />
        </>
      )}
    </>
  );
};

export default AnimatedPage;

// Helper Functions
function getFrontTransform(
  x: SpringValue<number>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  isRtl: boolean
) {
  return to(
    [x, progress, direction],
    (x, p, dir) =>
      `translate3d(${isRtl ? x : -x}px, 0, 0) rotateY(${Helper.getAngle(
        isRtl,
        p as number,
        dir as FlipDirection
      )}deg)`
  );
}

function getBackTransform(
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  isRtl: boolean
) {
  return to(
    [progress, direction],
    (p, dir) =>
      `translate3d(0, 0, 0) rotateY(${Helper.getAngle(
        isRtl,
        p as number,
        dir as FlipDirection,
        true
      )}deg)`
  );
}

function getHardPageTransform(
  x: SpringValue<number>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  isRtl: boolean,
  isFront: boolean
) {
  return to(
    [x, progress, direction],
    (x, p, dir) =>
      `translate3d(${
        !isFront ? 0 : isRtl ? x : -x
      }px, 0, 0) rotateY(${Helper.getAngle(
        isRtl,
        p as number,
        dir as FlipDirection,
        !isFront
      )}deg)`
  );
}
