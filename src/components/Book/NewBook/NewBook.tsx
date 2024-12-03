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
  const isLastPage = currentPage === totalPages;

  const { props, bind } = usePageFlip({
    isRtl,
    onNextPage: handleNextPage,
    onPrevPage: handlePrevPage,
    bookRef,
    isFirstPage,
    isLastPage,
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
        {props.map(({ x, y, r, angle, progress }, i) => {
          const shouldRender = !i || (!isFirstPage && !isLastPage);

          return (
            shouldRender && (
              <AnimatedPage
                key={`page-${currentPage + i}`}
                isFirst={isFirstPage}
                isLast={isLastPage}
                isSinglePage={isSinglePage}
                isRtl={isRtl}
                pages={pages}
                i={i}
                x={x}
                y={y}
                r={r}
                // direction={direction}
                angle={angle}
                progress={progress}
                bind={bind}
                pageNum={currentPage + i}
                pageWidth={bookStyle.width / 2}
              />
            )
          );
        })}
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
