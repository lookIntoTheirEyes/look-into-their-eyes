"use client";
import { forwardRef } from "react";
import styles from "./Page.module.css";

interface PageProps {
  pageNum: number;
  rtl?: boolean;
  isMobile: boolean;
  children?: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, rtl, children, isMobile }, ref) => {
    const isRightPage = pageNum % 2 === 0 ? rtl : !rtl;

    return (
      <div
        className={`bookPage ${
          isMobile ? "singlePage" : isRightPage ? "right" : "left"
        }`}
        ref={ref}
      >
        <div className='pageContent'>{children}</div>
        <div className={styles.pageFooter}>{pageNum}</div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
