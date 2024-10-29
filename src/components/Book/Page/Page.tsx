"use client";
import { forwardRef } from "react";
import Link from "next/link";
import localStyles from "./Page.module.css";

interface PageProps {
  pageNum: number;
  styles: Record<string, string>;
  rtl: boolean;
  children: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, styles, rtl, children }, ref) => {
    return (
      <div className={styles.page} ref={ref}>
        <div className={styles.pageContent}>
          <h2 className={localStyles.pageHeader}>
            {`${rtl ? "עמוד" : "Page"} - ${pageNum}`}
          </h2>
          <div className={localStyles.pageImage}></div>
          <div className={localStyles.pageText}>{children}</div>
          <div className={localStyles.pageFooter}>{pageNum}</div>
          <Link href={`/story/${pageNum}/details`} className={styles.button}>
            {rtl ? "המשך לקרוא" : "read more"}
          </Link>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
