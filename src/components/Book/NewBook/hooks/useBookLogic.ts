import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

export interface BookLogicParams {
  isSinglePage: boolean;
  pagesAmount: number;
}

export function useBookLogic({ isSinglePage, pagesAmount }: BookLogicParams) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
    (pageNum: number, usePrev = true) => {
      setCurrentPage((prev) => (usePrev ? prev + pageNum : pageNum));
      updateUrlWithSearchParams((usePrev ? currentPage : 0) + pageNum + 1);
    },
    [currentPage, updateUrlWithSearchParams]
  );

  const handleNextPage = () => {
    if (!isSinglePage && currentPage % 2 === 1 && currentPage) {
      if (currentPage + 1 < pagesAmount) updatePage(2);
    } else {
      if (currentPage < pagesAmount - 1) updatePage(1);
    }
  };

  const handlePrevPage = () => {
    if (
      !isSinglePage &&
      currentPage % 2 === 1 &&
      currentPage !== 1 &&
      currentPage !== pagesAmount
    ) {
      updatePage(-2);
    } else {
      updatePage(-1);
    }
  };

  useEffect(() => {
    const queryParamPage = +(searchParams.get("page") || 1);
    const initPageNum =
      queryParamPage <= 0 || queryParamPage > pagesAmount ? 1 : queryParamPage;

    if (initPageNum === queryParamPage && initPageNum - 1 === currentPage) {
      return;
    }

    setCurrentPage(initPageNum - 1);
    updateUrlWithSearchParams(initPageNum);
  }, [searchParams, pagesAmount, updateUrlWithSearchParams]);

  return {
    currentPage,
    setCurrentPage: updatePage,
    handleNextPage,
    handlePrevPage,
  };
}
