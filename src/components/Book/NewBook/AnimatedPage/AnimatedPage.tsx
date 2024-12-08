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
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const hasShadow = pageNum >= pages.length - 2 || pageNum < 2;

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

  // Front Page Style
  const frontStyle = {
    display: to([progress], (progress) => (progress < 50 ? "block" : "none")),
    transformOrigin: Helper.getOrigin(isLeftPage, pageWidth),
    clipPath: "none",
    transform: to([x, progress, direction], (x, progress, direction) => {
      const angle = Helper.getAngle(
        isRtl,
        progress as number,
        direction as FlipDirection
      );

      return `translate3d(${
        isRtl ? x : -(x as number)
      }px, 0px, 0px) rotateY(${angle}deg)`;
    }),
  };

  // Back Page Style
  const backStyle = {
    display: to([progress], (progress) => (progress >= 50 ? "block" : "none")),
    zIndex: progress.to((progress) => (progress > 50 ? 6 : 3)),
    transformOrigin: Helper.getOrigin(adjustOrigin ? isRtl : !isRtl, pageWidth),
    transform: to([progress, direction], (progress, direction) => {
      const angle = Helper.getAngle(
        isRtl,
        progress as number,
        direction as FlipDirection,
        true
      );
      return `translate3d(0px, 0px, 0px) rotateY(${!progress || angle}deg)`;
    }),
  };

  const shadowStyle = {
    display: progress.to((progress) => (progress > 0 ? "block" : "none")),
    width: progress.to((progress) =>
      Helper.getShadowWidth(progress, pageWidth)
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
              Helper.getShadowBackground(progress)
            ),
            transform: to([progress, direction], (progress, direction) =>
              Helper.getShadowTransform(
                progress as number,
                direction as FlipDirection,
                isRtl
              )
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
              Helper.getShadowBackground(progress, true)
            ),
            transform: to([progress, direction], (progress, direction) =>
              Helper.getShadowTransform(
                progress as number,
                direction as FlipDirection,
                isRtl,
                true
              )
            ),
          }}
        />
      )}
    </>
  );
};

export default AnimatedPage;
