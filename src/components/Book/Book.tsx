"use client";

import React, { useRef, useState } from "react";

import PageFlip from "react-pageflip";
import styles from "./Book.module.css";
import PageCover from "@/components/Book/PageCover/PageCover";
import Page from "@/components/Book/Page/Page";

interface PageFlipMethods {
  flipNext: () => void;
  flipPrev: () => void;
}

interface CustomPageFlip {
  pageFlip: () => PageFlipMethods;
}

interface BookProps {
  rtl?: boolean;
  pageId: string;
  actions: { next: string; previous: string };
  book: { pages: string[]; front: string; back: string };
}

const Book: React.FC<BookProps> = ({
  rtl = false,
  pageId,
  book: { pages, front, back },
  actions: { next, previous },
}) => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const [currPage, setCurrPage] = useState<number>(+pageId || 1);

  const updateUrlWithPath = (pageNum: number) => {
    const pathSegments = window.location.pathname.split("/");

    pathSegments[pathSegments.length - 1] = pageNum.toString();

    const newPath = pathSegments.join("/");

    window.history.pushState({}, "", newPath);
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

  const calculatePageForRtl = (pageNum: number) => {
    //  Need to fix rtl page 2 goes to page 1

    return !pageNum
      ? pages.length + 2
      : pageNum === pages.length + 1
      ? 1
      : pages.length + 1 - pageNum;
  };

  return (
    <>
      <div className={styles.controls}>
        <button className={styles.button} onClick={goToPrevious}>
          {previous}
        </button>
        <div className={styles.pageCount}>
          <span>{currPage}</span>
          <span>/</span>
          <span>{pageCount}</span>
        </div>
        <button className={styles.button} onClick={goToNext}>
          {next}
        </button>
      </div>
      <PageFlip
        ref={pageFlipRef}
        className={""}
        style={{}}
        startPage={(rtl ? calculatePageForRtl(currPage - 2) : currPage) - 1}
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
          updateUrlWithPath(pageNum);
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
