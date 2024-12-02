"use client";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import { BookActions } from "@/lib/utils/utils";
import { Page } from "@/lib/model/book";
import Controls from "@/components/Book/Controls/Controls";
import DummyPage from "@/components/Book/DummyPage";
import TableOfContentsContainer from "@/components/Book/TableOfContents/TableOfContentsContainer";
import { HTMLFlipBook } from "../flip/html-flip-book/index";
import { SizeType } from "../flip/Settings";

interface BookProps extends BookActions {
  rtl: boolean;
  book: {
    Pages: JSX.Element[];
    Front?: JSX.Element;
    Back?: JSX.Element;
    toc?: {
      title: string;
      pages: Page[];
    };
  };
  noContentAmount: number;
}

const Book: React.FC<BookProps> = ({
  rtl,
  book: { Pages, Front, Back, toc },
  actions,
  noContentAmount,
}) => {
  const pagesAmount = Pages.length + noContentAmount;

  const { currPage, pageFlipRef, flipPage, updatePage, goToPage } =
    useBookNavigation(pagesAmount, rtl);
  const renderToc = (isRender: boolean) => {
    return renderPage(
      !!toc && isRender,
      <TableOfContentsContainer
        noContentAmount={noContentAmount}
        rtl={rtl}
        goToPage={goToPage}
        pagesAmount={pagesAmount}
        toc={toc!}
      />
    );
  };

  const renderPage = <T extends React.ReactNode>(
    condition: boolean,
    page: T
  ): T | React.ReactNode => {
    return condition ? page : <DummyPage />;
  };

  console.log("pageFlipRef", pageFlipRef.current);
  return (
    <div className={styles.storyContainer}>
      <HTMLFlipBook
        ref={pageFlipRef}
        startPage={
          rtl
            ? currPage < noContentAmount - 1
              ? pagesAmount - 1
              : pagesAmount - currPage
            : currPage - 1
        }
        width={550}
        height={720}
        size={SizeType.STRETCH}
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        onFlip={({ data, object }) => {
          const isOnePageMode = object.getOrientation() === "portrait";
          const pageNum = rtl
            ? !data
              ? pagesAmount
              : pagesAmount - data - (isOnePageMode ? 0 : 1)
            : data + 1;

          updatePage(pageNum || 1);
        }}
      >
        {renderPage(!!Front, Front)}
        {renderToc(!rtl)}
        {renderPage(Pages.length > 0, Pages)}
        {renderToc(rtl)}
        {renderPage(!!Back, Back)}
      </HTMLFlipBook>
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
