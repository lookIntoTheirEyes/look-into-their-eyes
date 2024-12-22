"use client";

import Controls from "../Controls/Controls";
import AnimatedPage from "./AnimatedPage/AnimatedPage";
import { FlipDirection } from "./model";

import styles from "./NewBook.module.css";
import { useBookContext } from "./Context";

const NewBook: React.FC = () => {
  const {
    props,
    bind,
    bookRef,
    bookStyle,
    bookRect,
    isSinglePage,
    rtl: isRtl,
    currentPage,
    isFirstPage,
    isLastPage,
    pagesAmount,
    text,
    animateNextPage,
    pages,
  } = useBookContext();

  return (
    <>
      <div
        ref={bookRef}
        key='book'
        style={{
          width: `${bookStyle.width}px`,
          height: `${bookStyle.height}px`,
        }}
        className={styles.book}
      >
        {props.map(({ x, y, progress, direction, corner }, i) => {
          const shouldRender =
            !i || (!isSinglePage && !isFirstPage && !isLastPage);

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

          animateNextPage({
            idx,
            direction,
            corner:
              (direction === FlipDirection.FORWARD) === !isRtl
                ? "top-right"
                : "top-left",
            isFullAnimate: true,
          });
        }}
        pageCount={pagesAmount}
        currPage={currentPage + 1}
        actions={text}
      />
    </>
  );
};

export default NewBook;
