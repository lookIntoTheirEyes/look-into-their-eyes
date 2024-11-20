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
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    flipPage("previous");
  };

  return (
    <div className={styles.controls}>
      {
        <StyledButton isDisabled={currPage === 1} onClick={handleClick}>
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
          isDisabled={currPage === pageCount}
          onClick={() => flipPage("next")}
        >
          {next}
        </StyledButton>
      }
    </div>
  );
}
