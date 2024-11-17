"use client";

import PageFlip from "react-pageflip";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import Controls from "@/components/Book/Controls/Controls";
import { BookActions } from "@/lib/utils/utils";
import {
  Page,
  NO_CONTENT_PAGES,
  PAGES_FACTOR,
} from "@/lib/utils/heroesService";
import DummyPage from "@/components/Book/DummyPage";
import TableOfContentsContainer from "./TableOfContents/TableOfContentsContainer";

interface BookProps extends BookActions {
  rtl: boolean;
  book: {
    Pages: JSX.Element[];
    Front: JSX.Element;
    Back: JSX.Element;
    toc?: {
      title: string;
      pages: Page[];
    };
  };
}

const Book: React.FC<BookProps> = ({
  rtl,
  book: { Pages, Front, Back, toc },
  actions,
}) => {
  const pagesAmount = Pages.length + NO_CONTENT_PAGES;

  const { currPage, pageFlipRef, flipPage, updatePage, goToPage } =
    useBookNavigation(pagesAmount, rtl);

  const renderToc = (isRender: boolean) => {
    return toc && isRender ? (
      <TableOfContentsContainer
        rtl={rtl}
        goToPage={goToPage}
        pagesAmount={pagesAmount}
        toc={toc}
      />
    ) : (
      <DummyPage />
    );
  };

  return (
    <div className={styles.storyContainer}>
      <PageFlip
        ref={pageFlipRef}
        className={""}
        style={{}}
        startPage={
          rtl
            ? currPage < PAGES_FACTOR
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
        {Front}
        {renderToc(!rtl)}
        {Pages}
        {renderToc(rtl)}
        {Back}
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
