"use client";
import { forwardRef } from "react";
import localStyles from "./Page.module.css";
import Link from "next/link";

interface PageProps {
  pageNum: number;
  styles: Record<string, string>;
  rtl: boolean;
  children: React.ReactNode;
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
          <h2 className={localStyles.pageHeader}>
            {`${rtl ? "עמוד" : "Page"} - ${pageNum}`}
          </h2>
          <div className={localStyles.pageImage}></div>
          <div className={localStyles.pageText}>{children}</div>
          <div className={localStyles.pageFooter}>{pageNum}</div>
          <Link
            href={`/story/details?page=${pageNum}`}
            className={styles.button}
            scroll={false}
          >
            {rtl ? "המשך לקרוא" : "read more"}
          </Link>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
