import styles from "./StyledButton.module.css";

interface IProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "submit" | "reset" | "button";
}

const StyledButton: React.FC<IProps> = ({
  children,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button type={type} className={`${className} ${styles.button}`} {...props}>
      {children}
    </button>
  );
};

export default StyledButton;
