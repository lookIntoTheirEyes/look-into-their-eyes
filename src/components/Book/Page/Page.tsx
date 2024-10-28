"use client";
import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import localStyles from "./Page.module.css";

interface PageProps {
  number: number;
  styles: Record<string, string>;
  rtl: boolean;
  children: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ number, styles, rtl, children }, ref) => {
    const router = useRouter();

    const handleShowDialog = () => {
      router.push(`/story/${number}/details`);
    };
    return (
      <div className={styles.page} ref={ref}>
        <div className={styles.pageContent}>
          <h2 className={localStyles.pageHeader}>Page header - {number}</h2>
          <div className={localStyles.pageImage}></div>
          <div className={localStyles.pageText}>{children}</div>
          <div className={localStyles.pageFooter}>{number}</div>
          <button onClick={handleShowDialog}>
            {rtl ? "הצג עוד" : "show more"}
          </button>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
