import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import BookContainer from "@/components/Book/BookContainer";
import { SearchParams } from "@/lib/utils/utils";
import { getAllPages } from "@/lib/utils/heroesService";
import Page from "@/components/Book/Page/Page";
import PageContent from "@/components/Book/Page/PageContent/PageContent";
import PageCover from "@/components/Book/PageCover/PageCover";
import { cookies } from "next/headers";

interface IProps extends ILanguageProps {
  searchParams: Promise<SearchParams>;
}

const BookComponent: React.FC<IProps> = async (props) => {
  const { locale } = await props.params;
  const isMobile = (await cookies()).get("isMobile")?.value === "true";
  const t = await getTranslations("Book");

  const bookPages = getAllPages(locale, "heroes");
  const rtl = locale === Language.he;
  const noContentPages = 3;

  const pageNum = (i: number) => i + 1 + noContentPages - 1;

  const Pages = structuredClone(bookPages).map((content, i) => (
    <Page isMobile={isMobile} rtl={rtl} key={content.id} pageNum={pageNum(i)}>
      <PageContent
        cta={t("common.pageCta")}
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

  const Front = <PageCover key={"front"} details={frontDetails} />;
  const Back = <PageCover key={"back"} details={backDetails} />;

  return (
    <BookContainer
      rtl={rtl}
      isMobile={isMobile}
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
