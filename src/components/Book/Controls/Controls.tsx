import { BookActions } from "@/lib/utils/utils";
import localStyles from "./Controls.module.css";

interface ControlsProps extends BookActions {
  currPage: number;
  pageCount: number;
  goToPrevious: () => void;
  goToNext: () => void;
  styles: Record<string, string>;
  rtl: boolean;
}

export default function Controls({
  actions: { previous, next },
  styles,
  currPage,
  pageCount,
  goToNext,
  goToPrevious,
  rtl,
}: ControlsProps) {
  return (
    <div className={localStyles.controls}>
      <button className={styles.button} onClick={goToPrevious}>
        {previous}
      </button>
      <div className={`${localStyles.pageCount} ${rtl ? localStyles.rtl : ""}`}>
        <span>{currPage}</span>
        <span>/</span>
        <span>{pageCount}</span>
      </div>
      <button className={styles.button} onClick={goToNext}>
        {next}
      </button>
    </div>
  );
}
