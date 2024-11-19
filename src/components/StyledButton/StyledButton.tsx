import styles from "./StyledButton.module.css";

interface IProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "submit" | "reset" | "button";
  center?: boolean;
}

const StyledButton: React.FC<IProps> = ({
  children,
  className = "",
  type = "button",
  center = true,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${className} ${styles.button} ${center ? styles.center : ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default StyledButton;
