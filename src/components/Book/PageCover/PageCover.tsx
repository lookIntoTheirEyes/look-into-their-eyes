import { forwardRef } from "react";
import localStyles from "./PageCover.module.css";
import { CoverPage } from "@/lib/utils/heroesService";

interface PageCoverProps {
  styles: Record<string, string>;
  details: CoverPage;
}

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>(
  ({ styles, details }, ref) => {
    return (
      <div className={`${styles.page} ${localStyles.pageCover}`} ref={ref}>
        <div className={styles.pageContent}>
          <h2 className={localStyles.title}>{details.title}</h2>
          {details.author && (
            <h3 className={localStyles.author}>{details.author}</h3>
          )}
          <h3>{details.description}</h3>
          <p>{details.longDescription}</p>
        </div>
      </div>
    );
  }
);

PageCover.displayName = "PageCover";

export default PageCover;
