"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageFlip } from "@/components/flip/PageFlip";

interface CustomPageFlip {
  pageFlip: () => PageFlip | null;
}

export const useBookNavigation = (pagesAmount: number, isRtl: boolean) => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryParamPage = +(searchParams.get("page") || 1);
  const page =
    queryParamPage <= 0 || queryParamPage > pagesAmount ? 1 : queryParamPage;

  const [currPage, setCurrPage] = useState(page);

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
    const flipDirection = isRtl
      ? direction === "next"
        ? "flipPrev"
        : "flipNext"
      : direction === "next"
      ? "flipNext"
      : "flipPrev";

    pageFlipRef.current?.pageFlip()?.[flipDirection]();
  };

  const updatePage = (pageNum: number) => {
    setCurrPage(pageNum);
    updateUrlWithSearchParams(pageNum);
  };

  const goToPage = (pageNum: number) => {
    const adjustedPageNum = (isRtl ? pagesAmount - pageNum + 1 : pageNum) - 1;
    pageFlipRef.current?.pageFlip()?.flip(adjustedPageNum);
  };

  useEffect(() => {
    if (page !== queryParamPage) {
      setCurrPage(page);
      updateUrlWithSearchParams(page);
    }
  }, [page, queryParamPage, updateUrlWithSearchParams]);

  useEffect(() => {
    return () => {
      pageFlipRef.current?.pageFlip()?.destroy();
    };
  }, []);

  return {
    currPage,
    pageFlipRef,
    flipPage,
    updatePage,
    goToPage,
  };
};
