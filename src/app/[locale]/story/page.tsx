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
  const t = await getTranslations("Book");

  const bookPages = getAllPages(locale);
  const rtl = locale === Language.he;
  const noContentPages = 3;

  const pagesAmount = bookPages.length + noContentPages;

  const pageNum = (i: number) =>
    (rtl ? pagesAmount - i - noContentPages : i + 1) + noContentPages - 1;

  const Pages = structuredClone(bookPages).map((content, i) => (
    <Page rtl={rtl} key={content.title} pageNum={pageNum(i)}>
      <PageContent
        cta={t("actions.pageCta")}
        details={content}
        pageNum={pageNum(i)}
        title={t("story.title")}
      />
    </Page>
  ));

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

  const Front = <PageCover details={rtl ? backDetails : frontDetails} />;
  const Back = <PageCover details={rtl ? frontDetails : backDetails} />;

  return (
    <BookContainer
      rtl={rtl}
      tableOfContentsTitle={t("story.tableOfContents")}
      Pages={Pages}
      Front={Front}
      Back={Back}
      pagesContent={bookPages}
      noContentAmount={noContentPages}
    />
  );
};

export default BookComponent;
