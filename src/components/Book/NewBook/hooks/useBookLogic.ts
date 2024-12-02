import { useState, useCallback } from "react";
import { Page } from "@/lib/model/book";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

export interface BookLogicParams {
  pagesContent: Page[];
  toc?: {
    title: string;
    pages: Page[];
  };
  isSinglePage: boolean;
  noContentPages: number;
}

export function useBookLogic({
  pagesContent,
  isSinglePage,
  noContentPages,
}: BookLogicParams) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryParamPage = +searchParams.get("page")!;
  const totalPages = pagesContent.length + noContentPages;
  const pageNum =
    (queryParamPage <= 0 || queryParamPage > totalPages ? 1 : queryParamPage) -
    1;

  const [currentPage, setCurrentPage] = useState(
    pageNum && pageNum % 2 === 0 ? pageNum - 1 : pageNum
  );

  const updateUrlWithSearchParams = useCallback(
    (pageNum: number) => {
      router.push(
        { pathname, query: { page: pageNum.toString() } },
        { scroll: false }
      );
    },
    [pathname, router]
  );

  const updatePage = useCallback(
    (pageNum: number) => {
      setCurrentPage((prev) => prev + pageNum);
      updateUrlWithSearchParams(currentPage + pageNum + 1);
    },
    [currentPage, updateUrlWithSearchParams]
  );

  const handleNextPage = useCallback(() => {
    console.log("handleNextPage");

    if (!isSinglePage && currentPage % 2 === 1 && currentPage) {
      if (currentPage + 1 < totalPages) updatePage(2);
    } else {
      if (currentPage < totalPages - 1) updatePage(1);
    }
  }, [isSinglePage, currentPage, totalPages, updatePage]);

  const handlePrevPage = useCallback(() => {
    console.log("handlePrevPage");
    if (
      !isSinglePage &&
      currentPage % 2 === 1 &&
      currentPage !== 1 &&
      currentPage !== totalPages
    ) {
      updatePage(-2);
    } else {
      updatePage(-1);
    }
  }, [isSinglePage, currentPage, totalPages, updatePage]);

  return {
    totalPages,
    currentPage,
    setCurrentPage: updatePage,
    handleNextPage,
    handlePrevPage,
  };
}
