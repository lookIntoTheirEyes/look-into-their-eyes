import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import BookContainer from "@/components/Book/BookContainer";
import { SearchParams } from "@/lib/utils/utils";
import { getAllPages } from "@/lib/utils/heroesService";
import Page from "@/components/Book/Page/Page";
import PageContent from "@/components/Book/Page/PageContent/PageContent";
import PageCover from "@/components/Book/PageCover/PageCover";
import { cookies } from "next/headers";
import { imageLoader } from "@/lib/utils/utils";
import Head from "next/head";

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

  const preloadUrls = bookPages
    .slice(0, 4)
    .map((content) =>
      content.imageUrl
        ? imageLoader({ src: content.imageUrl, quality: 100 })
        : undefined
    )
    .filter(Boolean);

  const Pages = structuredClone(bookPages).map((content, i) => (
    <Page isMobile={isMobile} rtl={rtl} key={content.id} pageNum={pageNum(i)}>
      <PageContent
        cta={t("common.pageCta")}
        details={content}
        pageNum={pageNum(i)}
        title={t("story.title")}
        priority={i < 4}
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

  const Front = <PageCover key='front' details={frontDetails} />;
  const Back = <PageCover key='back' details={backDetails} />;

  const pagesAmount = Pages.length + noContentPages;

  const toc = {
    title: t("story.tableOfContents"),
    pages: bookPages,
  };

  return (
    <>
      <Head>
        {preloadUrls.map((url, index) => (
          <link key={`preload-${index}`} rel='preload' as='image' href={url} />
        ))}
      </Head>

      <BookContainer
        rtl={rtl}
        book={{ Front, Back, Pages }}
        pagesAmount={pagesAmount}
        toc={toc}
        isMobile={isMobile}
      />
    </>
  );
};

export default BookComponent;
