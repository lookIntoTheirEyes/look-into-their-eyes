"use client";

import React, { useRef, useState } from "react";
import PageFlip from "react-pageflip";
import styles from "./page.module.css";

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
interface PageFlipMethods {
  flipNext: () => void;
  flipPrev: () => void;
}

interface CustomPageFlip {
  pageFlip: () => PageFlipMethods;
}

const BookComponent: React.FC = () => {
  const pageFlipRef = useRef<CustomPageFlip | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currPage, setCurrPage] = useState<number>(0);

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
        width={300}
        height={400}
        className={""}
        style={{}}
        startPage={0}
        size={"stretch"}
        minWidth={0}
        maxWidth={300}
        minHeight={0}
        maxHeight={400}
        drawShadow={true}
        flippingTime={200}
        usePortrait={false}
        startZIndex={0}
        autoSize={true}
        maxShadowOpacity={0}
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
      >
        {pagesContent.map((content, i) => {
          return (
            <div key={content}>
              <div key={content} className={styles.page}>
                <h1 className={styles["page-header"]}>{`Page ${i + 1}`}</h1>
                <p className={styles["page-body"]}>{content}</p>
              </div>
            </div>
          );
        })}
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
