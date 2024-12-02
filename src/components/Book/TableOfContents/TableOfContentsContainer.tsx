import { forwardRef } from "react";
import { Page as HeroPage } from "@/lib/model/book";
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
  noContentAmount: number;
}

const TableOfContentsContainer = forwardRef<
  HTMLDivElement,
  TableOfContentsPageProps
>(({ rtl, toc, goToPage, noContentAmount }, ref) => {
  const getPageNum = (i: number) => i + noContentAmount;
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
