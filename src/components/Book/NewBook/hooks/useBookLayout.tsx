import { useRef, useState, useCallback, useEffect } from "react";
import { ICoverPage, IPage } from "@/lib/model/book";
import Page from "../../Page/Page";
import PageContent from "../../Page/PageContent/PageContent";
import PageCover from "../../PageCover/PageCover";
import TableOfContentsContainer from "../../TableOfContents/TableOfContentsContainer";

interface UseBookLayoutParams {
  bookPages: IPage[];
  toc?: {
    title: string;
    pages: IPage[];
  };
  noContentPages: number;
  storyTitle: string;
  pageCta: string;
  backDetails: ICoverPage;
  frontDetails: ICoverPage;
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
  const [pages, setPages] = useState([] as JSX.Element[]);

  const pageNum = useCallback(
    (i: number) => i + noContentPages,
    [noContentPages]
  );

  useEffect(() => {
    if (pages.length) return;

    const Pages = bookPages.map((pageContent, i) => (
      <Page key={`page-${i}`} rtl={isRtl} pageNum={pageNum(i)}>
        <PageContent
          cta={pageCta}
          details={pageContent}
          pageNum={pageNum(i - 1)}
          title={storyTitle}
        />
      </Page>
    ));

    const Front = <PageCover key='front' details={frontDetails} />;
    const Back = <PageCover key='back' details={backDetails} />;

    const tocContainer = toc && (
      <TableOfContentsContainer
        key='toc'
        noContentAmount={2}
        rtl={isRtl}
        goToPage={(pageNum: number) => {
          setCurrentPage((pageNum % 2 === 0 ? pageNum - 1 : pageNum) - 1);
        }}
        toc={toc}
      />
    );

    setPages(getPages({ Front, Back, Pages }, tocContainer));
  }, [
    pages.length,
    backDetails,
    bookPages,
    frontDetails,
    isRtl,
    pageCta,
    pageNum,
    setCurrentPage,
    storyTitle,
    toc,
  ]);

  return {
    bookContainerRef,
    pages,
  };
};

function getPages(
  {
    Front,
    Back,
    Pages,
  }: {
    Front?: React.ReactElement;
    Back?: React.ReactElement;
    Pages: React.ReactElement[];
  },
  toc?: React.ReactElement
) {
  const renderPages = [] as React.ReactElement[];

  if (Front) {
    renderPages.push(Front);
  }

  if (toc) {
    renderPages.push(toc);
  }

  if (Pages.length) {
    renderPages.push(...Pages);
  }

  if (Back) {
    renderPages.push(Back);
  }

  return renderPages;
}
