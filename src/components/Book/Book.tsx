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
  pages: string[];
  actions: { next: string; previous: string };
}

const Book: React.FC<BookProps> = ({
  rtl = false,
  pages,
  actions: { next, previous },
}) => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currPage, setCurrPage] = useState<number>(1);

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
        startPage={rtl ? pages.length + 1 : 0}
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
        disableFlipByClick={false}
        onInit={({ object }) => {
          setPageCount(object.getPageCount());
        }}
        onFlip={({ data }) => {
          setCurrPage(rtl ? calculatePageForRtl(data) : data + 1);
        }}
      >
        <PageCover>{rtl ? "הסוף" : "BOOK TITLE"}</PageCover>
        {pages.map((content, i) => (
          <Page key={content} number={rtl ? pages.length - i : i + 1}>
            {content}
          </Page>
        ))}
        <PageCover>{rtl ? "ההתחלה" : "THE END"}</PageCover>
      </PageFlip>
    </>
  );
};

export default Book;
