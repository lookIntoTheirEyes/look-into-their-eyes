"use client";

import PageFlip from "react-pageflip";
import { useBookNavigation } from "@/hooks/useNavigation";
import styles from "./Book.module.css";
import PageCover from "@/components/Book/PageCover/PageCover";
import Page from "@/components/Book/Page/Page";
import TableOfContents from "./TableOfContents/TableOfContents";
import PageContent from "./Page/PageContent/PageContent";
import Controls from "@/components/Book/Controls/Controls";
import { BookActions } from "@/lib/utils/utils";
import { Page as HeroPage, NO_CONTENT_PAGES } from "@/lib/utils/heroesService";
import DummyPage from "@/components/Book/DummyPage";

const pagesFactor = NO_CONTENT_PAGES - 1;

interface BookProps extends BookActions {
  rtl: boolean;
  book: {
    pages: HeroPage[];
    front: HeroPage;
    back: HeroPage;
    title: string;
    tocTitle: string;
  };
}

const Book: React.FC<BookProps> = ({
  rtl,
  book: { pages, front, back, title, tocTitle },
  actions,
}) => {
  const pagesAmount = pages.length + NO_CONTENT_PAGES;

  const { currPage, pageFlipRef, flipPage, updatePage, goToPage } =
    useBookNavigation(pagesAmount, rtl);

  const getPageNum = (i: number) => {
    return rtl
      ? pagesAmount - i - NO_CONTENT_PAGES + pagesFactor
      : i + NO_CONTENT_PAGES;
  };

  const renderToc = (isRender: boolean) => {
    return isRender ? (
      <Page rtl={rtl} styles={styles} pageNum={2}>
        <TableOfContents
          title={tocTitle}
          styles={styles}
          rtl={rtl}
          navigateToPage={goToPage}
          pages={pages.map((page, i) => {
            return {
              title: page.title!,
              pageNum: getPageNum(i),
            };
          })}
        />
      </Page>
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
            ? currPage < pagesFactor
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
        <PageCover styles={styles} details={front} />
        {renderToc(!rtl)}
        {pages.map((content, i) => (
          <Page
            rtl={rtl}
            styles={styles}
            key={content.title}
            pageNum={
              (rtl ? pagesAmount - i - NO_CONTENT_PAGES : i + 1) + pagesFactor
            }
          >
            <PageContent
              cta={actions.cta}
              details={content}
              pageNum={
                (rtl ? pagesAmount - i - NO_CONTENT_PAGES : i + 1) + pagesFactor
              }
              styles={styles}
              title={title}
            />
          </Page>
        ))}
        {renderToc(rtl)}
        <PageCover styles={styles} details={back} />
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
