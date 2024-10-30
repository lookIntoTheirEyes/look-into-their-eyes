"use client";

import React, { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PageFlip from "react-pageflip";
import styles from "./Book.module.css";
import PageCover from "@/components/Book/PageCover/PageCover";
import Page from "@/components/Book/Page/Page";
import { BookActions } from "@/lib/utils/utils";
import Controls from "./Controls/Controls";

interface PageFlipMethods {
  flipNext: () => void;
  flipPrev: () => void;
}

interface CustomPageFlip {
  pageFlip: () => PageFlipMethods;
}

interface BookProps extends BookActions {
  rtl?: boolean;
  book: { pages: string[]; front: string; back: string };
}

const Book: React.FC<BookProps> = ({
  rtl = false,
  book: { pages, front, back },
  actions,
}) => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const pathname = usePathname();
  const router = useRouter();

  const [currPage, setCurrPage] = useState<number>(+page! || 1);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const updateUrlWithSearchParams = (pageNum: number) => {
    router.push(
      pathname + "?" + createQueryString("page", pageNum.toString()),
      { scroll: false }
    );
  };

  const goToNext = () => {
    const pageFlip = pageFlipRef.current?.pageFlip();
    if (rtl) {
      pageFlip?.flipPrev();
    } else {
      pageFlip?.flipNext();
    }
  };

  const goToPrevious = () => {
    const pageFlip = pageFlipRef.current?.pageFlip();

    if (rtl) {
      pageFlip?.flipNext();
    } else {
      pageFlip?.flipPrev();
    }
  };

  const calculatePageForRtl = (pageNum: number, isInit = false) => {
    const num = (isInit ? pageNum < 0 : !pageNum)
      ? pages.length + 2
      : pageNum === pages.length + 1
      ? 1
      : pages.length + 1 - pageNum;

    return num;
  };

  return (
    <>
      <Controls
        currPage={currPage}
        pageCount={pageCount}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
        actions={actions}
        styles={styles}
      />
      <PageFlip
        ref={pageFlipRef}
        className={""}
        style={{}}
        startPage={
          (rtl ? calculatePageForRtl(currPage - 2, true) : currPage) - 1
        }
        width={550}
        height={733}
        size='stretch'
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        drawShadow
        flippingTime={700}
        startZIndex={30}
        swipeDistance={30}
        usePortrait
        autoSize
        showCover
        mobileScrollSupport
        clickEventForward
        useMouseEvents
        showPageCorners
        renderOnlyPageLengthChange
        disableFlipByClick={false}
        onInit={({ object }) => {
          setPageCount(object.getPageCount());
        }}
        onFlip={({ data }) => {
          const pageNum = rtl ? calculatePageForRtl(data) : data + 1;
          setCurrPage(pageNum);
          updateUrlWithSearchParams(pageNum);
        }}
      >
        <PageCover styles={styles}>{front}</PageCover>
        {pages.map((content, i) => (
          <Page
            rtl={rtl}
            styles={styles}
            key={content}
            pageNum={(rtl ? pages.length - i : i + 1) + 1}
          >
            {content}
          </Page>
        ))}
        <PageCover styles={styles}>{back}</PageCover>
      </PageFlip>
    </>
  );
};

export default Book;
