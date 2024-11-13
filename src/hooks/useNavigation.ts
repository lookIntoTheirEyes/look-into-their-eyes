"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PageFlipMethods {
  flipNext: () => void;
  flipPrev: () => void;
  flip: (pageNum: number) => void;
}

interface CustomPageFlip {
  pageFlip: () => PageFlipMethods;
}

export const useBookNavigation = (pagesAmount: number, isRtl: boolean) => {
  const pageFlipRef = useRef<CustomPageFlip>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryParamPage = +searchParams.get("page")!;
  const page =
    queryParamPage <= 0 || queryParamPage > pagesAmount ? 1 : queryParamPage;

  const [currPage, setCurrPage] = useState<number>(page);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const updateUrlWithSearchParams = useCallback(
    (pageNum: number) => {
      router.push(
        pathname + "?" + createQueryString("page", pageNum.toString()),
        { scroll: false }
      );
    },
    [createQueryString, pathname, router]
  );

  const goToNext = () => {
    const newPage = isRtl ? currPage - 1 : currPage + 1;
    setCurrPage(newPage);
    updateUrlWithSearchParams(newPage);
  };

  const goToPrevious = () => {
    const newPage = isRtl ? currPage + 1 : currPage - 1;
    setCurrPage(newPage);
    updateUrlWithSearchParams(newPage);
  };

  const updatePage = (pageNum: number) => {
    setCurrPage(pageNum);
    updateUrlWithSearchParams(pageNum);
  };

  const goToPage = (pageNum: number) => {
    const pageFlip = pageFlipRef.current?.pageFlip();
    pageFlip?.flip((isRtl ? pagesAmount - pageNum : pageNum) - 1);
  };

  useEffect(() => {
    if (page !== queryParamPage) {
      setCurrPage(page);
      updateUrlWithSearchParams(page);
    }
  }, [page, queryParamPage, updateUrlWithSearchParams, isRtl]);

  return {
    currPage,
    pageFlipRef,
    goToNext,
    goToPrevious,
    updatePage,
    goToPage,
  };
};
