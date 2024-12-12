"use client";

import { useRef } from "react";
import { CoverPage, Page as BookPage } from "@/lib/model/book";
import { useBookStyle } from "./hooks/useBookStyle";
import { useBookLogic } from "./hooks/useBookLogic";
import { usePageFlip } from "./hooks/usePageFlip";
import { useBookLayout } from "./hooks/useBookLayout";
import Controls from "../Controls/Controls";
import AnimatedPage from "./AnimatedPage/AnimatedPage";

import styles from "./NewBook.module.css";
import { FlipDirection } from "./model";

interface BookProps {
  text: {
    next: string;
    previous: string;
  };
  isRtl: boolean;
  toc?: {
    title: string;
    pages: BookPage[];
  };
  bookPages: BookPage[];
  storyTitle: string;
  pageCta: string;
  backDetails: CoverPage;
  frontDetails: CoverPage;
  noContentPages: number;
}

const NewBook: React.FC<BookProps> = ({
  bookPages,
  toc,
  storyTitle,
  pageCta,
  backDetails,
  frontDetails,
  noContentPages,
  isRtl,
  text,
}) => {
  const bookRef = useRef<HTMLDivElement>(null);

  const { bookStyle, bookContainerRef, isSinglePage } = useBookStyle();

  const {
    totalPages,
    currentPage,
    setCurrentPage,
    handleNextPage,
    handlePrevPage,
  } = useBookLogic({ noContentPages, isSinglePage, pagesContent: bookPages });

  const { pages } = useBookLayout({
    bookPages,
    toc,
    noContentPages,
    storyTitle,
    pageCta,
    backDetails,
    frontDetails,
    isRtl,
    setCurrentPage,
  });

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  const { props, bind, animateNextPage } = usePageFlip({
    isRtl,
    onNextPage: handleNextPage,
    onPrevPage: handlePrevPage,
    bookRef,
    currentPage,
    isSinglePage,
    totalPages,
  });

  return (
    <div ref={bookContainerRef} className={styles.bookContainer}>
      <div
        ref={bookRef}
        key='book'
        style={{
          width: `${bookStyle.width}px`,
          height: `${bookStyle.height}px`,
        }}
        className={styles.book}
      >
        {props.map(({ x, y, r, progress, direction, corner, calc }, i) => {
          const shouldRender =
            !i || (!isSinglePage && !isFirstPage && !isLastPage);

          return (
            shouldRender && (
              <AnimatedPage
                key={`page-${currentPage + i}`}
                isSinglePage={isSinglePage}
                isRtl={isRtl}
                pages={pages}
                i={i}
                x={x}
                y={y}
                corner={corner}
                calc={calc}
                // r={r}
                direction={direction}
                progress={progress}
                bind={bind}
                pageNum={currentPage + i}
                pageWidth={bookStyle.width / (isSinglePage ? 1 : 2)}
                bookRef={bookRef}
              />
            )
          );
        })}
      </div>
      <Controls
        flipPage={(dir) => {
          const direction =
            dir === "next" ? FlipDirection.FORWARD : FlipDirection.BACK;
          const idx =
            isFirstPage || isLastPage
              ? 0
              : direction === FlipDirection.BACK
              ? 0
              : 1;

          animateNextPage(
            idx,
            direction,
            (direction === FlipDirection.FORWARD) === !isRtl
              ? "top-right"
              : "top-left"
          );
        }}
        pageCount={totalPages}
        currPage={currentPage + 1}
        actions={text}
      />
    </div>
  );
};

export default NewBook;
