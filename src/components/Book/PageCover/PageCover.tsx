import { forwardRef } from "react";
import styles from "./PageCover.module.css";
import { CoverPage } from "@/lib/utils/heroesService";

interface PageCoverProps {
  details: CoverPage;
}

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>(
  ({ details }, ref) => {
    return (
      <div
        className={`bookPage ${styles.pageCover}`}
        data-density='hard'
        ref={ref}
      >
        <div className='pageContent'>
          <h2 className={styles.title}>{details.title}</h2>
          {details.author && (
            <h3 className={styles.author}>{details.author}</h3>
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
