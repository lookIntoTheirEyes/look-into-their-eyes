import { forwardRef } from "react";
import styles from "./PageCover.module.css";

const PageCover = forwardRef<HTMLDivElement, React.PropsWithChildren<object>>(
  (props, ref) => {
    return (
      <div
        className={`${styles.page} ${styles.pageCover}`}
        ref={ref}
        data-density='hard'
      >
        <div className={styles.pageContent}>
          <h2>{props.children}</h2>
        </div>
      </div>
    );
  }
);

PageCover.displayName = "PageCover";

export default PageCover;
