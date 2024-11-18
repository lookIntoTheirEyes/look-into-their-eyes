import { Language } from "@/lib/model/language";
import {
  getAllPages,
  getBackPage,
  getFrontPage,
  NO_CONTENT_PAGES,
  NO_CONTENT_PAGES_TOC,
  PAGES_FACTOR,
  PAGES_FACTOR_TOC,
} from "@/lib/utils/heroesService";
import PageCover from "./PageCover/PageCover";
import Page from "./Page/Page";
import PageContent from "./Page/PageContent/PageContent";
import PageContainer from "../PageContainer/PageContainer";
import Book from "./Book";

interface IBookProps {
  locale: Language;
  text: {
    tableOfContentsTitle: string;
    pageCta: string;
    pageTitle: string;
    next: string;
    previous: string;
  };
}

const BookContainer: React.FC<IBookProps> = ({
  locale,
  text: { tableOfContentsTitle, pageCta, pageTitle, next, previous },
}) => {
  const bookPages = getAllPages(locale);
  const noContentPages = tableOfContentsTitle
    ? NO_CONTENT_PAGES_TOC
    : NO_CONTENT_PAGES;
  const pagesFactor = tableOfContentsTitle ? PAGES_FACTOR_TOC : PAGES_FACTOR;

  const pagesAmount = bookPages.length + noContentPages;

  const rtl = locale === Language.he;

  const toc = {
    title: tableOfContentsTitle,
    pages: structuredClone(bookPages),
  };

  const pageNum = (i: number) =>
    (rtl ? pagesAmount - i - noContentPages : i + 1) + pagesFactor;

  const Front = <PageCover details={getFrontPage(locale)} />;
  const Back = <PageCover details={getBackPage(locale)} />;
  const Pages = bookPages.map((content, i) => (
    <Page rtl={rtl} key={content.title} pageNum={pageNum(i)}>
      <PageContent
        cta={pageCta}
        details={content}
        pageNum={pageNum(i)}
        title={pageTitle}
      />
    </Page>
  ));

  return (
    <PageContainer isStory>
      <Book
        book={{
          Front,
          Back,
          Pages,
          toc,
        }}
        rtl={rtl}
        actions={{
          next,
          previous,
        }}
      />
    </PageContainer>
  );
};

BookContainer.displayName = "BookContainer";
export default BookContainer;
