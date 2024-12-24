"use client";
import { forwardRef } from "react";
import styles from "./Page.module.css";

interface PageProps {
  pageNum: number;
  isMobile: boolean;
  children?: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, children, isMobile }, ref) => {
    return (
      <div className={`bookPage ${isMobile ? "singlePage" : ""}`} ref={ref}>
        <div className='pageContent'>{children}</div>
        <div className={styles.pageFooter}>{pageNum}</div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
