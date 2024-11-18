import { forwardRef } from "react";
import {
  Page as HeroPage,
  NO_CONTENT_PAGES_TOC,
  PAGES_FACTOR_TOC,
} from "@/lib/utils/heroesService";
import Page from "@/components/Book/Page/Page";
import TableOfContents from "./TableOfContents";

export interface TableOfContentsPageProps {
  toc: {
    title: string;
    pages: HeroPage[];
  };
  pagesAmount: number;
  goToPage: (pageNum: number) => void;
  rtl: boolean;
}

const TableOfContentsContainer = forwardRef<
  HTMLDivElement,
  TableOfContentsPageProps
>(({ rtl, toc, goToPage, pagesAmount }, ref) => {
  const getPageNum = (i: number) => {
    return rtl
      ? pagesAmount - i - NO_CONTENT_PAGES_TOC + PAGES_FACTOR_TOC
      : i + NO_CONTENT_PAGES_TOC;
  };
  return (
    <Page rtl={rtl} pageNum={2} ref={ref}>
      <TableOfContents
        title={toc.title}
        rtl={rtl}
        navigateToPage={goToPage}
        pages={toc.pages.map((page, i) => {
          return {
            title: page.title!,
            pageNum: getPageNum(i),
          };
        })}
      />
    </Page>
  );
});

TableOfContentsContainer.displayName = "TableOfContentsContainer";

export default TableOfContentsContainer;
