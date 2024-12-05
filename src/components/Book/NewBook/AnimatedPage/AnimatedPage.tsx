import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { FlipDirection } from "../model";

interface IProps {
  pageNum: number;
  isRtl: boolean;
  isSinglePage: boolean;
  pages: JSX.Element[];
  x: SpringValue<number>;
  y: SpringValue<number>;
  r: SpringValue<number>;
  direction: SpringValue<FlipDirection>;
  progress: SpringValue<number>;
  bind: (...args: unknown[]) => ReactDOMAttributes;
  i: number;
  pageWidth: number;
}

const AnimatedPage: React.FC<IProps> = ({
  pageNum,
  isRtl,
  i,
  isSinglePage,
  pages,
  bind,
  x,
  progress,
  pageWidth,
  direction,
}) => {
  const isLeftPage = getIsLeftPage(pageNum, isRtl);
  const hasShadow = pageNum >= pages.length - 2 || pageNum < 2;

  const backPageNum = getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl,
    true
  );
  const belowPageNum = getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl
  );
  const adjustOrigin = pageNum === pages.length - 1 || pageNum === 1;

  // Front Page Style
  const frontStyle = {
    display: to([progress], (progress) => (progress < 50 ? "block" : "none")),
    transformOrigin: getOrigin(isLeftPage, pageWidth),
    clipPath: "none",
    transform: to([x, progress, direction], (x, progress, direction) => {
      const angle = getAngle(isRtl, progress, direction as FlipDirection);
      return `translate3d(${isRtl ? x : -x}px, 0px, 0px) rotateY(${angle}deg)`;
    }),
  };

  // Back Page Style
  const backStyle = {
    display: to([progress], (progress) => (progress >= 50 ? "block" : "none")),
    zIndex: progress.to((progress) => (progress > 50 ? 6 : 3)),
    transformOrigin: getOrigin(adjustOrigin ? isRtl : !isRtl, pageWidth),
    transform: to([x, progress, direction], (x, progress, direction) => {
      const angle = getAngle(isRtl, progress, direction as FlipDirection, true);
      return `translate3d(0px, 0px, 0px) rotateY(${!progress || angle}deg)`;
    }),
  };

  const shadowStyle = {
    display: progress.to((progress) => (progress > 0 ? "block" : "none")),
    width: progress.to((progress) => getShadowWidth(progress, pageWidth)),
    transform: to([progress, direction], (progress, direction) =>
      getShadowTransform(progress, direction as FlipDirection)
    ),
  };

  return (
    <>
      <animated.div
        key={`page-front-${pageNum}`}
        {...bind(i)}
        className={`${styles.page} ${isLeftPage ? "" : styles.right} ${
          isSinglePage ? styles.onePage : ""
        }`}
        style={frontStyle}
      >
        {pages[pageNum]}
      </animated.div>

      <animated.div
        key={`page-back-${backPageNum}`}
        className={`${styles.page} ${
          adjustOrigin === isRtl ? "" : styles.right
        } ${isSinglePage ? styles.onePage : ""}`}
        style={backStyle}
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
        <animated.div
          className={`${styles.shadow} ${isSinglePage ? styles.onePage : ""}`}
          style={{
            ...shadowStyle,
            background: progress.to((progress) =>
              getShadowBackground(progress)
            ),
          }}
        />
      )}

      {hasShadow && (
        <animated.div
          className={`${styles.shadow} ${styles.inner} ${
            isSinglePage ? styles.onePage : ""
          }`}
          style={{
            ...shadowStyle,
            background: progress.to((progress) =>
              getShadowBackground(progress, true)
            ),
          }}
        />
      )}
    </>
  );
};

export default AnimatedPage;

// Helper Functions
function getIsLeftPage(pageNum: number, isRtl: boolean) {
  return isRtl ? pageNum % 2 === 0 : pageNum % 2 === 1;
}

function getHiddenPageNum(
  pageNum: number,
  isSinglePage: boolean,
  isLeftPage: boolean,
  isRtl: boolean,
  isBack = false
) {
  const factor = isBack ? 1 : 2;
  return !isRtl
    ? isSinglePage || isLeftPage
      ? pageNum - factor
      : pageNum + factor
    : isSinglePage || isLeftPage
    ? pageNum + factor
    : pageNum - factor;
}

function getAngle(
  isRtl: boolean,
  progress: number,
  direction: FlipDirection,
  isBack = false
): number {
  const baseAngle =
    (-90 * (200 - progress * 2)) / 100 +
    (direction === (isRtl ? FlipDirection.FORWARD : FlipDirection.BACK)
      ? 360
      : 0);

  const normalizedAngle = Math.abs((baseAngle - 180) % 360);

  return isBack ? normalizedAngle - 180 : normalizedAngle;
}

function getOrigin(condition: boolean, pageWidth: number) {
  return condition ? `${pageWidth}px 0px` : "0px 0px";
}

function getShadowWidth(progress: number, pageWidth: number) {
  let width = ((100 - progress * 2) * (2.5 * pageWidth)) / 100 + 20;
  if (width > pageWidth) width = pageWidth;
  return width;
}

function getShadowTransform(progress: number, direction: FlipDirection) {
  const flipCondition =
    (direction === FlipDirection.FORWARD && progress > 100) ||
    (direction === FlipDirection.BACK && progress <= 100);
  return `translate3d(0, 0, 0)${flipCondition ? " rotateY(180deg)" : ""}`;
}

function getShadowBackground(progress: number, isInner = false) {
  const opacity = (100 - progress) / 100;

  return `linear-gradient(${isInner ? "to right" : "to left"}, 
      rgba(0, 0, 0, ${opacity}) 5%, 
      rgba(0, 0, 0, 0) 100%)`;
}
