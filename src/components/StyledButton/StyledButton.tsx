import { motion } from "framer-motion";
import styles from "./StyledButton.module.css";

interface IProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "submit" | "reset" | "button";
  center?: boolean;
  isDisabled?: boolean;
}

const StyledButton: React.FC<IProps> = ({
  children,
  className = "",
  type = "button",
  center = true,
  isDisabled = false,
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
    >
      {children}
    </motion.button>
  );
};

export default StyledButton;
