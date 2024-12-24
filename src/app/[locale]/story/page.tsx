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

  const pageNum = (i: number) => i + noContentPages;

  const toc = {
    title: t("story.tableOfContents"),
    pages: bookPages,
  };

  const Pages = bookPages.map((content, i) => (
    <Page isMobile={isMobile} key={content.id} pageNum={pageNum(i)}>
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
  const blankPage =
    Pages.length % 2 === 0 ? (
      <Page key='blank' pageNum={bookPages.length} isMobile={isMobile} />
    ) : undefined;

  return (
    <BookContainer
      rtl={rtl}
      isMobile={isMobile}
      toc={toc}
      Pages={Pages}
      Front={Front}
      Back={Back}
      noContentAmount={noContentPages}
      blankPage={blankPage}
    />
  );
};

export default BookComponent;
