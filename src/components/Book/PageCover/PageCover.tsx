import { forwardRef } from "react";
import localStyles from "./PageCover.module.css";
import { Page } from "@/lib/utils/heroesService";

interface PageCoverProps {
  styles: Record<string, string>;
  details: Page;
}

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>(
  ({ styles, details }, ref) => {
    return (
      <div className={`${styles.page} ${localStyles.pageCover}`} ref={ref}>
        <div className={styles.pageContent}>
          <h2>{details.title}</h2>
          <h3>{details.description}</h3>
          <p>{details.longDescription}</p>
        </div>
      </div>
    );
  }
);

PageCover.displayName = "PageCover";

export default PageCover;
