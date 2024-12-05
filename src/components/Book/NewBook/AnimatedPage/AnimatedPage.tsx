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
  const adjustOrigin = pageNum === pages.length - 1 || pageNum === 1;

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
            const angle = getAngle(isRtl, progress, direction as FlipDirection);

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
        className={`${styles.page} ${
          adjustOrigin === isRtl ? "" : styles.right
        }`}
        style={{
          display: to([progress], (progress) => {
            return progress >= 50 ? "block" : "none";
          }),
          zIndex: progress.to((progress) => (progress > 50 ? 6 : 3)),
          transformOrigin: getOrigin(adjustOrigin ? isRtl : !isRtl, pageWidth),
          transform: to([x, progress, direction], (x, progress, direction) => {
            const angle = getAngle(
              isRtl,
              progress,
              direction as FlipDirection,
              true
            );

            return `translate3d(0px, 0px, 0px) rotateY(${
              !progress || angle
            }deg)`;
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
  return condition ? pageWidth + "px 0px" : "0px 0px";
}
