"use client";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import { BookActions } from "@/lib/utils/utils";
import { Page } from "@/lib/model/book";
import Controls from "@/components/Book/Controls/Controls";
import DummyPage from "@/components/Book/DummyPage";
import TableOfContentsContainer from "@/components/Book/TableOfContents/TableOfContentsContainer";
import FlipBook from "@/components/FlipBook/ReactFlipBook/index";
import { SizeType } from "@/components/FlipBook/Settings";

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
    useBookNavigation(pagesAmount);
  const renderToc = () => {
    return renderPage(
      !!toc,
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

  return (
    <div className={styles.storyContainer}>
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
        renderOnlyPageLengthChange
        rtl={rtl}
        onFlip={({ data }) => {
          const pageNum = (data || 0) + 1;

          updatePage(pageNum || 1);
        }}
      >
        {renderPage(!!Front, Front)}
        {renderToc()}
        {renderPage(Pages.length > 0, Pages)}
        {renderPage(!!Back, Back)}
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
