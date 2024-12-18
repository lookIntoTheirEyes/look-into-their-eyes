"use client";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import { BookActions } from "@/lib/utils/utils";
import { IPage } from "@/lib/model/book";
import Controls from "@/components/Book/Controls/Controls";
import FlipBook from "@/components/FlipBook/ReactFlipBook/index";
import { SizeType } from "@/components/FlipBook/Settings";
import { Orientation } from "../FlipBook/Render/Render";
import { useRef } from "react";
import Page from "./Page/Page";

export interface StoryBook {
  Pages: React.JSX.Element[];
  Front?: React.JSX.Element;
  Back?: React.JSX.Element;
  toc?: {
    title: string;
    pages: IPage[];
  };
}

interface BookProps extends BookActions {
  rtl: boolean;
  book: StoryBook;
  noContentAmount: number;
  isMobile: boolean;
  children?: React.ReactNode;
}

const Book: React.FC<BookProps> = ({
  rtl,
  book,
  actions,
  noContentAmount,
  isMobile,
  children,
}) => {
  const pagesAmount = book.Pages.length + noContentAmount;
  const controlsRef = useRef<{
    setCurrPage(pageNum: number): void;
  }>(null);

  const setPageNum = (pageNum: number) => {
    controlsRef.current?.setCurrPage(pageNum);
  };

  const { pageFlipRef, flipPage, pages, setPages, initPageNum } =
    useBookNavigation({
      pagesAmount,
      isMobile,
      book,
      rtl,
      noContentAmount,
      setPageNum,
    });

  const needBlankPage = pages.length % 2 === 1;

  const addBlankPage = (pages: JSX.Element[]) => {
    const newPages = [...pages];
    const lastPage = newPages.pop() as JSX.Element;
    const blankPage = (
      <Page
        key='blank page'
        rtl={rtl}
        pageNum={pages.length}
        isMobile={isMobile}
      />
    );
    newPages.push(blankPage, lastPage);
    return newPages;
  };

  console.log("rerender");

  return (
    <div className={styles.storyContainer}>
      {children}
      <FlipBook
        ref={pageFlipRef}
        startPage={initPageNum - 1}
        width={550}
        height={720}
        size={SizeType.STRETCH}
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        rtl={rtl}
        onFlip={({ data }) => {
          const pageNum = (data || 0) + 1;

          controlsRef.current?.setCurrPage(pageNum || 1);
        }}
        onInit={({ data }) => {
          console.log("onInit");

          if (data === Orientation.LANDSCAPE && needBlankPage) {
            // setPages(addBlankPage(pages));
          }
          // console.log(
          //   "orientation on init",
          //   data === Orientation.LANDSCAPE,
          //   needBlankPage
          // );
        }}
        onChangeOrientation={({ data }) => {
          const orientation = data;
          console.log("orientation", orientation === Orientation.LANDSCAPE);
        }}
      >
        {pages}
      </FlipBook>
      <Controls
        ref={controlsRef}
        pageCount={pagesAmount}
        flipPage={flipPage}
        actions={actions}
        initPageNum={initPageNum}
      />
    </div>
  );
};

export default Book;
