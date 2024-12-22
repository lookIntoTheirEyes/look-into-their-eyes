import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import BookContainer from "@/components/Book/BookContainer";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import { getAllPages, getHero } from "@/lib/utils/heroesService";
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
  } catch {
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
  const t = await getTranslations("Book");

  const bookPages = getAllPages(locale);
  const rtl = locale === Language.he;
  const noContentPages = 3;

  const pageNum = (i: number) => i + noContentPages;

  const frontDetails = {
    title: t("story.front.title"),
    author: t("story.front.author"),
    description: t("story.front.description"),
    longDescription: t("story.front.longDescription"),
  };
  const backDetails = {
    title: t("story.back.title"),
    description: t("story.back.description"),
    longDescription: t("story.back.longDescription"),
  };

  const Pages = bookPages.map((pageContent, i) => (
    <Page key={`page-${i}`} rtl={rtl} pageNum={pageNum(i)}>
      <PageContent
        cta={t("common.pageCta")}
        details={pageContent}
        pageNum={pageNum(i - 1)}
        title={t("story.title")}
      />
    </Page>
  ));

  const Front = <PageCover key='front' details={frontDetails} />;
  const Back = <PageCover key='back' details={backDetails} />;

  const pagesAmount = Pages.length + noContentPages;

  const toc = {
    title: t("story.tableOfContents"),
    pages: bookPages,
  };

  return (
    <BookContainer
      rtl={rtl}
      book={{ Front, Back, Pages }}
      pagesAmount={pagesAmount}
      toc={toc}
    />
  );
};

export default BookComponent;
