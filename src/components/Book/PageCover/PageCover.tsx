import { forwardRef } from "react";
import localStyles from "./PageCover.module.css";

interface PageCoverProps {
  styles: Record<string, string>;
  children: React.ReactNode;
}

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>(
  ({ styles, children }, ref) => {
    return (
      <div className={`${styles.page} ${localStyles.pageCover}`} ref={ref}>
        <div className={styles.pageContent}>
          <h2>{children}</h2>
        </div>
      </div>
    );
  }
);

PageCover.displayName = "PageCover";

export default PageCover;
