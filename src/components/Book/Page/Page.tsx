import { forwardRef } from "react";
import localStyles from "./Page.module.css";

interface PageProps {
  number: number;
  styles: Record<string, string>;
  children: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ number, styles, children }, ref) => {
    return (
      <div className={styles.page} ref={ref}>
        <div className={styles.pageContent}>
          <h2 className={localStyles.pageHeader}>Page header - {number + 1}</h2>
          <div className={localStyles.pageImage}></div>
          <div className={localStyles.pageText}>{children}</div>
          <div className={localStyles.pageFooter}>{number + 1}</div>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
