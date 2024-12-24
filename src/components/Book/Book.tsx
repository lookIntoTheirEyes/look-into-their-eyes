"use client";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import { BookActions } from "@/lib/utils/utils";
import { IPage } from "@/lib/model/book";
import Controls from "@/components/Book/Controls/Controls";
import FlipBook from "@/components/FlipBook/ReactFlipBook/index";
import { SizeType } from "@/components/FlipBook/Settings";
import { useCallback, useRef, useState } from "react";
import { WidgetEvent } from "../FlipBook/Event/EventObject";
import { PageFlip } from "../FlipBook/PageFlip";

export interface StoryBook {
  Pages: React.JSX.Element[];
  Front: React.JSX.Element;
  Back?: React.JSX.Element;
  blankPage?: React.JSX.Element;
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
  const [pagesAmount, setPagesAmount] = useState(
    book.Pages.length + noContentAmount
  );

  const controlsRef = useRef<{
    setCurrPage(pageNum: number): void;
  }>(null);

  const setPageNum = (pageNum: number) => {
    controlsRef.current?.setCurrPage(pageNum);
  };

  const { pageFlipRef, flipPage, pages, initPageNum } = useBookNavigation({
    pagesAmount,
    isMobile,
    book,
    rtl,
    noContentAmount,
    setPageNum,
  });

  const controls = (
    <Controls
      ref={controlsRef}
      pageCount={pagesAmount}
      flipPage={flipPage}
      actions={actions}
      initPageNum={initPageNum}
    />
  );
  const handleFlip = useCallback(({ data }: WidgetEvent) => {
    const pageNum = (data || 0) + 1;

    controlsRef.current?.setCurrPage(pageNum || 1);
  }, []);

  const updatePageCount = (object: PageFlip) => {
    const num = object.getPageCount();
    setPagesAmount(num);
  };

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
        onFlip={handleFlip}
        controls={controls}
        blankPage={book.blankPage}
        onInit={({ object }) => {
          updatePageCount(object);
        }}
        onChangeOrientation={({ object }) => {
          updatePageCount(object);
        }}
      >
        {pages}
      </FlipBook>
    </div>
  );
};

export default Book;
