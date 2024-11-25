"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookLogic } from "./useBookLogic";
import Controls from "../Controls/Controls";
import { Page } from "@/lib/model/book";
import styles from "./NewBook.module.css";
import TableOfContentsContainer from "../TableOfContents/TableOfContentsContainer";

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
  const {
    currentPage,
    bookStyle,
    totalPages,
    dragX,
    handleNextPage,
    handlePrevPage,
    handleDrag,
    handleDragEnd,
    onTap,
    swipeHandlers,
    bookContainerRef,
    setCurrentPage,
    isSinglePage,
  } = useBookLogic({ pagesContent, isRtl, toc });

  const tocContainer = toc && (
    <TableOfContentsContainer
      key='toc'
      noContentAmount={2}
      rtl={isRtl}
      goToPage={(pageNum: number) => {
        return setCurrentPage(pageNum % 2 === 0 ? pageNum - 1 : pageNum);
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
    <motion.div
      onPan={handleDrag}
      onPanEnd={handleDragEnd}
      onTap={onTap}
      className={`${styles.page} ${className} `}
      key={key}
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, rotateY: 90 }}
    >
      {child}
    </motion.div>
  );

  const getPagesWithBelow = (isLastPage = false, isFirstPage = false) => {
    return (
      <>
        {getPage(
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
          getPage(
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

  const renderPages = () => {
    const isLastPage = currentPage === totalPages - 1;
    const isFirstPage = currentPage === 0;

    const isOnePageMode = isSinglePage();

    if (isOnePageMode) {
      return getPage(pages[currentPage], styles.onePage, `page-${currentPage}`);
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
        ref={swipeHandlers.ref}
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
