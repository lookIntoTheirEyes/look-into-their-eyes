"use client";

import StyledButton from "@/components/StyledButton/StyledButton";
import { Pathnames, useRouter } from "@/i18n/routing";
import styles from "./NewCommentButton.module.css";

const NewCommentButton: React.FC<{
  text: string;
  pathname: Pathnames;
  pad?: boolean;
}> = ({ text, pathname, pad = true }) => {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push({ pathname }, { scroll: false });
  };
  return (
    <StyledButton
      className={pad ? styles.button : ""}
      center={!pad}
      onClick={handleClick}
    >
      {text}
    </StyledButton>
  );
};

NewCommentButton.displayName = "NewButton";
export default NewCommentButton;
