"use client";

import { useBookLogic } from "./useBookLogic";
import Controls from "../Controls/Controls";
import { Page } from "@/lib/model/book";
import styles from "./NewBook.module.css";
import TableOfContentsContainer from "../TableOfContents/TableOfContentsContainer";
import { useBookStyle } from "./useBookStyle";

import AnimatedPages from "./AnimatedPages/AnimatedPages";

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

  return (
    <div ref={bookContainerRef} className={styles.bookContainer}>
      <div
        style={{
          width: `${bookStyle.width}px`,
          height: `${bookStyle.height}px`,
        }}
        className={styles.book}
      >
        <AnimatedPages
          currentPage={currentPage}
          pages={pages}
          bookStyle={bookStyle}
          handleNextPage={handleNextPage}
          handlePrevPage={handlePrevPage}
          isRtl={isRtl}
          isSinglePage={isSinglePage}
          totalPages={totalPages}
        />
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
