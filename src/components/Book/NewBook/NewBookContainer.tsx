// Parent Component (Server-Side)
import { CoverPage, Page as BookPage } from "@/lib/model/book";
import Page from "../Page/Page";
import PageContent from "../Page/PageContent/PageContent";
import PageCover from "../PageCover/PageCover";
import NewBook from "./NewBook";

export default async function NewBookContainer({
  bookPages,
  isRtl,
  storyTitle,
  pageCta,
  backDetails,
  frontDetails,
  pageNum,
  text,
  toc,
}: {
  isRtl: boolean;
  bookPages: BookPage[];
  storyTitle: string;
  pageCta: string;
  backDetails: CoverPage;
  frontDetails: CoverPage;
  text: { next: string; previous: string };
  toc: {
    title: string;
    pages: BookPage[];
  };
  pageNum: (num: number) => number;
}) {
  const Pages = bookPages.map((content, i) => {
    const pageContent = (
      <Page rtl={isRtl} pageNum={pageNum(i)}>
        <PageContent
          cta={pageCta}
          details={content}
          pageNum={pageNum(i - 1)}
          title={storyTitle}
        />
      </Page>
    );
    return pageContent;
  });

  const Front = <PageCover details={frontDetails} />;
  const Back = <PageCover details={backDetails} />;

  const pagesContent = [Front, ...Pages, Back];

  return (
    <NewBook toc={toc} isRtl={isRtl} text={text} pagesContent={pagesContent} />
  );
}
