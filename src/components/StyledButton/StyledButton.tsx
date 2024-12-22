"use client";

import { useSpring, animated } from "@react-spring/web";
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
  const red = "var(--red)";

  const [springProps, api] = useSpring(() => ({
    from: { scale: 1, backgroundColor: red },
    config: {
      tension: 300,
      friction: 10,
    },
  }));

  return (
    <animated.button
      type={type}
      className={`${className} ${styles.button} ${
        center ? styles.center : ""
      } ${isDisabled ? styles.disabled : ""}`}
      disabled={isDisabled}
      style={springProps}
      onMouseEnter={() => {
        if (!isDisabled) {
          api.start({ scale: 1.1, backgroundColor: "#b21d1d" });
        }
      }}
      onMouseLeave={() => {
        if (!isDisabled) {
          api.start({ scale: 1, backgroundColor: red });
        }
      }}
      {...props}
    >
      {children}
    </animated.button>
  );
};

export default StyledButton;
