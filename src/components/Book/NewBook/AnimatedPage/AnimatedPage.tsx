import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { FlipDirection } from "../model";

interface IProps {
  pageNum: number;
  isRtl: boolean;
  isFirst: boolean;
  isLast: boolean;
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
  // isFirst,
  isLast,
  // z,
  // r,
  isSinglePage,
  pages,
  bind,
  x,
  // y,
  progress,
  pageWidth,
  direction,
}) => {
  const isLeftPage = getIsLeftPage(pageNum, isRtl);

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

  return (
    <>
      <animated.div
        key={`page-front-${pageNum}`}
        {...bind(i)}
        className={`${styles.page} ${isLeftPage ? "" : styles.right}`}
        style={{
          display: to([progress], (progress) =>
            progress < 50 ? "block" : "none"
          ),
          transformOrigin: getOrigin(isLeftPage, pageWidth),
          clipPath: "none",
          transform: to([x, progress, direction], (x, progress, direction) => {
            const angle = getAngle(
              isRtl,
              progress,
              direction as FlipDirection,
              isLast
            );

            return `translate3d(${
              isRtl ? x : -x
            }px, 0px, 0px) rotateY(${angle}deg) `;
          }),
        }}
      >
        {pages[pageNum]}
      </animated.div>

      <animated.div
        key={`page-back-${backPageNum}`}
        className={`${styles.page} ${isLast === isRtl ? "" : styles.right}`}
        style={{
          display: to([progress], (progress) => {
            return progress >= 50 ? "block" : "none";
          }),
          zIndex: progress.to((progress) => (progress > 50 ? 6 : 3)),
          transformOrigin: getOrigin(isLast ? isRtl : !isRtl, pageWidth),
          transform: to([x, progress, direction], (x, progress, direction) => {
            const angle = getAngle(isRtl, progress, direction as FlipDirection);
            const correctedAngle = x > 0 ? 0 : angle - 180;

            return `translate3d(0px, 0px, 0px) rotateY(${correctedAngle}deg)`;
          }),
        }}
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
    </>
  );
};

export default AnimatedPage;

function getIsLeftPage(pageNum: number, isRtl: boolean) {
  if (isRtl) {
    return pageNum % 2 === 0;
  }
  return pageNum % 2 === 1;
}

function getHiddenPageNum(
  pageNum: number,
  isSinglePage: boolean,
  isLeftPage: boolean,
  isRtl: boolean,
  isBack = false
) {
  const factor = isBack ? 1 : 2;
  if (!isRtl) {
    return isSinglePage || isLeftPage ? pageNum - factor : pageNum + factor;
  }
  return isSinglePage || isLeftPage ? pageNum + factor : pageNum - factor;
}

function getAngle(
  isRtl: boolean,
  progress: number,
  direction: FlipDirection,
  isLast = false
): number {
  const baseAngle =
    direction === (isRtl ? FlipDirection.BACK : FlipDirection.FORWARD)
      ? (-90 * (200 - progress * 2)) / 100
      : (90 * (200 - progress * 2)) / 100;
  const angle = Math.abs(baseAngle - 180);
  return isLast ? Math.abs(360 - angle) : angle;
}

function getOrigin(condition: boolean, pageWidth: number) {
  return condition ? pageWidth + "px 0px" : "0px 0px";
}
