import { BookActions } from "@/lib/utils/utils";
import styles from "./Controls.module.css";
import StyledButton from "@/components/StyledButton/StyledButton";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/routing";

interface ControlsProps extends BookActions {
  pageCount: number;
  flipPage: (direction: "next" | "previous") => void;
  initPageNum: number;
}

const Controls = forwardRef<
  { setCurrPage: (pageNum: number) => void },
  ControlsProps
>(({ actions: { previous, next }, pageCount, flipPage, initPageNum }, ref) => {
  useImperativeHandle(ref, () => ({
    setCurrPage(pageNum: number) {
      updatePage(pageNum);
    },
  }));

  const searchParams = useSearchParams();

  const pathname = usePathname();

  const [currPage, setCurrPage] = useState(initPageNum);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    flipPage("previous");
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const updateUrlWithSearchParams = useCallback(
    (pageNum: number) => {
      const newQuery = createQueryString("page", pageNum.toString());
      const url = `${pathname}?${newQuery}`;

      window.history.pushState(
        {
          ...window.history.state,
          as: url,
          url,
        },
        "",
        url
      );
    },
    [createQueryString, pathname]
  );

  const updatePage = useCallback(
    (pageNum: number) => {
      if (pageNum === currPage) {
        return;
      }
      setCurrPage(pageNum);
      updateUrlWithSearchParams(pageNum);
    },
    [updateUrlWithSearchParams, currPage]
  );

  useEffect(() => {
    updateUrlWithSearchParams(currPage);
  }, [currPage, updateUrlWithSearchParams]);

  return (
    <div className={styles.controls}>
      {
        <StyledButton
          className={styles.height}
          isDisabled={currPage === 1}
          onClick={handleClick}
        >
          {previous}
        </StyledButton>
      }

      <div className={`${styles.pageCount} ${styles.height}`}>
        <span>{currPage}</span>
        <span>/</span>
        <span>{pageCount}</span>
      </div>
      {
        <StyledButton
          className={styles.height}
          isDisabled={currPage === pageCount}
          onClick={() => flipPage("next")}
        >
          {next}
        </StyledButton>
      }
    </div>
  );
});

Controls.displayName = "Controls";

export default Controls;
