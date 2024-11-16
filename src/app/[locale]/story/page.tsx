import { Language } from "@/lib/model/language";
import Book from "@/components/Book/Book";
import PageContainer from "@/components/PageContainer/PageContainer";
import {
  getAllPages,
  getBackPage,
  getFrontPage,
  NO_CONTENT_PAGES,
} from "@/lib/utils/heroesService";
import { getTranslations } from "next-intl/server";
import PageCover from "@/components/Book/PageCover/PageCover";
import Page from "@/components/Book/Page/Page";
import PageContent from "@/components/Book/Page/PageContent/PageContent";

interface Props {
  params: Promise<Params>;
}

type Params = {
  locale: Language;
};

const pagesFactor = NO_CONTENT_PAGES - 1;

const BookComponent: React.FC<Props> = async (props) => {
  const { locale } = await props.params;
  const bookPages = getAllPages(locale);
  const pagesAmount = bookPages.length + NO_CONTENT_PAGES;

  const t = await getTranslations("Story");
  const rtl = locale === Language.he;

  const toc = {
    title: t("tableOfContents"),
    pages: structuredClone(bookPages),
  };

  const Front = <PageCover details={getFrontPage(locale)} />;
  const Back = <PageCover details={getBackPage(locale)} />;
  const Pages = bookPages.map((content, i) => (
    <Page
      rtl={rtl}
      key={content.title}
      pageNum={(rtl ? pagesAmount - i - NO_CONTENT_PAGES : i + 1) + pagesFactor}
    >
      <PageContent
        cta={t("actions.pageCta")}
        details={content}
        pageNum={
          (rtl ? pagesAmount - i - NO_CONTENT_PAGES : i + 1) + pagesFactor
        }
        title={t("title")}
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
          next: t("actions.next"),
          previous: t("actions.previous"),
        }}
      />
    </PageContainer>
  );
};

export default BookComponent;
