"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PageFlip from "react-pageflip";
import styles from "./Book.module.css";
import PageCover from "@/components/Book/PageCover/PageCover";
import Page from "@/components/Book/Page/Page";
import { BookActions } from "@/lib/utils/utils";
import Controls from "./Controls/Controls";
import { Page as HeroPage } from "@/lib/utils/heroesService";

interface PageFlipMethods {
  flipNext: () => void;
  flipPrev: () => void;
}

interface CustomPageFlip {
  pageFlip: () => PageFlipMethods;
}

interface BookProps extends BookActions {
  rtl: boolean;
  book: { pages: HeroPage[]; front: HeroPage; back: HeroPage };
}

const Book: React.FC<BookProps> = ({
  rtl,
  book: { pages, front, back },
  actions,
}) => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const searchParams = useSearchParams();
  const queryParamPage = +searchParams.get("page")!;
  const page =
    !queryParamPage || queryParamPage > pages.length + 2 ? 1 : queryParamPage;
  const pathname = usePathname();
  const router = useRouter();

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

  useEffect(() => {
    if (page !== queryParamPage) {
      updateUrlWithSearchParams(page);
    }
  }, [page, queryParamPage, updateUrlWithSearchParams]);

  return (
    <div
      className={`${styles.storyContainer} ${
        !pageFlipRef.current ? styles.loading : ""
      }`}
    >
      {!pageFlipRef.current && (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
        </div>
      )}
      <PageFlip
        ref={pageFlipRef}
        className={""}
        style={{}}
        startPage={
          (rtl ? calculatePageForRtl(currPage - 2, true) : currPage) - 1
        }
        width={550}
        height={725}
        size='stretch'
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={1}
        drawShadow
        flippingTime={700}
        startZIndex={30}
        swipeDistance={1}
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
        <PageCover styles={styles} details={front} />
        {pages.map((content, i) => (
          <Page
            rtl={rtl}
            styles={styles}
            key={content.title}
            details={content}
            pageNum={(rtl ? pages.length - i : i + 1) + 1}
            cta={actions.cta}
          ></Page>
        ))}
        <PageCover styles={styles} details={back} />
      </PageFlip>
      <Controls
        currPage={currPage}
        pageCount={pageCount}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
        actions={actions}
        styles={styles}
      />
    </div>
  );
};

export default Book;
