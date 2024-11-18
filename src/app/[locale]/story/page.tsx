import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import BookContainer from "@/components/Book/BookContainer";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import {
  getAllPages,
  getBackPage,
  getFrontPage,
  getHero,
  NO_CONTENT_PAGES_TOC,
  PAGES_FACTOR_TOC,
} from "@/lib/utils/heroesService";
import Page from "@/components/Book/Page/Page";
import PageContent from "@/components/Book/Page/PageContent/PageContent";
import PageCover from "@/components/Book/PageCover/PageCover";

interface IProps extends ILanguageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: IProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale } = params;
  const pageNum = getPageNum(searchParams);
  try {
    const { name: title, description } = await getHero(pageNum, locale);

    return {
      title,
      description,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    const t = await getTranslations("Metadata");

    const title = t("layout.title");
    const description = t("layout.description");

    return {
      title,
      description,
    };
  }
}

const BookComponent: React.FC<IProps> = async (props) => {
  const { locale } = await props.params;
  const t = await getTranslations("Story");

  const bookPages = getAllPages(locale);
  const rtl = locale === Language.he;

  const pagesAmount = bookPages.length + NO_CONTENT_PAGES_TOC;

  const pageNum = (i: number) =>
    (rtl ? pagesAmount - i - NO_CONTENT_PAGES_TOC : i + 1) + PAGES_FACTOR_TOC;

  const Pages = structuredClone(bookPages).map((content, i) => (
    <Page rtl={rtl} key={content.title} pageNum={pageNum(i)}>
      <PageContent
        cta={t("actions.pageCta")}
        details={content}
        pageNum={pageNum(i)}
        title={t("title")}
      />
    </Page>
  ));

  const Front = <PageCover details={getFrontPage(locale)} />;
  const Back = <PageCover details={getBackPage(locale)} />;

  return (
    <BookContainer
      rtl={rtl}
      text={{
        tableOfContentsTitle: t("tableOfContents"),
        next: t("actions.next"),
        previous: t("actions.previous"),
      }}
      Pages={Pages}
      Front={Front}
      Back={Back}
      pagesContent={bookPages}
    />
  );
};

export default BookComponent;
