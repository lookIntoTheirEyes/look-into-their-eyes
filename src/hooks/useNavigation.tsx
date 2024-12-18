"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PageFlip } from "@/components/FlipBook/PageFlip";
import TableOfContentsContainer from "@/components/Book/TableOfContents/TableOfContentsContainer";
import { StoryBook } from "@/components/Book/Book";

interface CustomPageFlip {
  pageFlip: () => PageFlip | null;
}

export const useBookNavigation = ({
  pagesAmount,
  book,
  rtl,
  isMobile,
  noContentAmount,
  setPageNum,
}: {
  pagesAmount: number;
  book: StoryBook;
  rtl: boolean;
  isMobile: boolean;
  noContentAmount: number;
  setPageNum: (pageNum: number) => void;
}) => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const searchParams = useSearchParams();

  const queryParamPage = +(searchParams.get("page") || 1);
  const initPageNum =
    queryParamPage <= 0 || queryParamPage > pagesAmount ? 1 : queryParamPage;

  const goToPage = useCallback(
    (pageNum: number) => {
      const adjustedPageNum = pageNum - 1;
      pageFlipRef.current?.pageFlip()?.flip(adjustedPageNum);
      setPageNum(adjustedPageNum);
    },
    [setPageNum]
  );

  const [pages, setPages] = useState(
    getPages(
      book,
      book.toc ? (
        <TableOfContentsContainer
          key='toc'
          noContentAmount={noContentAmount}
          rtl={rtl}
          isMobile={isMobile}
          goToPage={goToPage}
          pagesAmount={pagesAmount}
          toc={book.toc}
        />
      ) : undefined
    )
  );

  const flipPage = (direction: "next" | "previous") => {
    const flipDirection = direction === "next" ? "flipNext" : "flipPrev";

    pageFlipRef.current?.pageFlip()?.[flipDirection]();
  };

  useEffect(() => {
    const pageFlip = pageFlipRef.current?.pageFlip();
    return () => {
      if (pageFlip) {
        pageFlip.destroy();
      }
    };
  }, []);

  return {
    initPageNum,
    pageFlipRef,
    flipPage,
    goToPage,
    setPages,
    pages,
  };
};

function getPages({ Front, Back, Pages }: StoryBook, toc?: JSX.Element) {
  const renderPages = [] as React.JSX.Element[];

  if (Front) {
    renderPages.push(Front);
  }

  if (toc) {
    renderPages.push(toc);
  }

  if (renderPages.length) {
    renderPages.push(...Pages);
  }

  if (Back) {
    renderPages.push(Back);
  }

  return renderPages;
}
