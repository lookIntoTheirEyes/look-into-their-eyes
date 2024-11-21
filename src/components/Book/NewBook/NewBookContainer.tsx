// Parent Component (Server-Side)
import { CoverPage, Page as BookPage } from "@/lib/model/book";
import Page from "../Page/Page";
import PageContent from "../Page/PageContent/PageContent";
import PageCover from "../PageCover/PageCover";
import NewBook from "./NewBook";
import TableOfContentsContainer from "../TableOfContents/TableOfContentsContainer";

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
  toc?: {
    title: string;
    pages: BookPage[];
  };
  pageNum: (num: number) => number;
}) {
  const Pages = bookPages.map((content, i) => {
    // Pre-calculate the JSX content for each page
    const pageContent = (
      <Page rtl={isRtl} key={content.title} pageNum={pageNum(i)}>
        <PageContent
          cta={pageCta}
          details={content}
          pageNum={pageNum(i)}
          title={storyTitle}
        />
      </Page>
    );
    return pageContent; // Return the pre-calculated JSX element
  });

  // Pre-calculate the front and back cover JSX content
  const Front = <PageCover details={isRtl ? backDetails : frontDetails} />;
  const Back = <PageCover details={isRtl ? frontDetails : backDetails} />;

  // Create the array of pages with front, content pages, and back
  const pagesContent = [Front, ...Pages, Back];

  console.log("pagesContent", pagesContent);

  // Pass the pre-calculated pages content to the client component
  return (
    <NewBook toc={toc!} isRtl={isRtl} text={text} pagesContent={pagesContent} />
  );
}
