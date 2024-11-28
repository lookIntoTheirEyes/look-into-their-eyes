"use client";
import { useEffect, useState } from "react";
import { BookStyle } from "../useBookStyle";
import AnimatedPage from "./AnimatedPage";
import styles from "./AnimatedPages.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { animated, SpringValue, to } from "react-spring";
import { log } from "console";

interface AnimatedPagesProps {
  bookStyle: BookStyle;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  isRtl: boolean;
  isSinglePage: boolean;
  pages: React.ReactNode[];
  currentPage: number;
  totalPages: number;
}

const AnimatedPages: React.FC<AnimatedPagesProps> = ({
  bookStyle,
  handleNextPage,
  handlePrevPage,
  isRtl,
  pages,
  currentPage,
  isSinglePage,
  totalPages,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    setScrollPosition(() => window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getAnimatedPage = (pageNum: number) => {
    const isFirstPage = pageNum === 0;
    const isLastPage = pageNum === totalPages - 1;
    const isLeftPage = getIsLeftPage(pageNum, isRtl);

    const className = getAnimatedClassName(isSinglePage, isLeftPage);
    const belowPageNum = getHiddenPageNum(
      pageNum,
      isSinglePage,
      isLeftPage,
      isRtl
    );
    const backPageNum = getHiddenPageNum(
      pageNum,
      isSinglePage,
      isLeftPage,
      isRtl,
      true
    );

    return (
      <>
        <animated.div className={`${styles.front}  ${className}`}>
          <AnimatedPage
            key={`page-${pageNum}`}
            bookStyle={bookStyle}
            handleNextPage={handleNextPage}
            handlePrevPage={handlePrevPage}
            isRtl={isRtl}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
            scrollPosition={scrollPosition}
            className={`${styles.page} ${className} `}
          >
            {pages[pageNum]}
          </AnimatedPage>
          {getBackPage(backPageNum, isLeftPage)}
        </animated.div>
        {belowPageNum > 0 &&
          belowPageNum < totalPages - 1 &&
          getBelowPage(belowPageNum, isLeftPage, isSinglePage)}
      </>
    );
  };

  const getPage = (child: React.ReactNode, className: string, key: string) => (
    <motion.div className={`${styles.page} ${className} `} key={key}>
      {child}
    </motion.div>
  );

  const getBackPage = (pageNum: number, isLeftPage: boolean) => {
    return getPage(
      pages[pageNum],
      `${isLeftPage ? "" : styles.right} ${styles.back}`,
      `page-${pageNum}`
    );
  };

  const getBelowPage = (
    pageNum: number,
    isLeftPage: boolean,
    isSinglePage: boolean
  ) => {
    return getPage(
      pages[pageNum],
      `${isLeftPage ? "" : styles.right} ${styles.below} ${
        isSinglePage ? styles.onePage : ""
      }`,
      `page-${pageNum}`
    );
  };

  const renderPages = () => {
    const isLastPage = currentPage === totalPages - 1;
    const isFirstPage = currentPage === 0;

    if (isSinglePage) {
      return getAnimatedPage(currentPage);
    }

    return (
      <>
        {getAnimatedPage(currentPage)}
        {!isFirstPage && !isLastPage && getAnimatedPage(currentPage + 1)}
      </>
    );
  };

  return <AnimatePresence>{renderPages()}</AnimatePresence>;
};

export default AnimatedPages;

function getAnimatedClassName(isOnePage: boolean, isLeftPage: boolean) {
  if (isOnePage) {
    return styles.onePage;
  }

  return isLeftPage ? "" : styles.right;
}

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
