import { forwardRef } from "react";
import { IPage } from "@/lib/model/book";
import Page from "@/components/Book/Page/Page";
import TableOfContents from "./TableOfContents";

export interface TableOfContentsPageProps {
  toc: {
    title: string;
    pages: IPage[];
  };
  pagesAmount: number;
  goToPage: (pageNum: number) => void;
  rtl: boolean;
  isMobile: boolean;
  noContentAmount: number;
}

const TableOfContentsContainer = forwardRef<
  HTMLDivElement,
  TableOfContentsPageProps
>(({ rtl, toc, goToPage, noContentAmount, isMobile }, ref) => {
  const getPageNum = (i: number) => i + noContentAmount;
  return (
    <Page isMobile={isMobile} pageNum={2} ref={ref}>
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
