"use client";

import Controls from "../Controls/Controls";
import AnimatedPage from "./AnimatedPage/AnimatedPage";
import { FlipDirection } from "./model";

import styles from "./NewBook.module.css";
import { useBookContext } from "./Context";
import { memo, useCallback } from "react";

/**
 * Enhanced book component with loading state and optimized rendering
 */
const NewBook: React.FC = memo(() => {
  const {
    props,
    bind,
    bookRef,
    bookStyle,
    bookRect,
    isSinglePage,
    rtl: isRtl,
    currentPage,
    pagesAmount,
    text,
    animateNextPage,
    pages,
    pagesConfig,
  } = useBookContext();

  // Memoize flip functions
  const flipPage = useCallback(
    (dir: "next" | "previous") => {
      const direction =
        dir === "next" ? FlipDirection.FORWARD : FlipDirection.BACK;

      // Don't try to flip past the first or last page
      if (
        (direction === FlipDirection.BACK && currentPage === 0) ||
        (direction === FlipDirection.FORWARD && currentPage >= pagesAmount - 1)
      ) {
        return;
      }

      const idx = direction === FlipDirection.BACK ? 0 : 1;

      animateNextPage({
        idx,
        direction,
        corner:
          (direction === FlipDirection.FORWARD) === !isRtl
            ? "bottom-right"
            : "bottom-left",
        isFullAnimate: true,
      });
    },
    [animateNextPage, currentPage, isRtl, pagesAmount]
  );

  return (
    <>
      <div
        ref={bookRef}
        aria-label='Interactive book'
        role='region'
        key='book'
        style={{
          width: `${bookStyle.width}px`,
          height: `${bookStyle.height}px`,
        }}
        className={styles.book}
      >
        <>
          {props.map(({ x, y, progress, direction, corner }, i) => {
            const shouldRender =
              !i ||
              (!isSinglePage &&
                !isFirstPage(currentPage) &&
                !isLastPage(currentPage, pagesAmount));

            return (
              shouldRender && (
                <AnimatedPage
                  key={`page-${pages[currentPage + i]?.key || currentPage + i}`}
                  isSinglePage={isSinglePage}
                  isRtl={isRtl}
                  pages={pages}
                  i={i}
                  x={x}
                  y={y}
                  corner={corner}
                  direction={direction}
                  progress={progress}
                  bind={bind}
                  pageNum={currentPage + i}
                  bookRect={bookRect}
                  pagesConfig={pagesConfig}
                />
              )
            );
          })}
        </>
        )
      </div>

      <Controls
        flipPage={flipPage}
        pageCount={pagesAmount}
        currPage={currentPage + 1}
        actions={text}
      />
    </>
  );
});

// Helper functions
const isFirstPage = (page: number): boolean => page === 0;
const isLastPage = (page: number, total: number): boolean => page === total - 1;

NewBook.displayName = "NewBook";
export default NewBook;
