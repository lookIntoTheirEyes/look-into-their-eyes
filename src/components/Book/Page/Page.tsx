import { forwardRef } from "react";
import styles from "./Page.module.css";

interface PageProps {
  number: number;
  children: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ number, children }, ref) => {
    return (
      <div className={styles.page} ref={ref}>
        <div className={styles.pageContent}>
          <h2 className={styles.pageHeader}>Page header - {number + 1}</h2>
          <div className={styles.pageImage}></div>
          <div className={styles.pageText}>{children}</div>
          <div className={styles.pageFooter}>{number + 1}</div>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
