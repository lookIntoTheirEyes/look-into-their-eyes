"use client";

import PageFlip from "react-pageflip";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import { BookActions } from "@/lib/utils/utils";
import { Page } from "@/lib/model/book";
import Controls from "@/components/Book/Controls/Controls";
import DummyPage from "@/components/Book/DummyPage";
import TableOfContentsContainer from "@/components/Book/TableOfContents/TableOfContentsContainer";

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

  return (
    <div className={styles.storyContainer}>
      <PageFlip
        ref={pageFlipRef}
        className={""}
        style={{}}
        startPage={
          rtl
            ? currPage < noContentAmount - 1
              ? pagesAmount - 1
              : pagesAmount - currPage
            : currPage - 1
        }
        width={550}
        height={720}
        size='stretch'
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={1}
        drawShadow={false}
        flippingTime={700}
        startZIndex={30}
        swipeDistance={1}
        usePortrait
        autoSize
        showCover
        mobileScrollSupport
        clickEventForward
        useMouseEvents
        showPageCorners
        renderOnlyPageLengthChange
        disableFlipByClick={false}
        onFlip={({ data, object }) => {
          const isOnePageMode = object.render.orientation === "portrait";
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
      </PageFlip>
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
