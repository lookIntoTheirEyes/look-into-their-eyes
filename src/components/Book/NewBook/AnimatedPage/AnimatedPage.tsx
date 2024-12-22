import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { Corner, FlipDirection, PageRect } from "../model";
import Helper from "../Helper";
import ShadowStyle from "../shadow";

import FlipCalculation, { ICalc } from "../FlipCalculation";
import { useRef } from "react";
import PageStyle from "../pageStyle";

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
  bookRect: PageRect;
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
  bookRect,
  corner,
}) => {
  const { pageWidth } = bookRect;
  const prevCalc = useRef<ICalc | null>(null);
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

  const calculatedValues = to(
    [x, y, direction, corner, progress],
    (x, y, direction, corner, progress) => {
      if (corner === "none" || isHardPage) return null;
      x = x as number;
      y = y as number;
      direction = direction as FlipDirection;
      progress = progress as number;
      corner = corner as Corner;

      try {
        const calc = FlipCalculation.getCalc({
          x,
          y,
          direction,
          corner,
          containerRect: bookRect,
          isRtl,
          progress,
        });

        prevCalc.current = calc;

        return calc;
      } catch {
        return prevCalc.current;
      }
    }
  );

  const getPageStyle = (isFront: boolean) => {
    return isHardPage
      ? PageStyle.getHardPageStyle(
          x,
          progress,
          direction,
          pageWidth,
          isLeftPage,
          isRtl,
          isFront
        )
      : PageStyle.getSoftPageStyle(
          calculatedValues,
          corner,
          direction,
          bookRect,
          isFront,
          isRtl
        );
  };

  const getShadowStyle = (inner = false) => {
    return isHardPage
      ? ShadowStyle.getHardShadowStyle(
          progress,
          direction,
          pageWidth,
          isRtl,
          inner
        )
      : ShadowStyle.getSoftShadowStyle(
          direction,
          isRtl,
          inner,
          calculatedValues,
          bookRect
        );
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
        <animated.div className={`${styles.page}`} style={getPageStyle(true)}>
          {pages[pageNum]}
        </animated.div>

        <animated.div
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
            style={PageStyle.getBelowPageStyle({
              isRtl,
              isHardPage,
              bookRect,
              calculatedValues,
              direction,
              corner,
              progress,
            })}
          >
            {pages[belowPageNum]}
          </animated.div>
        )}
        {[false, true].map((isInner) => (
          <animated.div
            key={isInner ? "inner-shadow" : "outer-shadow"}
            className={`${styles.shadow} ${
              isSinglePage || (!isHardPage && isLeftPage) ? styles.onePage : ""
            } ${isHardPage ? styles.hard : ""} ${isInner ? styles.inner : ""}
            ${isLeftPage ? styles.left : ""}
            `}
            style={getShadowStyle(isInner)}
          />
        ))}
      </animated.div>
    </>
  );
};

export default AnimatedPage;
