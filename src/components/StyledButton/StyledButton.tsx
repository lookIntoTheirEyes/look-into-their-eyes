import { motion } from "framer-motion";
import styles from "./StyledButton.module.css";

interface IProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "submit" | "reset" | "button";
  center?: boolean;
  isDisabled?: boolean;
  label?: string;
}

const StyledButton: React.FC<IProps> = ({
  children,
  className = "",
  type = "button",
  center = true,
  isDisabled = false,
  label = "close",
  ...props
}) => {
  return (
    <motion.button
      whileHover={isDisabled ? {} : { backgroundColor: "#b21d1d", scale: 1.1 }}
      type={type}
      className={`${className} ${styles.button} ${
        center ? styles.center : ""
      } ${isDisabled ? styles.disabled : ""}`}
      disabled={isDisabled}
      {...props}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
};

export default StyledButton;
