"use client";

import StyledButton from "@/components/StyledButton/StyledButton";
import { Pathnames, useRouter } from "@/i18n/routing";
import styles from "./NewCommentButton.module.css";

const NewCommentButton: React.FC<{
  text: string;
  pathname: Pathnames;
}> = ({ text, pathname }) => {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push({ pathname }, { scroll: false });
  };
  return (
    <StyledButton
      className={styles.button}
      center={false}
      onClick={handleClick}
    >
      {text}
    </StyledButton>
  );
};

NewCommentButton.displayName = "NewButton";
export default NewCommentButton;
