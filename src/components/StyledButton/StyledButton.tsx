import styles from "./StyledButton.module.css";

interface IProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const StyledButton: React.FC<IProps> = ({
  children,
  onClick,
  className = "",
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onClick();
  };

  return (
    <button className={`${className} ${styles.button}`} onClick={handleClick}>
      {children}
    </button>
  );
};

export default StyledButton;
