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
    pagesWithToc,
    totalPages,
    dragX,
    handleNextPage,
    handlePrevPage,
    handleDrag,
    handleDragEnd,
    swipeHandlers,
    bookContainerRef,
    bookRef,
    setCurrentPage,
    isSinglePage,
  } = useBookLogic({ pagesContent, isRtl, toc });

  const renderPageContent = (pageIndex: number) => {
    if (toc && pageIndex === 1) {
      return (
        <TableOfContentsContainer
          noContentAmount={2}
          rtl={isRtl}
          goToPage={(pageNum: number) => setCurrentPage(pageNum)}
          pagesAmount={totalPages}
          toc={toc}
        />
      );
    }

    const pageContent = pagesWithToc[pageIndex];
    if (React.isValidElement(pageContent) || typeof pageContent === "string") {
      return pageContent;
    }

    return null;
  };

  console.log("isSinglePage", isSinglePage(), currentPage, totalPages);

  const renderPages = () => {
    if (isSinglePage() || currentPage === 0 || currentPage === totalPages - 1) {
      return (
        <motion.div
          className={`${styles.page} ${isSinglePage() ? styles.onePage : ""}`}
          key={`page-${currentPage}`}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
        >
          {renderPageContent(currentPage)}
        </motion.div>
      );
    }

    return (
      <>
        <motion.div className={styles.page} key={`page-${currentPage}`}>
          {renderPageContent(currentPage)}
        </motion.div>
        {currentPage + 1 < totalPages && (
          <motion.div
            className={`${styles.page} ${styles.right}`}
            key={`page-${currentPage + 1}`}
          >
            {renderPageContent(currentPage + 1)}
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
