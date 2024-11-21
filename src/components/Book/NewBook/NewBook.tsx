"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import styles from "./NewBook.module.css";
import Controls from "../Controls/Controls";
import TableOfContentsContainer from "../TableOfContents/TableOfContentsContainer";
import { Orientation, Page } from "@/lib/model/book";

interface BookProps {
  pagesContent: React.ReactNode[]; // Accept pre-calculated JSX content as an array
  text: {
    next: string;
    previous: string;
  };
  isRtl: boolean;
  toc?: {
    title: string;
    pages: Page[];
  };
}

const NewBook: React.FC<BookProps> = ({
  pagesContent,
  isRtl,
  text: actions,
  toc,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookStyle, setBookStyle] = useState<{
    height: number;
    width: number;
    mode: Orientation;
  }>({
    height: 0,
    width: 0,
    mode: Orientation.LANDSCAPE,
  });
  const [dragX, setDragX] = useState(0);
  const bookRef = useRef<HTMLDivElement>(null);
  const bookContainerRef = useRef<HTMLDivElement>(null);

  const TableOfContents = (
    <TableOfContentsContainer
      noContentAmount={2}
      rtl={isRtl}
      goToPage={(pageNum: number) => {}}
      pagesAmount={3}
      toc={toc!}
    />
  );

  const pages1 = [pagesContent[0], TableOfContents, ...pagesContent.slice(1)];

  const totalPages = pages1.length;
  const dragThreshold = 100;

  // Handle swipe gestures for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextPage(),
    onSwipedRight: () => handlePrevPage(),
    trackMouse: true, // Tracks mouse swipes as well as touch gestures
    trackTouch: true, // Ensures touch gestures are tracked
    onTouchStartOrOnMouseDown: ({ event }) => {
      event.preventDefault(); // Prevent default touchmove behavior
    },
  });

  // Update book dimensions and screen size on window resize

  useEffect(() => {
    const calculateBookStyle = (
      containerWidth: number,
      containerHeight: number
    ) => {
      const aspectRatio = 1.4; // Ideal book aspect ratio
      const isMobile = containerWidth <= 600;

      let height = 0,
        width = 0;

      if (isMobile) {
        height = containerWidth * aspectRatio;
      } else {
        height = containerWidth / aspectRatio;

        // If height exceeds container height, adjust width and height proportionally
        if (height > containerHeight) {
          height = containerHeight; // Match container height
          width = height * aspectRatio;
        }
      }

      setBookStyle({
        width: width || containerWidth,
        height,
        mode: isMobile ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
      });
    };

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];

      if (entry.target === bookContainerRef.current) {
        const { width, height } = entry.contentRect;

        // Calculate book size dynamically
        calculateBookStyle(width, height);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (bookContainerRef.current) {
      resizeObserver.observe(bookContainerRef.current);
    }

    return () => {
      if (bookContainerRef.current) {
        resizeObserver.unobserve(bookContainerRef.current);
      }
    };
  }, []);

  const isSinglePage = () => {
    return bookStyle.mode === Orientation.PORTRAIT;
  };

  const handleNextPage = () => {
    if (!isSinglePage() && currentPage % 2 === 1 && currentPage) {
      if (currentPage + 1 < totalPages) setCurrentPage((prev) => prev + 2);
    } else {
      if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (
      !isSinglePage() &&
      currentPage % 2 === 1 &&
      currentPage !== 1 &&
      currentPage !== totalPages
    ) {
      setCurrentPage((prev) => prev - 2);
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const flipPage = (direction: "next" | "previous") => {
    if (direction === "next") {
      handleNextPage();
    } else {
      handlePrevPage();
    }
  };

  const handleDrag = (_: Event, info: { offset: { x: number } }) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (_: Event, info: { offset: { x: number } }) => {
    if (info.offset.x > dragThreshold && currentPage > 0) handlePrevPage();
    if (info.offset.x < -dragThreshold && currentPage < totalPages - 1)
      handleNextPage();
    setDragX(0);
  };

  const renderPageContent = (pageIndex: number) => {
    return pages1[pageIndex]; // Directly render the pre-calculated JSX component
  };

  const renderPages = () => {
    // If it's the first page or last page, show only 1 page
    if (isSinglePage() || currentPage === 0 || currentPage === totalPages - 1) {
      return (
        <motion.div
          className={`${styles.page} ${isSinglePage() ? styles.onePage : ""}`}
          key={`page-${currentPage}`}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
        >
          {renderPageContent(currentPage)}
        </motion.div>
      );
    }

    // For all other pages, show both front and back pages
    return (
      <>
        {/* Left page (current page) */}
        <motion.div
          className={`${styles.page} ${styles.left}`}
          key={`page-${currentPage}`}
          initial={{ opacity: 0, rotateY: -180 }}
          animate={{
            opacity: 1,
            rotateY: 0,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
          exit={{
            opacity: 0,
            rotateY: 180,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
          style={{
            transformOrigin: "left center",
            x: dragX,
            originX: "left",
          }}
        >
          {renderPageContent(currentPage)}
        </motion.div>

        {/* Right page (next page) */}
        {currentPage + 1 < totalPages && (
          <motion.div
            className={`${styles.page} ${styles.right}`}
            key={`page-${currentPage + 1}`}
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{
              opacity: 1,
              rotateY: 0,
              transition: { duration: 0.6, ease: "easeInOut" },
            }}
            exit={{
              opacity: 0,
              rotateY: -180,
              transition: { duration: 0.6, ease: "easeInOut" },
            }}
            style={{
              transformOrigin: "right center",
              x: dragX,
              originX: "right",
            }}
          >
            {renderPageContent(currentPage + 1)}
          </motion.div>
        )}
      </>
    );
  };

  return (
    <div ref={bookContainerRef} className={styles.bookContainer}>
      <div
        style={{
          width: `${bookStyle.width}px`,
          height: `${bookStyle.height}px`,
          margin: "0 auto",
        }}
        className={styles.book}
        ref={mergeRefs(bookRef, swipeHandlers.ref)}
      >
        <AnimatePresence>{renderPages()}</AnimatePresence>
      </div>

      <Controls
        flipPage={flipPage}
        pageCount={totalPages}
        currPage={currentPage + 1}
        actions={actions}
      />
    </div>
  );
};

NewBook.displayName = "NewBook";
export default NewBook;

function mergeRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref && "current" in ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}
