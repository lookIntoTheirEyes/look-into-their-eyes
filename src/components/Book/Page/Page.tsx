"use client";
import { forwardRef } from "react";
import localStyles from "./Page.module.css";

interface PageProps {
  pageNum: number;
  styles: Record<string, string>;
  rtl?: boolean;
  children?: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, styles, rtl, children }, ref) => {
    const isRightPage = pageNum % 2 === 0 ? rtl : !rtl;

    return (
      <div
        className={`${styles.page} ${isRightPage ? styles.right : styles.left}`}
        ref={ref}
      >
        <div className={styles.pageContent}>
          {children}

          <div className={localStyles.pageFooter}>{pageNum}</div>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
