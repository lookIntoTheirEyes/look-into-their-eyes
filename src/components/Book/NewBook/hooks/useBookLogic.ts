import { useState, useCallback, useEffect } from "react";
import { IPage } from "@/lib/model/book";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

export interface BookLogicParams {
  pagesContent: IPage[];
  toc?: {
    title: string;
    pages: IPage[];
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

  const totalPages = pagesContent.length + noContentPages;

  const [currentPage, setCurrentPage] = useState(0);

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

  const handleNextPage = () => {
    if (!isSinglePage && currentPage % 2 === 1 && currentPage) {
      if (currentPage + 1 < totalPages) updatePage(2);
    } else {
      if (currentPage < totalPages - 1) updatePage(1);
    }
  };

  const handlePrevPage = () => {
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
  };

  useEffect(() => {
    const queryParamPage = +(searchParams.get("page") || 1);
    const initPageNum =
      queryParamPage <= 0 || queryParamPage > totalPages ? 1 : queryParamPage;

    setCurrentPage(initPageNum - 1);
    updateUrlWithSearchParams(initPageNum);
  }, [searchParams, totalPages, updateUrlWithSearchParams]);

  return {
    totalPages,
    currentPage,
    setCurrentPage: updatePage,
    handleNextPage,
    handlePrevPage,
  };
}
