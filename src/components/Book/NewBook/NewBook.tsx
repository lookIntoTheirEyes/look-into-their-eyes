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
      goToPage={(pageNum: number) =>
        setCurrentPage(pageNum % 2 === 0 ? pageNum - 1 : pageNum)
      }
      pagesAmount={totalPages}
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

  const renderPages = () => {
    const isOnePageMode =
      isSinglePage() || currentPage === 0 || currentPage === totalPages - 1;

    if (isOnePageMode) {
      return (
        <motion.div
          className={`${styles.page} ${isSinglePage() ? styles.onePage : ""}`}
          key={`page-${currentPage}`}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
        >
          {pages[currentPage]}
        </motion.div>
      );
    }

    return (
      <>
        <motion.div
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          className={styles.page}
          key={`page-${currentPage}`}
        >
          {pages[currentPage]}
        </motion.div>
        {currentPage + 1 < totalPages && (
          <motion.div
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            className={`${styles.page} ${styles.right}`}
            key={`page-${currentPage + 1}`}
          >
            {pages[currentPage + 1]}
          </motion.div>
        )}
      </>
    );
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
