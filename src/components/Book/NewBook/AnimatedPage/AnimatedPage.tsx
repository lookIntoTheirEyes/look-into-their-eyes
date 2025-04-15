"use client";

import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { Corner, FlipDirection, PageRect } from "../model";
import Helper from "../Helper";
import ShadowStyle from "../shadow";

import FlipCalculation, { ICalc } from "../FlipCalculation";
import { useRef, useMemo, useEffect } from "react";
import PageStyle from "../pageStyle";
import { usePreloadPages } from "@/components/Image/imagePreloader";

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
  pagesConfig: {
    mainPageNum: number;
    backPageNum: number;
    belowPageNum: number;
  };
}

/**
 * Component responsible for rendering a page with animation effects
 */
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
  pagesConfig,
}) => {
  const { pageWidth } = bookRect;
  const prevCalc = useRef<ICalc | null>(null);
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const { backPageNum, belowPageNum } = pagesConfig;

  // Use a memoized value to determine if this is a hard page
  const isHardPage = useMemo(
    () =>
      Helper.isHardPage(pageNum, pages.length) ||
      Helper.isHardPage(backPageNum, pages.length) ||
      Helper.isHardPage(belowPageNum, pages.length),
    [pageNum, backPageNum, belowPageNum, pages.length]
  );

  const adjustOrigin = pageNum === pages.length - 1 || pageNum === 0;

  // Preload images for nearby pages to improve performance
  usePreloadPages({
    pages,
    currentPage: pageNum,
    isSinglePage,
  });

  // Calculate values needed for rendering the page based on animation state
  const calculatedValues = to(
    [x, y, direction, corner, progress],
    (x, y, direction, corner, progress) => {
      if (corner === "none" || isHardPage) return null;

      // Type assertion for animation values
      const typedX = x as number;
      const typedY = y as number;
      const typedDirection = direction as FlipDirection;
      const typedProgress = progress as number;
      const typedCorner = corner as Corner;

      try {
        // Calculate page position and rotation
        const calc = FlipCalculation.getCalc({
          x: typedX,
          y: typedY,
          direction: typedDirection,
          corner: typedCorner,
          containerRect: { ...bookRect, top: bookRect.top + window.scrollY },
          isRtl,
          progress: typedProgress,
        });

        prevCalc.current = calc;
        return calc;
      } catch {
        // On error, use previous calculation if we're in the middle of a flip
        return typedProgress > 0 ? prevCalc.current : null;
      }
    }
  );

  // Function to get page style based on flip type and state
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
          isRtl,
          progress
        );
  };

  // Function to get shadow style based on flip type and state
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

  // Effect to cleanup resources and reset cached calculations when unmounted
  useEffect(() => {
    return () => {
      prevCalc.current = null;
    };
  }, []);

  // For hard pages, we need to render both front and back sides separately
  const renderHardPages = () => {
    // Only render if we're dealing with hard pages
    if (!isHardPage) return null;

    return (
      <>
        {/* Front side of the hard page */}
        <animated.div
          className={`${styles.page} ${styles.hardPage} ${styles.front}`}
          style={getPageStyle(true)}
        >
          {pages[pageNum]}
        </animated.div>

        {/* Back side of the hard page - crucial for proper hard page animation */}
        <animated.div
          className={`${styles.page} ${styles.hardPage} ${styles.back}`}
          style={getPageStyle(false)}
        >
          {backPageNum >= 0 && backPageNum < pages.length
            ? pages[backPageNum]
            : null}
        </animated.div>
      </>
    );
  };

  // For soft pages, we render front, back, and below pages
  const renderSoftPages = () => {
    // Only render if we're dealing with soft pages
    if (isHardPage) return null;

    return (
      <>
        {/* Front page */}
        <animated.div className={`${styles.page}`} style={getPageStyle(true)}>
          {pages[pageNum]}
        </animated.div>

        {/* Back page */}
        <animated.div
          className={`${styles.page} ${styles.back} ${
            adjustOrigin === isRtl ? "" : styles.right
          }`}
          style={getPageStyle(false)}
        >
          {backPageNum >= 0 && backPageNum < pages.length
            ? pages[backPageNum]
            : null}
        </animated.div>
      </>
    );
  };

  return (
    <>
      <animated.div
        className={`
          ${styles.pageWrapper} 
          ${isLeftPage ? "" : styles.right} 
          ${isSinglePage ? styles.onePage : ""}
          ${isHardPage ? styles.hardPageWrapper : ""}
        `}
        {...bind(i)}
        style={{
          // Set proper z-index based on animation progress
          zIndex: progress.to((p) => (p > 50 ? 9 : !p ? 6 : 8)),
        }}
      >
        {/* Render different page types */}
        {isHardPage ? renderHardPages() : renderSoftPages()}

        {/* Below page (visible under current page) */}
        {belowPageNum > -1 && belowPageNum < pages.length && (
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

        {/* Shadows - render both inner and outer shadows */}
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
