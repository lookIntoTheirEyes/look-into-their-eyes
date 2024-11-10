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
      {getButton({ styles, func: goToPrevious, text: previous, rtl })}

      <div className={`${localStyles.pageCount} ${rtl ? localStyles.rtl : ""}`}>
        <span>{currPage}</span>
        <span>/</span>
        <span>{pageCount}</span>
      </div>
      {getButton({ styles, func: goToNext, text: next, rtl })}
    </div>
  );
}

function getButton({
  styles,
  text,
  func,
  rtl,
}: {
  func: () => void;
  styles: Record<string, string>;
  text: string;
  rtl: boolean;
}) {
  return (
    <button
      className={`${styles.button} ${rtl ? styles["cool-font"] : ""}`}
      onClick={func}
    >
      {text}
    </button>
  );
}
