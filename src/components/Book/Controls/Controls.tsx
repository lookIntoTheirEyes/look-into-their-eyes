import { BookActions } from "@/lib/utils/utils";
import localStyles from "./Controls.module.css";

interface ControlsProps extends BookActions {
  currPage: number;
  pageCount: number;
  goToPrevious: () => void;
  goToNext: () => void;
  styles: Record<string, string>;
}

export default function Controls({
  actions: { previous, next },
  styles,
  currPage,
  pageCount,
  goToNext,
  goToPrevious,
}: ControlsProps) {
  return (
    <div className={localStyles.controls}>
      {getButton({ styles, func: goToPrevious, text: previous })}

      <div className={localStyles.pageCount}>
        <span>{currPage}</span>
        <span>/</span>
        <span>{pageCount}</span>
      </div>
      {getButton({ styles, func: goToNext, text: next })}
    </div>
  );
}

function getButton({
  styles,
  text,
  func,
}: {
  func: () => void;
  styles: Record<string, string>;
  text: string;
}) {
  return (
    <button className={styles.button} onClick={func}>
      {text}
    </button>
  );
}
