import { useState, useEffect } from "react";

import TableOfContentsContainer from "../../TableOfContents/TableOfContentsContainer";
import { Corner, FlipDirection } from "../model";

import { IBook, IPage } from "@/lib/model/book";

interface UseBookLayoutParams {
  book: IBook;
  toc?: {
    title: string;
    pages: IPage[];
  };

  isRtl: boolean;
  animateNextPage: (params: {
    idx: number;
    direction: FlipDirection;
    corner: Corner;
    isFullAnimate?: boolean;
    nextPageNum?: number;
  }) => void;
}

export const useBookLayout = ({
  book,
  toc,
  isRtl,
  animateNextPage,
}: UseBookLayoutParams) => {
  const [pages, setPages] = useState([] as JSX.Element[]);

  useEffect(() => {
    if (pages.length) return;

    const tocContainer = toc && (
      <TableOfContentsContainer
        key='toc'
        noContentAmount={2}
        rtl={isRtl}
        goToPage={(pageNum: number) => {
          console.log("pageNum", pageNum);
          if (pageNum < 3) {
            return;
          }

          animateNextPage({
            nextPageNum: pageNum % 2 === 0 ? pageNum - 1 : pageNum,
            corner: isRtl ? "top-left" : "top-right",
            direction: FlipDirection.FORWARD,
            idx: 1,
            isFullAnimate: true,
          });
        }}
        toc={toc}
      />
    );
    console.log("setting pages");

    setPages(getPages(book, tocContainer));
  }, [pages.length, book, isRtl, animateNextPage, toc]);

  return {
    pages,
  };
};

function getPages({ Front, Back, Pages }: IBook, toc?: React.ReactElement) {
  const renderPages = [] as React.ReactElement[];

  if (Front) {
    renderPages.push(Front);
  }

  if (toc) {
    renderPages.push(toc);
  }

  if (Pages.length) {
    renderPages.push(...Pages);
  }

  if (Back) {
    renderPages.push(Back);
  }

  return renderPages;
}
