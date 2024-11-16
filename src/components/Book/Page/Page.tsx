"use client";
import { forwardRef } from "react";
import styles from "./Page.module.css";

interface PageProps {
  pageNum: number;
  rtl?: boolean;
  children?: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, rtl, children }, ref) => {
    const isRightPage = pageNum % 2 === 0 ? rtl : !rtl;

    return (
      <div className={`bookPage ${isRightPage ? "right" : "left"}`} ref={ref}>
        <div className='pageContent'>
          {children}
          <div className={styles.pageFooter}>{pageNum}</div>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
