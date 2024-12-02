import { useRef, useState, useMemo, useCallback } from "react";
import { CoverPage, Page as BookPage } from "@/lib/model/book";
import Page from "../../Page/Page";
import PageContent from "../../Page/PageContent/PageContent";
import PageCover from "../../PageCover/PageCover";
import TableOfContentsContainer from "../../TableOfContents/TableOfContentsContainer";

interface UseBookLayoutParams {
  bookPages: BookPage[];
  toc?: {
    title: string;
    pages: BookPage[];
  };
  noContentPages: number;
  storyTitle: string;
  pageCta: string;
  backDetails: CoverPage;
  frontDetails: CoverPage;
  isRtl: boolean;
  setCurrentPage: (page: number) => void;
}

export const useBookLayout = ({
  bookPages,
  toc,
  noContentPages,
  storyTitle,
  pageCta,
  backDetails,
  frontDetails,
  isRtl,
  setCurrentPage,
}: UseBookLayoutParams) => {
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const [isSinglePage, setIsSinglePage] = useState(false);

  const pageNum = useCallback(
    (i: number) => i + noContentPages,
    [noContentPages]
  );

  const content = useMemo(
    () =>
      bookPages.map((pageContent, i) => ({
        component: (
          <Page key={`page-${i}`} rtl={isRtl} pageNum={pageNum(i)}>
            <PageContent
              cta={pageCta}
              details={pageContent}
              pageNum={pageNum(i - 1)}
              title={storyTitle}
            />
          </Page>
        ),
        content: pageContent,
      })),
    [bookPages, isRtl, pageCta, pageNum, storyTitle]
  );

  const pagesContent = useMemo(() => {
    const Front = <PageCover key='front' details={frontDetails} />;
    const Back = <PageCover key='back' details={backDetails} />;

    return [Front, ...content.map((c) => c.component), Back];
  }, [content, frontDetails, backDetails]);

  const tocContainer = useMemo(
    () =>
      toc && (
        <TableOfContentsContainer
          key='toc'
          noContentAmount={2}
          rtl={isRtl}
          goToPage={(pageNum: number) => {
            setCurrentPage((pageNum % 2 === 0 ? pageNum - 1 : pageNum) - 1);
          }}
          toc={toc}
        />
      ),
    [toc, isRtl, setCurrentPage]
  );

  const pages = useMemo(
    () =>
      toc
        ? [
            pagesContent[0],
            tocContainer as JSX.Element,
            ...pagesContent.slice(1),
          ]
        : pagesContent,
    [toc, pagesContent, tocContainer]
  );

  return {
    bookContainerRef,
    isSinglePage,
    setIsSinglePage,
    pages,
    content,
  };
};
