"use client";

import { createContext, useContext, ReactNode, useRef } from "react";
import { SpringValue } from "@react-spring/web";
import { IBook, IToc } from "@/lib/model/book";
import { BookStyle, useBookStyle } from "./hooks/useBookStyle";
import { useBookLayout } from "./hooks/useBookLayout";
import { useBookLogic } from "./hooks/useBookLogic";
import { usePageFlip } from "./hooks/usePageFlip";
import { Corner, FlipDirection } from "./model";

import styles from "./NewBook.module.css";

interface BookProviderProps {
  children: ReactNode;
  bookParams: {
    rtl: boolean;
    pagesAmount: number;
    book: IBook;
    toc?: IToc;
    text: {
      next: string;
      previous: string;
    };
    isMobile: boolean;
  };
}

interface PageProps {
  x: SpringValue<number>;
  y: SpringValue<number>;
  progress: SpringValue<number>;
  direction: SpringValue<FlipDirection>;
  corner: SpringValue<Corner>;
}

interface BookContextState {
  props: PageProps[];
  bind: ReturnType<typeof usePageFlip>["bind"];

  bookRef: React.RefObject<HTMLDivElement>;
  bookContainerRef: React.RefObject<HTMLDivElement>;
  rtl: boolean;
  pagesAmount: number;
  book: IBook;
  toc?: IToc;
  text: {
    next: string;
    previous: string;
  };
  bookStyle: BookStyle;
  bookRect: BookStyle & { pageWidth: number };
  isSinglePage: boolean;
  currentPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  pages: JSX.Element[];
  pagesConfig: {
    mainPageNum: number;
    backPageNum: number;
    belowPageNum: number;
  };
  setCurrentPage: (pageNum: number) => void;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  animateNextPage: (params: {
    idx: number;
    direction: FlipDirection;
    corner: Corner;
    isFullAnimate?: boolean;
    nextPageNum?: number;
  }) => void;
}

const BookContext = createContext<BookContextState | null>(null);

export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBookContext must be used within BookProvider");
  }
  return context;
};

export const BookProvider = ({ children, bookParams }: BookProviderProps) => {
  const bookRef = useRef<HTMLDivElement>(null);

  const { bookStyle, isSinglePage, bookContainerRef } = useBookStyle();
  const bookRect = {
    ...bookStyle,
    pageWidth: bookStyle.width / (isSinglePage ? 1 : 2),
  };

  const { currentPage, setCurrentPage, handleNextPage, handlePrevPage } =
    useBookLogic({ isSinglePage, pagesAmount: bookParams.pagesAmount });

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === bookParams.pagesAmount - 1;

  const { props, bind, animateNextPage, pagesConfig } = usePageFlip({
    isRtl: bookParams.rtl,
    onNextPage: handleNextPage,
    onPrevPage: handlePrevPage,
    bookRef,
    currentPage,
    pagesAmount: bookParams.pagesAmount,
    bookRect,
    setCurrentPage,
    isSinglePage,
  });

  const { pages } = useBookLayout({
    book: bookParams.book,
    toc: bookParams.toc,
    isRtl: bookParams.rtl,
    animateNextPage,
    isMobile: bookParams.isMobile,
  });

  return (
    <BookContext.Provider
      value={{
        props,
        bind,
        bookRef,
        bookContainerRef,
        ...bookParams,
        bookStyle,
        bookRect,
        isSinglePage,
        currentPage,
        isFirstPage,
        isLastPage,
        setCurrentPage,
        handleNextPage,
        handlePrevPage,
        animateNextPage,
        pages,
        pagesConfig,
      }}
    >
      <div ref={bookContainerRef} className={styles.bookContainer}>
        {children}
      </div>
    </BookContext.Provider>
  );
};
