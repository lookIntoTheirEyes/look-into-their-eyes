"use client";
import { useEffect, useState } from "react";
import { BookStyle } from "../useBookStyle";
import styles from "./AnimatedPages.module.css";
import Pages from "./Pages";

interface PageParams {
  className: string;
  key: string;
  view: React.ReactNode;
}

export interface PageData {
  main: PageParams;
  back: PageParams;
  below?: PageParams;
}

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
  console.log("currentPage", currentPage);

  const isLastPage = currentPage === totalPages - 1;
  const isFirstPage = currentPage === 0;
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

  const getPageData = (
    pageNum: number
  ): {
    main: PageParams;
    back: PageParams;
    below?: PageParams;
  } => {
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

    const below =
      belowPageNum > 0 && belowPageNum < totalPages - 1
        ? {
            className: `${styles.page} ${isLeftPage ? "" : styles.right} ${
              styles.below
            } ${isSinglePage ? styles.onePage : ""}`,
            key: `page-${belowPageNum}`,
            view: pages[belowPageNum],
          }
        : undefined;

    return {
      main: {
        className: `${styles.page} ${className}`,
        key: `page-${pageNum}`,
        view: pages[pageNum],
      },
      back: {
        className: `${styles.page}  ${isLeftPage ? "" : styles.right} ${
          styles.back
        }`,
        key: `page-${backPageNum}`,
        view: pages[backPageNum],
      },
      ...(below && { below }),
    };
  };

  const props = {
    bookStyle,
    handleNextPage,
    handlePrevPage,
    isRtl,
    totalPages,
    currentPage,
  };

  return (
    <>
      <Pages Pages={getPageData(currentPage)} {...props} />
      {!isFirstPage && !isLastPage && (
        <Pages Pages={getPageData(currentPage + 1)} {...props} />
      )}
    </>
  );
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
