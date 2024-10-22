"use client";

import React, { forwardRef, useRef, useState } from "react";
import PageFlip from "react-pageflip";
import styles from "./page.module.css";

interface PageProps {
  number: number;
  children: React.ReactNode;
}

interface PageFlipMethods {
  flipNext: () => void;
  flipPrev: () => void;
}

interface CustomPageFlip {
  pageFlip: () => PageFlipMethods;
}

const pagesContent = [
  "My Story",
  "Once upon a time, there was a little girl.",
  "She loved exploring the woods.",
  "One day, she found a hidden path.",
  "Curiosity led her down the trail.",
  "She discovered a secret garden.",
  "In the garden, she met a talking rabbit.",
  "They became the best of friends.",
  "Together, they went on many adventures.",
  "Thank you, Nati.",
];

const PageCover = forwardRef<HTMLDivElement, React.PropsWithChildren<{}>>(
  (props, ref) => {
    return (
      <div
        className={`${styles.page} ${styles.pageCover}`}
        ref={ref}
        data-density='hard'
      >
        <div className={styles.pageContent}>
          <h2>{props.children}</h2>
        </div>
      </div>
    );
  }
);

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ number, children }, ref) => {
    return (
      <div className={styles.page} ref={ref}>
        <div className={styles.pageContent}>
          <h2 className={styles.pageHeader}>Page header - {number}</h2>
          <div className={styles.pageImage}></div>
          <div className={styles.pageText}>{children}</div>
          <div className={styles.pageFooter}>{number + 1}</div>
        </div>
      </div>
    );
  }
);

const BookComponent: React.FC = () => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currPage, setCurrPage] = useState<number>(1);

  const goToNext = () => {
    pageFlipRef.current?.pageFlip().flipNext();
  };

  const goToPrevious = () => {
    pageFlipRef.current?.pageFlip().flipPrev();
  };

  return (
    <div className={styles.bookContainer}>
      <PageFlip
        ref={pageFlipRef}
        className={""}
        style={{ maxHeight: "100%" }}
        startPage={0}
        width={550}
        height={733}
        size='stretch'
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        drawShadow={true}
        flippingTime={700}
        usePortrait={true}
        startZIndex={30}
        autoSize={true}
        showCover={true}
        mobileScrollSupport={true}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={0}
        showPageCorners={true}
        disableFlipByClick={false}
        onInit={({ object }) => {
          setPageCount(object.getPageCount());
        }}
        onFlip={({ data }) => {
          setCurrPage(data + 1);
        }}
        onChangeOrientation={(oren) => {
          console.log("changeOrientation", oren);
        }}
      >
        <PageCover>BOOK TITLE</PageCover>

        {pagesContent.map((content, i) => {
          return (
            <Page key={content} number={i + 1}>
              {content}
            </Page>
          );
        })}
        <PageCover>THE END</PageCover>
      </PageFlip>
      <div className={styles.controls}>
        <button className={styles.button} onClick={goToPrevious}>
          Previous
        </button>
        <button className={styles.button} onClick={goToNext}>
          Next
        </button>
      </div>
      <div className={styles.pageCount}>
        {currPage} of {pageCount}
      </div>
    </div>
  );
};

export default BookComponent;
