"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookLogic } from "./useBookLogic";
import Controls from "../Controls/Controls";
import { Page } from "@/lib/model/book";
import styles from "./NewBook.module.css";
import TableOfContentsContainer from "../TableOfContents/TableOfContentsContainer";
import { useBookStyle } from "./useBookStyle";
import AnimatedPage from "./AnimatedPage";

interface BookProps {
  pagesContent: React.ReactNode[];
  text: {
    next: string;
    previous: string;
  };
  isRtl: boolean;
  toc?: {
    title: string;
    pages: Page[];
  };
}

const NewBook: React.FC<BookProps> = ({ pagesContent, isRtl, text, toc }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { bookContainerRef, bookStyle, isSinglePage } = useBookStyle();

  const {
    currentPage,
    handleNextPage,
    handlePrevPage,
    setCurrentPage,
    totalPages,
  } = useBookLogic({ pagesContent, toc, isSinglePage });

  const tocContainer = toc && (
    <TableOfContentsContainer
      key='toc'
      noContentAmount={2}
      rtl={isRtl}
      goToPage={(pageNum: number) => {
        return setCurrentPage((pageNum % 2 === 0 ? pageNum - 1 : pageNum) - 1);
      }}
      toc={toc}
    />
  );
  const pages = toc
    ? [
        pagesContent[0],
        tocContainer as React.ReactNode,
        ...pagesContent.slice(1),
      ]
    : pagesContent;

  const getPage = (child: React.ReactNode, className: string, key: string) => (
    <motion.div className={`${styles.page} ${className} `} key={key}>
      {child}
    </motion.div>
  );

  const getAnimatedPage = (
    child: React.ReactNode,
    className: string,
    key: string
  ) => (
    <AnimatedPage
      key={key}
      bookStyle={bookStyle}
      handleNextPage={handleNextPage}
      handlePrevPage={handlePrevPage}
      isRtl={isRtl}
      isFirstPage={false}
      isLastPage={false}
      scrollPosition={scrollPosition}
      className={`${styles.page} ${className} `}
    >
      {child}
    </AnimatedPage>
  );

  const getPagesWithBelow = (isLastPage = false, isFirstPage = false) => {
    return (
      <>
        {getAnimatedPage(
          pages[currentPage],
          isRtl
            ? isFirstPage
              ? ""
              : styles.right
            : isFirstPage
            ? styles.right
            : "",
          `page-${currentPage}`
        )}

        {!isFirstPage &&
          getPage(
            pages[currentPage - 1],
            `${isRtl ? "" : styles.right} ${styles.backOfFront}`,
            `page-${currentPage - 1}`
          )}

        {!isFirstPage &&
          getPage(
            pages[currentPage - 2],
            `${isRtl ? "" : styles.right} ${styles.back}`,
            `page-${currentPage - 2}`
          )}
        {!isLastPage &&
          getAnimatedPage(
            pages[currentPage + 1],
            `${isRtl ? "" : styles.right} ${
              isFirstPage ? styles.backOfFront : ""
            }`,
            `page-${currentPage + 1}`
          )}
        {!isLastPage &&
          getPage(
            pages[currentPage + 2],
            `${!isRtl ? "" : styles.right} ${styles.back}`,
            `page-${currentPage + 2}`
          )}

        {!isLastPage &&
          !isFirstPage &&
          getPage(
            pages[currentPage + 3],
            `${isRtl ? "" : styles.right} ${styles.back}`,
            `page-${currentPage + 3}`
          )}
      </>
    );
  };

  const handleScroll = () => {
    setScrollPosition(() => window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const renderPages = () => {
    const isLastPage = currentPage === totalPages - 1;
    const isFirstPage = currentPage === 0;

    if (isSinglePage) {
      return getAnimatedPage(
        pages[currentPage],
        styles.onePage,
        `page-${currentPage}`
      );
    }

    return getPagesWithBelow(isLastPage, isFirstPage);
  };

  return (
    <div ref={bookContainerRef} className={styles.bookContainer}>
      <div
        style={{
          width: `${bookStyle.width}px`,
          height: `${bookStyle.height}px`,
        }}
        className={styles.book}
      >
        <AnimatePresence>{renderPages()}</AnimatePresence>
      </div>
      <Controls
        flipPage={(dir) =>
          dir === "next" ? handleNextPage() : handlePrevPage()
        }
        pageCount={totalPages}
        currPage={currentPage + 1}
        actions={text}
      />
    </div>
  );
};

export default NewBook;
