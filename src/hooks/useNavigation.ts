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

  const flipPage = (direction: "next" | "previous") => {
    const pageFlip = pageFlipRef.current?.pageFlip();

    isRtl
      ? direction === "next"
        ? pageFlip?.flipPrev()
        : pageFlip?.flipNext()
      : direction === "next"
      ? pageFlip?.flipNext()
      : pageFlip?.flipPrev();
  };

  const updatePage = (pageNum: number) => {
    setCurrPage(pageNum);
    updateUrlWithSearchParams(pageNum);
  };

  const goToPage = (pageNum: number) => {
    const adjustedPageNum = (isRtl ? pagesAmount - pageNum + 1 : pageNum) - 1;
    const pageFlip = pageFlipRef.current?.pageFlip();

    pageFlip?.flip(adjustedPageNum);
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
    flipPage,
    updatePage,
    goToPage,
  };
};
