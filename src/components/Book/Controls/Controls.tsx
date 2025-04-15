import { BookActions } from "@/lib/utils/utils";
import styles from "./Controls.module.css";
import StyledButton from "@/components/StyledButton/StyledButton";
import { memo, useCallback } from "react";

interface ControlsProps extends BookActions {
  currPage: number;
  pageCount: number;
  flipPage: (direction: "next" | "previous") => void;
}

// Using memo to prevent unnecessary re-renders
const Controls = memo(function Controls({
  actions: { previous, next },
  currPage,
  pageCount,
  flipPage,
}: ControlsProps) {
  // Memoize handlers for better performance
  const handlePrevClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      flipPage("previous");
    },
    [flipPage]
  );

  const handleNextClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      flipPage("next");
    },
    [flipPage]
  );

  // Calculate if buttons should be disabled
  const isPrevDisabled = currPage === 1;
  const isNextDisabled = currPage === pageCount;

  return (
    <div
      className={styles.controls}
      role='navigation'
      aria-label='Book navigation'
    >
      <StyledButton
        className={`${styles.height} ${isPrevDisabled ? styles.disabledButton : ""}`}
        isDisabled={isPrevDisabled}
        onClick={handlePrevClick}
        aria-label='Previous page'
      >
        {previous}
      </StyledButton>

      <div
        className={`${styles.pageCount} ${styles.height}`}
        aria-live='polite'
        aria-atomic='true'
      >
        <span>{currPage}</span>
        <span aria-hidden='true'>/</span>
        <span>{pageCount}</span>
      </div>

      <StyledButton
        className={`${styles.height} ${isNextDisabled ? styles.disabledButton : ""}`}
        isDisabled={isNextDisabled}
        onClick={handleNextClick}
        aria-label='Next page'
      >
        {next}
      </StyledButton>
    </div>
  );
});

export default Controls;
