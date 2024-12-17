"use client";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import { BookActions } from "@/lib/utils/utils";
import { Page } from "@/lib/model/book";
import Controls from "@/components/Book/Controls/Controls";
import TableOfContentsContainer from "@/components/Book/TableOfContents/TableOfContentsContainer";
import FlipBook from "@/components/FlipBook/ReactFlipBook/index";
import { SizeType } from "@/components/FlipBook/Settings";

interface BookProps extends BookActions {
  rtl: boolean;
  book: {
    Pages: React.JSX.Element[];
    Front?: React.JSX.Element;
    Back?: React.JSX.Element;
    toc?: {
      title: string;
      pages: Page[];
    };
  };
  noContentAmount: number;
  isMobile: boolean;
  children?: React.ReactNode;
}

const Book: React.FC<BookProps> = ({
  rtl,
  book: { Pages, Front, Back, toc },
  actions,
  noContentAmount,
  isMobile,
  children,
}) => {
  const pagesAmount = Pages.length + noContentAmount;

  const { currPage, pageFlipRef, flipPage, updatePage, goToPage } =
    useBookNavigation(pagesAmount);

  const pages = [] as React.JSX.Element[];
  if (Front) {
    pages.push(Front);
  }

  if (toc) {
    pages.push(
      <TableOfContentsContainer
        key='toc'
        noContentAmount={noContentAmount}
        rtl={rtl}
        isMobile={isMobile}
        goToPage={goToPage}
        pagesAmount={pagesAmount}
        toc={toc!}
      />
    );
  }

  if (Pages.length) {
    pages.push(...Pages);
  }

  if (Back) {
    pages.push(Back);
  }

  return (
    <div className={styles.storyContainer}>
      {children}
      <FlipBook
        ref={pageFlipRef}
        startPage={currPage - 1}
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

          updatePage(pageNum || 1);
        }}
        onInit={({ object }) => {
          const orientation = object.getOrientation();
          console.log("orientation", orientation);
        }}
      >
        {pages}
      </FlipBook>
      <Controls
        currPage={currPage}
        pageCount={pagesAmount}
        flipPage={flipPage}
        actions={actions}
      />
    </div>
  );
};

export default Book;
