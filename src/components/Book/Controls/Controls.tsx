import { BookActions } from "@/lib/utils/utils";
import styles from "./Controls.module.css";
import StyledButton from "@/components/StyledButton/StyledButton";

interface ControlsProps extends BookActions {
  currPage: number;
  pageCount: number;
  flipPage: (direction: "next" | "previous") => void;
}

export default function Controls({
  actions: { previous, next },
  currPage,
  pageCount,
  flipPage,
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      {
        <StyledButton
          className={currPage === 1 ? styles.disabled : ""}
          onClick={() => flipPage("previous")}
        >
          {previous}
        </StyledButton>
      }

      <div className={styles.pageCount}>
        <span>{currPage}</span>
        <span>/</span>
        <span>{pageCount}</span>
      </div>
      {
        <StyledButton
          className={currPage === pageCount ? styles.disabled : ""}
          onClick={() => flipPage("next")}
        >
          {next}
        </StyledButton>
      }
    </div>
  );
}
